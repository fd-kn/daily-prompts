'use client';

import { useEffect, useState, use } from "react";
import { doc, getDoc, updateDoc, deleteDoc, setDoc, collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { isOwnStory, clearSubmissionRecord } from '../../../lib/userUtils';
import { updateUserCoins, COIN_PENALTIES } from '../../../lib/coinSystem';
import { auth } from '../../../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

interface Story {
  id: string;
  title: string;
  story: string;
  createdAt: Date;
  competitionId?: string;
  status: string;
  publishedAt?: Date;
  mode?: string;
  promptCategory?: string;
  promptText?: string;
  promptDescription?: string;
  likes?: number;
  authorName?: string;
  userId?: string;
  isPublished?: boolean;

}

interface Comment {
  id: string;
  text: string;
  createdAt: Date;
  authorName?: string;
}

export default function StoryPage({ params }: { params: Promise<{ storyId: string }> }) {
  const { storyId } = use(params);
  const searchParams = useSearchParams();
  const fromSection = searchParams.get('from');
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editStory, setEditStory] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showSaveChangesConfirm, setShowSaveChangesConfirm] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [showUnpublishConfirm, setShowUnpublishConfirm] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<{ username?: string }>({});
  const router = useRouter();

  useEffect(() => {
    loadStory();
    if (storyId) {
      loadComments();
    }
  }, [storyId]);

  // Listen for authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Load user profile to get username
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserProfile({
              username: data.username
            });
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (editing) {
      const hasChanges = editTitle !== story?.title || editStory !== story?.story;
      setHasUnsavedChanges(hasChanges);
    }
  }, [editing, editTitle, editStory, story]);

  const loadStory = async () => {
    try {
      const docRef = doc(db, 'stories', storyId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        let authorName = data.authorName || 'Anonymous';
        
        // If author name is missing or 'Anonymous' but we have a userId, try to fetch the username
        if ((!authorName || authorName === 'Anonymous') && data.userId) {
          try {
            const userDoc = await getDoc(doc(db, 'users', data.userId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              authorName = userData.username || userData.displayName || 'Anonymous';
            }
          } catch (error) {
            console.error('Error fetching user data for author name:', error);
          }
        }
        
        setStory({
          id: docSnap.id,
          title: data.title,
          story: data.story,
          createdAt: data.createdAt?.toDate() || new Date(),
          competitionId: data.competitionId || undefined,
          status: data.status || 'draft',
          mode: data.mode || 'casual',
          promptCategory: data.promptCategory,
          promptText: data.promptText,
          promptDescription: data.promptDescription,
          likes: data.likes || 0,
          authorName: authorName,
          userId: data.userId,
          isPublished: data.isPublished || false,

        });
        setEditTitle(data.title);
        setEditStory(data.story);
        
        // Check if current user has liked this story
        if (currentUser) {
          try {
            const likeDoc = await getDoc(doc(db, 'stories', storyId, 'likes', currentUser.uid));
            setLiked(likeDoc.exists());
          } catch (error) {
            console.error('Error checking like status:', error);
            setLiked(false);
          }
        } else {
          setLiked(false);
        }
      } else {
        setStory(null);
      }
    } catch (error) {
      console.error('Error loading story:', error);
      setStory(null);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = () => {
    if (!storyId) return;
    
    const commentsQuery = query(
      collection(db, 'stories', storyId, 'comments'),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Comment[];
      setComments(commentsData);
    });
    
    return unsubscribe;
  };

  const handleSaveEdit = async () => {
    if (!story || !editTitle.trim() || !editStory.trim()) return;
    
    try {
      const docRef = doc(db, 'stories', story.id);
      await updateDoc(docRef, {
        title: editTitle.trim(),
        story: editStory.trim(),
        updatedAt: new Date()
      });
      
      setStory({
        ...story,
        title: editTitle.trim(),
        story: editStory.trim()
      });
      setEditing(false);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error updating story:', error);
    }
  };

  const handleCancelEdit = () => {
    if (hasUnsavedChanges) {
      setShowSaveConfirm(true);
    } else {
      setEditing(false);
      setEditTitle(story?.title || "");
      setEditStory(story?.story || "");
    }
  };

  const handleConfirmSave = () => {
    setShowSaveConfirm(false);
    handleSaveEdit();
  };

  const handleDiscardChanges = () => {
    setShowSaveConfirm(false);
    setEditing(false);
    setEditTitle(story?.title || "");
    setEditStory(story?.story || "");
    setHasUnsavedChanges(false);
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    if (!story) return;
    try {
      await deleteDoc(doc(db, 'stories', story.id));
      
      // If it's a daily challenge story and belongs to current user, clear submission record
      if (story.competitionId === 'micro' && story.userId && isOwnStory(story.userId)) {
        clearSubmissionRecord();
      }
      
      // Navigate back to read section
      router.push('/read');
    } catch (error) {
      console.error('Error deleting story:', error);
    }
  };

  const handlePublish = async () => {
    setShowPublishConfirm(false);
    if (!story) return;
    try {
      await updateDoc(doc(db, 'stories', story.id), {
        isPublished: true
      });
      // Reload the story to reflect the change
      loadStory();
    } catch (error) {
      console.error('Error publishing story:', error);
    }
  };

  const handleUnpublish = async () => {
    setShowUnpublishConfirm(false);
    if (!story) return;
    try {
      await updateDoc(doc(db, 'stories', story.id), {
        isPublished: false
      });
      
      // Deduct coins for unpublishing
      if (story.userId && isOwnStory(story.userId)) {
        // Use the current authenticated user ID if available, otherwise use the story's user ID
        const userId = currentUser?.uid || story.userId;
        await updateUserCoins(userId, -COIN_PENALTIES.UNPUBLISH_STORY, 'unpublish');
      }
      
      // Reload the story to reflect the change
      loadStory();
    } catch (error) {
      console.error('Error unpublishing story:', error);
    }
  };

  const handleLike = async () => {
    if (!story || !currentUser) return;
    try {
      const storyRef = doc(db, 'stories', story.id);
      const likeRef = doc(db, 'stories', story.id, 'likes', currentUser.uid);
      
      if (liked) {
        // Unlike: remove from likes subcollection and decrease count
        await deleteDoc(likeRef);
        const newLikes = Math.max((story.likes || 1) - 1, 0);
        await updateDoc(storyRef, {
          likes: newLikes
        });
        
        setStory({
          ...story,
          likes: newLikes
        });
        setLiked(false);
      } else {
        // Like: add to likes subcollection and increase count
        await setDoc(likeRef, {
          userId: currentUser.uid,
          createdAt: new Date()
        });
        const newLikes = (story.likes || 0) + 1;
        await updateDoc(storyRef, {
          likes: newLikes
        });
        
        setStory({
          ...story,
          likes: newLikes
        });
        setLiked(true);
      }
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };

  const handleComment = async () => {
    if (!story || !comment.trim()) return;
    setSubmittingComment(true);
    try {
      await addDoc(collection(db, 'stories', story.id, 'comments'), {
        text: comment.trim(),
        createdAt: new Date(),
        authorName: userProfile.username || 'Anonymous'
      });
      setComment("");
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4">⚡</div>
          <p className="text-text-secondary">Loading story...</p>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto p-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.back()}
            className="btn-secondary glow-on-hover"
          >
            ← Back
          </motion.button>
          <div className="text-center mt-8">
            <h1 className="text-2xl font-bold warm-text mb-4">Story Not Found</h1>
            <p className="text-text-secondary">The story you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto p-8">
        {/* Back Button */}
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
              if (fromSection === 'my-stories') {
                router.push('/my-stories');
              } else if (fromSection === 'personal') {
                router.push('/read?section=personal');
              } else if (fromSection === 'public') {
                router.push('/read?section=public');
              } else {
                router.push('/read');
              }
            }}
            className="btn-secondary glow-on-hover"
          >
            ← Back to {fromSection === 'my-stories' ? 'My Stories' : fromSection === 'personal' ? 'My Stories' : fromSection === 'public' ? 'Read Section' : 'Read Section'}
          </motion.button>
        </motion.div>

        {/* Story Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`p-8 mb-8 ${story.status === 'published' ? '' : 'card soft-border'}`}
        >
          {editing ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
                              {story.promptText && (
                  <div className="mb-6 p-4 text-center">
                    <p className="text-warm-text text-xl font-bold">{story.promptText}</p>
                    {story.promptDescription && (
                      <p className="text-md text-text-muted mt-2">{story.promptDescription}</p>
                    )}
                    {story.competitionId && story.competitionId !== 'micro' && (
                      <p className="text-sm text-text-secondary mt-3">
                        {story.competitionId === 'flash' ? 'Flash Fiction' : 
                         story.competitionId === 'short' ? 'Short Story' : 
                         story.competitionId === 'novella' ? 'Novella' : 
                         story.competitionId} - {
                          story.competitionId === 'flash' ? '300' : 
                          story.competitionId === 'short' ? '1000' : 
                          story.competitionId === 'novella' ? '5000' : 
                          'words'
                        } words
                      </p>
                    )}
                  </div>
                )}
              <input
                type="text"
                className="input-field w-full p-3 mb-6 text-2xl font-bold"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter your story title"
                maxLength={50}
              />
              <textarea
                className="input-field w-full h-96 p-3 resize-none mb-6"
                value={editStory}
                onChange={(e) => setEditStory(e.target.value)}
                placeholder="Write your story here"
              />
              <div className="flex gap-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary glow-on-hover"
                  onClick={() => setShowSaveChangesConfirm(true)}
                  disabled={!editTitle.trim() || !editStory.trim()}
                >
                  Save Changes
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-secondary glow-on-hover"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Metadata Section */}
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold warm-text mb-3">
                    {story.title}
                  </h1>
                  <div className="flex items-center gap-4 mb-2">
                    <p className="text-text-secondary">
                      {story.status === 'published' ? 'Published' : 'Created'} on {story.createdAt.toLocaleDateString()} at {story.createdAt.toLocaleTimeString()}
                    </p>
                    {story.status === 'draft' && story.competitionId !== 'micro' && (
                      <span className="bg-gradient-secondary text-warm-text px-2 py-1 rounded-full text-sm font-medium">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="text-text-secondary text-sm">
                    By <span className="font-medium text-warm-text">{story.authorName || 'Anonymous'}</span>
                  </p>
                </div>
                {/* Action buttons for personal stories - only show when viewing from My Stories section */}
                {story.userId && isOwnStory(story.userId) && (fromSection === 'personal' || fromSection === 'my-stories') && (
                  <div className="flex gap-3">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn-secondary glow-on-hover"
                        onClick={() => setEditing(true)}
                      >
                        Edit
                      </motion.button>
                    
                    {/* Publish/Unpublish button */}
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`px-4 py-2 rounded-md shadow-sm font-semibold transition-all duration-200 ${
                        story.isPublished 
                          ? 'bg-gradient-secondary text-warm-text hover:opacity-90' 
                          : 'btn-primary glow-on-hover'
                      }`}
                      onClick={() => story.isPublished ? setShowUnpublishConfirm(true) : setShowPublishConfirm(true)}
                    >
                      {story.isPublished ? 'Unpublish' : 'Publish'}
                    </motion.button>
                    
                    {/* Delete button */}
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-red-600 text-white px-4 py-2 rounded-md shadow-sm font-semibold transition-all duration-200 hover:bg-red-700"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      Delete
                    </motion.button>
                  </div>
                )}

              </div>

              {/* Prompt Section */}
              {story.promptText && (
                <div className="">
                  <div className="p-6 bg-card-hover rounded-lg text-center">
                    <p className="text-warm-text font-bold text-xl">{story.promptText}</p>
                    {story.promptDescription && (
                      <p className="text-sm text-text-muted mt-3">{story.promptDescription}</p>
                    )}
                    {story.competitionId && story.competitionId !== 'micro' && (
                      <p className="text-sm text-text-secondary mt-3">
                        {story.competitionId === 'flash' ? 'Flash Fiction' : 
                         story.competitionId === 'short' ? 'Short Story' : 
                         story.competitionId === 'novella' ? 'Novella' : 
                         story.competitionId} - {
                          story.competitionId === 'flash' ? '300' : 
                          story.competitionId === 'short' ? '1000' : 
                          story.competitionId === 'novella' ? '5000' : 
                          'words'
                        } words
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Story Content Section */}
              <div className="">
                <div className="prose max-w-none">
                  <div className={`whitespace-pre-wrap text-lg leading-relaxed text-warm-text p-6 rounded-lg shadow-sm`}>
                    {story.story}
                  </div>
                </div>
              </div>
              
              {/* Show likes and comments for all published stories */}
              {story.isPublished && (
                <div className="mt-8 pt-6 border-t border-border-color">
                  <div className="flex items-center gap-6 mb-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLike}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors duration-200 text-sm ${
                        liked ? 'text-red-500 bg-red-50' : 'text-text-muted hover:text-red-500'
                      }`}
                    >
                      <span className="text-lg">{liked ? '❤️' : '🤍'}</span>
                      <span className="font-medium">{story.likes || 0} {story.likes === 1 ? 'like' : 'likes'}</span>
                    </motion.button>
                    
                    <div className="flex items-center gap-2 text-text-muted text-sm">
                      <span className="text-lg">💬</span>
                      <span className="font-medium">Comment</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 input-field text-sm"
                        maxLength={200}
                      />
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleComment}
                        disabled={!comment.trim() || submittingComment}
                        className="btn-secondary glow-on-hover text-sm px-3 py-2"
                      >
                        {submittingComment ? 'Posting...' : 'Post'}
                      </motion.button>
                    </div>
                  </div>
                  
                  {comments.length > 0 && (
                    <div className="mt-6 space-y-4">
                      <h4 className="text-base font-semibold warm-text">Comments ({comments.length})</h4>
                      <div className="space-y-3">
                        {comments.map((commentItem) => (
                          <motion.div
                            key={commentItem.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 bg-card-hover rounded-lg border border-border-color"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-bold text-warm-text text-sm">
                                {commentItem.authorName || 'Anonymous'}
                              </span>
                              <span className="text-xs text-text-muted">
                                {commentItem.createdAt.toLocaleDateString()} at {commentItem.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-warm-text text-sm">{commentItem.text}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
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
                <h3 className="text-xl font-bold warm-text mb-4">Confirm Delete</h3>
                <p className="text-text-secondary mb-6">
                  Are you sure you want to delete this story? <br/> 
                  <span className="font-semibold">This action cannot be undone.</span>
                </p>
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-secondary glow-on-hover"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-red-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-700"
                    onClick={handleDelete}
                  >
                    Yes, Delete
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save Changes Confirmation Modal */}
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
                <h3 className="text-xl font-bold warm-text mb-4">Save Changes?</h3>
                <p className="text-text-secondary mb-6">
                  You have unsaved changes. Would you like to save them before exiting?
                </p>
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-secondary glow-on-hover"
                    onClick={handleDiscardChanges}
                  >
                    Discard Changes
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary glow-on-hover"
                    onClick={handleConfirmSave}
                  >
                    Save Changes
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save Changes Button Confirmation Modal */}
        <AnimatePresence>
          {showSaveChangesConfirm && (
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
                <h3 className="text-xl font-bold warm-text mb-4">Confirm Save Changes</h3>
                <p className="text-text-secondary mb-6">
                  Are you sure you want to save these changes to your draft?
                </p>
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-secondary glow-on-hover"
                    onClick={() => setShowSaveChangesConfirm(false)}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary glow-on-hover"
                    onClick={() => {
                      setShowSaveChangesConfirm(false);
                      handleSaveEdit();
                    }}
                  >
                    Yes, Save Changes
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
                  Are you sure you want to publish this story? It will be visible to everyone in the community.
                </p>
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-secondary glow-on-hover"
                    onClick={() => setShowPublishConfirm(false)}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary glow-on-hover"
                    onClick={handlePublish}
                  >
                    Yes, Publish
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unpublish Confirmation Modal */}
        <AnimatePresence>
          {showUnpublishConfirm && (
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
                <h3 className="text-xl font-bold warm-text mb-4">Confirm Unpublish</h3>
                <p className="text-text-secondary mb-4">
                  Are you sure you want to unpublish this story? It will no longer be visible to the community.
                </p>
                <p className="text-orange-600 text-sm mb-6 font-medium">
                  ⚠️ This action will deduct 5 coins from your balance.
                </p>
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-secondary glow-on-hover"
                    onClick={() => setShowUnpublishConfirm(false)}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-yellow-700"
                    onClick={handleUnpublish}
                  >
                    Yes, Unpublish
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
