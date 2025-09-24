'use client';

import { useState, useEffect } from "react";
import { collection, addDoc, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getDailyPrompt } from '../../lib/prompts';
import { getUserId } from '../../lib/userUtils';


import { updateUserCoins, COIN_REWARDS, checkAndAwardBadges, getUserCoins } from '../../lib/coinSystem';
import PointsNotification from '../../components/PointsNotification';
import { auth } from '../../lib/firebase';
import { hasSubmittedToday, markSubmittedToday, hasPublishedToday, markPublishedToday } from '../../lib/dailySubmissionTracker';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function WriteStory() {
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  const [showPointsNotification, setShowPointsNotification] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [notificationType, setNotificationType] = useState<'story' | 'badge'>('story');
  const [hasSubmittedTodayState, setHasSubmittedTodayState] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [submittedStoryId, setSubmittedStoryId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [dailyPrompt, setDailyPrompt] = useState(getDailyPrompt('micro'));
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const router = useRouter();

  // Listen for authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

    });
    return () => unsubscribe();
  }, []);

  // Update daily prompt at midnight
  useEffect(() => {
    const updateDailyContent = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const timeUntilMidnight = tomorrow.getTime() - now.getTime();
      
      if (timeUntilMidnight <= 0) {
        // It's past midnight, update the content
        setDailyPrompt(getDailyPrompt('micro'));
      }
    };

    updateDailyContent();
    const timer = setInterval(updateDailyContent, 60000); // Check every minute

    return () => clearInterval(timer);
  }, []);

  const checkSubmission = async () => {
    // Use authenticated user ID if available, otherwise use anonymous ID
    const userId = currentUser ? currentUser.uid : getUserId();
    if (!userId) return;
    
    try {
      // Check the daily submission tracker
      const submittedToday = await hasSubmittedToday(userId);
      if (submittedToday) {
        setHasSubmittedTodayState(true);
        setAlreadySubmitted(true);
        return;
      }
      
      // Also check database for existing published stories from today (backup)
      const storiesRef = collection(db, 'stories');
      const q = query(
        storiesRef,
        where('userId', '==', userId),
        where('competitionId', '==', 'micro')
      );
      
      const querySnapshot = await getDocs(q);
      
      // Filter results on the client side for today's date and published stories
      const todaysPublishedStories = querySnapshot.docs.filter(doc => {
        const storyData = doc.data();
        const storyDate = storyData.createdAt?.toDate() || new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        storyDate.setHours(0, 0, 0, 0);
        return storyDate.getTime() === today.getTime() && storyData.isPublished !== false;
      });
      
      if (todaysPublishedStories.length > 0) {
        // Mark as submitted in tracker for consistency
        await markSubmittedToday(userId);
      }
    } catch (error) {
      console.error('Error checking submission:', error);
    }
  };

  const debugSubmissionStatus = async () => {
    const userId = currentUser ? currentUser.uid : getUserId();
    if (!userId) return;
    
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('../../lib/firebase');
      const docRef = doc(db, 'dailySubmissions', userId);
      const docSnap = await getDoc(docRef);
      
      const today = new Date().toISOString().split('T')[0];
      console.log('🔍 Debug Info:');
      console.log('User ID:', userId);
      console.log('Today (UTC):', today);
      console.log('Document exists:', docSnap.exists());
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('Stored data:', data);
        console.log('Last submission date:', data.lastSubmissionDate);
        console.log('Has submitted today:', data.hasSubmittedToday);
        console.log('Dates match:', data.lastSubmissionDate === today);
      }
    } catch (error) {
      console.error('Debug error:', error);
    }
  };

  useEffect(() => {
    // Check submission status when user changes or on initial load
    if (currentUser) {
      debugSubmissionStatus();
      checkSubmission();
    }
  }, [currentUser]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleStoryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setStory(e.target.value);
  };



  const getWordCount = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  const handlePublish = async () => {
    setShowPublishConfirm(false);
    if (!title.trim() || !story.trim()) return;
    setIsSubmitting(true);
      
    try {
      // Get author name
      let authorName = 'Anonymous';
      
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            authorName = userData.username || userData.displayName || 'Anonymous';
          }
        } catch (error) {
          console.error('Error getting user name:', error);
        }
      }
      
      // Update the existing story to published instead of creating a new one
      if (submittedStoryId) {
        await updateDoc(doc(db, 'stories', submittedStoryId), {
          isPublished: true
        });
      } else {
        // Fallback: create new story if no submittedStoryId
        const storyRef = await addDoc(collection(db, 'stories'), {
          title: title.trim(),
          story: story.trim(),
          authorName: authorName,
          createdAt: new Date(),
          competitionId: 'micro',
          wordCount: getWordCount(story),
          promptText: dailyPrompt.text,
          promptDescription: dailyPrompt.description,
          userId: currentUser?.uid || getUserId(),
          isPublished: true
        });
      }
      
      // Mark as published today (for tracking purposes)
      const userId = currentUser?.uid || getUserId();
      if (userId) {
        await markPublishedToday(userId);
      }
      
      // Redirect to home page to see the published story
      window.location.href = '/';
    } catch (error) {
      console.error('Error publishing story:', error);
      setIsSubmitting(false);
    }
  };

  const handleSave = async () => {
    setShowSaveConfirm(false);
    if (!title.trim() || !story.trim()) return;
    setIsSubmitting(true);
    
    try {
      // Check if user has already submitted today using the tracker
      const userId = currentUser?.uid || getUserId();
      if (!userId) {
        setIsSubmitting(false);
        return;
      }
      
      const alreadySubmittedToday = await hasSubmittedToday(userId);

      let coinsEarned = 0;
      if (!alreadySubmittedToday) {
        coinsEarned = 10; // 10 coins for first story written today
      }
      
      // Get author name
      let authorName = 'Anonymous';
      
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          console.log('User doc exists:', userDoc.exists());
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('User data:', userData);
            authorName = userData.username || userData.displayName || 'Anonymous';
            console.log('Final author name:', authorName);
          }
        } catch (error) {
          console.error('Error getting user name:', error);
        }
      }
      
      // If no existing submission, proceed with creating the story
      const storyRef = await addDoc(collection(db, 'stories'), {
        title: title.trim(),
        story: story.trim(),
        authorName: authorName,
        createdAt: new Date(),
        competitionId: 'micro',
        wordCount: getWordCount(story),
        promptText: dailyPrompt.text,
        promptDescription: dailyPrompt.description,
        userId: currentUser?.uid || getUserId(), // Use authenticated user ID first
        coinsEarned: coinsEarned,
        isPublished: false // Stories are private by default
      });

      setSubmittedStoryId(storyRef.id);

      // Update user coins and check badges
      // Use authenticated user ID if available, otherwise use anonymous ID
      const currentUserId = currentUser ? currentUser.uid : getUserId();
      console.log('🎯 Current user ID for coins:', currentUserId);
      console.log('💰 Coins to be earned:', coinsEarned);
      
      if (currentUserId) {
        console.log('🪙 Updating user coins...');
        await updateUserCoins(currentUserId, coinsEarned, 'story');
        console.log('✅ User coins updated successfully');
        
        // Check for new badges
        const userCoins = await getUserCoins(currentUserId);
        if (userCoins) {
          const newBadges = await checkAndAwardBadges(currentUserId, userCoins);
          if (newBadges.length > 0) {
            console.log('New badges earned:', newBadges);
          }
        }
      }
      
      // Show points notification only if coins were earned
      if (coinsEarned > 0) {
        setPointsEarned(coinsEarned);
        setNotificationType('story');
        setShowPointsNotification(true);
      }
      
      // Mark as submitted today when they save the story
      if (userId) {
        await markSubmittedToday(userId);
      }
      
      // Show success message and publish option
      setShowSuccessMessage(true);
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error adding story:', error);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowCancelConfirm(false);
    window.location.href = '/';
  };

  const wordCount = getWordCount(story);
  const isUnderMinimum = wordCount < 100;
  const isOverLimit = wordCount > 250;

  // If user is not logged in, show login prompt
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-secondary glow-on-hover"
              >
                ← Back to Home
              </motion.button>
            </Link>
          </motion.div>

          {/* Login Prompt */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="text-6xl mb-6">✍️</div>
            <h1 className="text-4xl font-bold text-warm-text mb-4">Ready to Write Your Story?</h1>
            <p className="text-xl text-text-secondary mb-8 leading-relaxed">
              Join our community of writers and start crafting amazing stories! 
              <br />
              <span className="text-warm-text font-semibold">Login takes less than a minute</span> and all your progress is automatically saved.
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isLoggingIn}
              onClick={async () => {
                if (isLoggingIn) return; // Prevent multiple clicks
                
                setIsLoggingIn(true);
                try {
                  const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
                  const provider = new GoogleAuthProvider();
                  await signInWithPopup(auth, provider);
                  // Redirect to homepage after successful login
                  router.push('/');
                } catch (error: any) {
                  // Handle specific Firebase auth errors
                  if (error.code === 'auth/cancelled-popup-request') {
                    console.log('Login popup was cancelled');
                  } else if (error.code === 'auth/popup-closed-by-user') {
                    console.log('Login popup was closed by user');
                  } else {
                    console.error('Error signing in with Google:', error);
                  }
                } finally {
                  setIsLoggingIn(false);
                }
              }}
              className="btn-primary glow-on-hover text-lg px-8 py-4 disabled:opacity-50"
            >
              {isLoggingIn ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Signing In...
                </div>
              ) : (
                '🚀 Sign In & Start Writing'
              )}
            </motion.button>
            
            <p className="text-sm text-text-muted mt-6">
              Don't worry - you can still read all the amazing stories without logging in!
            </p>
          </motion.div>
        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-secondary glow-on-hover"
            >
              ← Back to Home
            </motion.button>
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          {alreadySubmitted && hasSubmittedTodayState ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="card p-8 soft-border bg-[#f5f1eb] border-[#d4c4a8]"
            >
              <div className="text-center space-y-4">
                <div className="text-4xl mb-4">📝</div>
                <p className="text-xl font-medium text-warm-text">You've already submitted a story today!</p>
                <p className="text-base text-text-secondary">You can write another story, but you won't earn additional points for today.</p>
                <div className="mt-6 space-y-3">
                  <Link 
                    href="/daily-challenges"
                    className="btn-secondary glow-on-hover w-full sm:w-auto block sm:inline-block"
                  >
                    View Today's Entries
                  </Link>
                  <button
                    onClick={() => {
                      setAlreadySubmitted(false);
                      setHasSubmittedTodayState(false);
                    }}
                    className="btn-primary glow-on-hover w-full sm:w-auto block sm:inline-block sm:ml-3"
                  >
                    Write Another Story
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Prompt and Word Count Box */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="card p-4 sm:p-6 soft-border mb-6 sm:mb-8"
              >
                <div className="text-center space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <p className="text-lg sm:text-xl md:text-2xl text-warm-text font-medium leading-relaxed">{dailyPrompt.text}</p>
                    {dailyPrompt.description && (
                      <p className="text-text-secondary text-xs sm:text-sm">{dailyPrompt.description}</p>
                    )}
                  </div>
                </div>
              </motion.div>



              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="space-y-4 sm:space-y-6"
              >
            <motion.div
              whileFocus={{ scale: 1.005 }}
              transition={{ duration: 0.2 }}
            >
              <label htmlFor="title" className="block text-sm font-medium text-warm-text mb-2">
                Story Title
              </label>
              <input
                id="title"
                type="text"
                className="input-field w-full p-3 placeholder-text-muted"
                value={title}
                onChange={handleTitleChange}
                placeholder="Enter your story title"
                maxLength={50}
              />
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-text-muted mt-2"
              >
                {title.length}/50 characters
              </motion.p>
            </motion.div>



            <motion.div
              whileFocus={{ scale: 1.005 }}
              transition={{ duration: 0.2 }}
            >
              <label htmlFor="story" className="block text-sm font-medium text-warm-text mb-2">
                Your Story
              </label>
              <textarea
                id="story"
                className="input-field w-full h-64 sm:h-80 md:h-96 p-3 placeholder-text-muted resize-none"
                value={story}
                onChange={handleStoryChange}
                placeholder="Write your story here... Let your imagination flow!"
                maxLength={2000} // Allow up to 250 words (avg 8 chars per word)
              />
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-sm mt-2 ${
                  isUnderMinimum ? 'text-red-500' : 
                  isOverLimit ? 'text-red-500' : 
                  'text-text-muted'
                }`}
              >
                Words: {wordCount} / 100 (min) — Max 250
                {isUnderMinimum && (
                  <span className="ml-2 font-medium">
                    (Need {100 - wordCount} more)
                  </span>
                )}
                {!isUnderMinimum && !isOverLimit && (
                  <span className="ml-2 text-green-600 font-medium">
                    ✓ Good length
                  </span>
                )}
                {isOverLimit && (
                  <span className="ml-2 font-medium">
                    ({wordCount - 250} over limit)
                  </span>
                )}
              </motion.p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6"
            >
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary glow-on-hover disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none"
                onClick={() => setShowSaveConfirm(true)}
                disabled={!title.trim() || !story.trim() || isSubmitting || isUnderMinimum || isOverLimit || alreadySubmitted}
              >
                {isSubmitting ? "Saving..." : "💾 Save Story"}
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-secondary glow-on-hover flex-1 sm:flex-none"
                onClick={() => setShowCancelConfirm(true)}
              >
                ❌ Cancel
              </motion.button>
            </motion.div>
          </motion.div>
            </>
          )}
        </motion.div>

        {/* Success Message */}
        <AnimatePresence>
          {showSuccessMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="card p-6 sm:p-8 max-w-md mx-4 text-center"
              >
                <div className="text-4xl sm:text-6xl mb-4">✅</div>
                <h3 className="text-lg sm:text-xl font-bold warm-text mb-4">Story Saved Successfully!</h3>
                <p className="text-sm sm:text-base text-text-secondary mb-6">
                  Your story has been saved! You can now publish it to share with the community.
                </p>
                <div className="flex flex-col gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary glow-on-hover w-full"
                    onClick={handlePublish}
                  >
                    🌍 Publish to Daily Challenge
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-secondary glow-on-hover w-full"
                    onClick={() => window.location.href = '/my-stories'}
                  >
                    📚 View in My Stories
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="text-text-secondary hover:text-warm-text transition-colors"
                    onClick={() => window.location.href = '/'}
                  >
                    🏠 Back to Home
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save Confirmation Modal */}
        <AnimatePresence>
          {showSaveConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="card p-8 max-w-md mx-4"
              >
                <h3 className="text-xl font-bold warm-text mb-4">Confirm Save</h3>
                <p className="text-text-secondary mb-6">
                  Are you sure you want to save your story to drafts? You can find your drafts in 'My Stories' in the profile dropdown.
                </p>
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary glow-on-hover"
                    onClick={handleSave}
                  >
                    Yes, Save Story
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-secondary glow-on-hover"
                    onClick={() => setShowSaveConfirm(false)}
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Publish Confirmation Modal */}
        <AnimatePresence>
          {showPublishConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="card p-8 max-w-md mx-4"
              >
                <h3 className="text-xl font-bold warm-text mb-4">Confirm Publish</h3>
                <p className="text-text-secondary mb-6">
                  Are you sure you want to publish your story?
                </p>
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary glow-on-hover"
                    onClick={handlePublish}
                  >
                    Yes, Publish Story
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-secondary glow-on-hover"
                    onClick={() => setShowPublishConfirm(false)}
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cancel Confirmation Modal */}
        <AnimatePresence>
          {showCancelConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="card p-8 max-w-md mx-4"
              >
                <h3 className="text-xl font-bold warm-text mb-4">Confirm Cancel</h3>
                <p className="text-text-secondary mb-6">
                  Are you sure you want to cancel writing your story?
                </p>
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary glow-on-hover"
                    onClick={handleCancel}
                  >
                    Yes, Discard Story
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-secondary glow-on-hover"
                    onClick={() => setShowCancelConfirm(false)}
                  >
                    No, Keep Writing
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Points Notification */}
        <PointsNotification
          points={pointsEarned}
          type={notificationType}
          isVisible={showPointsNotification}
          onClose={() => setShowPointsNotification(false)}
        />
      </div>
    </div>
  );
}
