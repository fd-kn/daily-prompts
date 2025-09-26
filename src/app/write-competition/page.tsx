'use client';

import { useState, useEffect, useCallback } from "react";
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { auth } from '../../lib/firebase';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface Competition {
  id: string;
  name: string;
  wordLimit: number;
  description: string;
}

const competitions: { [key: string]: Competition } = {
  flash: {
    id: 'flash',
    name: 'Flash Fiction',
    wordLimit: 300,
    description: 'Quick, impactful stories'
  },
  short: {
    id: 'short',
    name: 'Short Story',
    wordLimit: 1000,
    description: 'Traditional short stories'
  },
  novella: {
    id: 'novella',
    name: 'Novella',
    wordLimit: 5000,
    description: 'Longer narratives'
  }
};


export default function WriteCompetition() {
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const genre = searchParams.get('genre');
  const competitionId = searchParams.get('competition');
  const mode = searchParams.get('mode');
  const promptText = searchParams.get('prompt');
  const promptCategory = searchParams.get('category');
  const promptDescription = searchParams.get('description');
  
  const competition = competitionId ? competitions[competitionId] : null;
  const prompt = promptText ? { 
    text: promptText, 
    category: promptCategory || 'General',
    description: promptDescription 
  } : null;

  useEffect(() => {
    if (mode === 'timed' && competition) {
      // Set deadline to 7 days from now
      const deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + 7);
      setDeadline(deadlineDate);
    }
  }, [mode, competition]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleStoryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setStory(e.target.value);
  };

  const getWordCount = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  const hasUnsavedChanges = () => {
    return mode === 'casual' && (title.trim() || story.trim());
  };

  const handleSaveDraft = async () => {
    if (!title.trim() || !competition) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'stories'), {
        title: title.trim(),
        story: story.trim(),
        createdAt: new Date(),
        competitionId: competition.id,
        wordCount: getWordCount(story),
        promptCategory: prompt?.category,
        promptText: prompt?.text,
        promptDescription: prompt?.description,
        mode: mode,
        genre: prompt?.category,
        status: 'draft'
      });
      
      setShowSaveDraftModal(false);
      if (pendingNavigation) {
        router.push(pendingNavigation);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      setIsSubmitting(false);
    }
  };

  const handleDiscardChanges = () => {
    setShowSaveDraftModal(false);
    if (pendingNavigation) {
      router.push(pendingNavigation);
    }
  };

  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    if (hasUnsavedChanges()) {
      e.preventDefault();
      e.returnValue = '';
    }
  }, [title, story, mode]);

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [handleBeforeUnload]);

  const handleSubmit = async () => {
    setShowConfirm(false);
    if (!title.trim() || !story.trim() || !competition) return;
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

      await addDoc(collection(db, 'stories'), {
        title: title.trim(),
        story: story.trim(),
        authorName: authorName,
        userId: auth.currentUser?.uid || null,
        createdAt: new Date(),
        competitionId: competition.id,
        wordCount: getWordCount(story),
        promptCategory: prompt?.category,
        promptText: prompt?.text,
        promptDescription: prompt?.description,
        mode: mode,
        deadline: deadline,
        genre: genre,
        status: 'draft'
      });
      
        router.push('/competitions');
    } catch (error) {
      console.error('Error adding story:', error);
      setIsSubmitting(false);
    }
  };

  const wordCount = getWordCount(story);
  const isOverLimit = competition ? wordCount > competition.wordLimit : false;

  if (!competition || !mode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold warm-text mb-4">Invalid Competition</h1>
          <p className="text-text-secondary mb-6">Please select a valid competition from the competitions page.</p>
          <Link href="/competitions">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary glow-on-hover"
            >
              Go to Competitions
            </motion.button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto p-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (hasUnsavedChanges()) {
                setPendingNavigation('/competitions');
                setShowSaveDraftModal(true);
              } else {
                router.push('/competitions');
              }
            }}
            className="btn-secondary glow-on-hover"
          >
            ← Back to Competitions
          </motion.button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          {/* Word Limit */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center"
          >
            <p className="text-muted-amber font-medium text-lg">{competition.wordLimit} words</p>
              </motion.div>

          {/* Prompt Section */}
            {prompt && (
              <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="card p-6 soft-border mb-8"
              >
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <p className="text-xl text-warm-text font-medium">{prompt.text}</p>
                  {prompt.description && (
                    <p className="text-text-secondary text-sm">{prompt.description}</p>
                  )}
                </div>
              </div>
              </motion.div>
            )}

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6"
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
                className="input-field w-full h-96 p-3 placeholder-text-muted resize-none"
                value={story}
                onChange={handleStoryChange}
                placeholder="Write your story here... Let your imagination flow!"
                maxLength={10000} // Higher limit for longer stories
              />
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-sm mt-2 ${isOverLimit ? 'text-red-500' : 'text-text-muted'}`}
              >
                {wordCount}/{competition.wordLimit} words
                {isOverLimit && (
                  <span className="ml-2 font-medium">
                    ({wordCount - competition.wordLimit} words over limit)
                  </span>
                )}
              </motion.p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex gap-4 pt-6"
            >
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary glow-on-hover disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setShowConfirm(true)}
                disabled={!title.trim() || !story.trim() || isSubmitting || isOverLimit}
              >
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    Saving...
                  </motion.div>
                ) : (
                    'Save as Draft'
                )}
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-secondary glow-on-hover"
                onClick={() => router.back()}
              >
                Cancel
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>

      {/* Confirmation Modal */}
        <AnimatePresence>
      {showConfirm && (
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
                <h3 className="text-xl font-bold warm-text mb-4">
                  {mode === 'casual' ? 'Save Draft' : 'Confirm Submission'}
                </h3>
                <p className="text-text-secondary mb-6">
              {mode === 'casual' 
                    ? 'Are you sure you want to save this as a draft? You can edit it later.'
                    : 'Are you sure you want to save this story as a draft?'
              }
            </p>
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary glow-on-hover"
                    onClick={handleSubmit}
                  >
                    Yes, Save Draft
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-secondary glow-on-hover"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save Draft Modal */}
        <AnimatePresence>
          {showSaveDraftModal && (
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
                <h3 className="text-xl font-bold warm-text mb-4">
                  Save Your Progress?
                </h3>
                <p className="text-text-secondary mb-6">
                  You have unsaved changes. Would you like to save your story as a draft before leaving?
                </p>
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary glow-on-hover disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSaveDraft}
                    disabled={!title.trim() || isSubmitting}
              >
                    {isSubmitting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        Saving...
                      </motion.div>
                    ) : (
                      'Save as Draft'
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-secondary glow-on-hover"
                    onClick={handleDiscardChanges}
                  >
                    Discard Changes
                  </motion.button>
            </div>
                {!title.trim() && (
                  <p className="text-red-500 text-sm mt-4 text-center">
                    Please enter a title to save as draft
                  </p>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
    </div>
  );
} 