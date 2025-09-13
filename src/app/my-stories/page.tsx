'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { getUserId } from '../../lib/userUtils';
import { updateUserCoins, COIN_PENALTIES } from '../../lib/coinSystem';
import { onAuthStateChanged, User } from 'firebase/auth';
import Link from 'next/link';

interface Story {
  id: string;
  title: string;
  story: string;
  createdAt: Date;
  competitionId: string;
  wordCount: number;
  isPublished: boolean;
  promptCategory?: string;
  promptText?: string;
}

export default function MyStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'private' | 'published'>('private');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [modeFilter, setModeFilter] = useState<string>('all');
  const [deletingStory, setDeletingStory] = useState<string | null>(null);
  const [editingStory, setEditingStory] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editStory, setEditStory] = useState('');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showUnpublishModal, setShowUnpublishModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionStoryId, setActionStoryId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    console.log('🔐 Setting up auth listener...');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔐 Auth state changed:', user ? 'Authenticated' : 'Not authenticated');
      console.log('👤 User UID:', user?.uid);
      setCurrentUser(user);
      
      if (user) {
        console.log('✅ User authenticated, loading stories with Firebase UID');
        loadStories(user.uid);
      } else {
        console.log('👤 User not authenticated, using anonymous ID');
        // If not authenticated, use anonymous ID
        const anonymousUserId = getUserId();
        console.log('🆔 Anonymous user ID:', anonymousUserId);
        if (anonymousUserId) {
          loadStories(anonymousUserId);
        } else {
          console.log('❌ No anonymous user ID found');
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const loadStories = async (userId?: string) => {
    const targetUserId = userId || getUserId();
    console.log('🔍 Loading stories for user ID:', targetUserId);
    console.log('👤 Current user:', currentUser?.uid);
    
    if (!targetUserId) {
      console.log('❌ No target user ID found');
      setLoading(false);
      return;
    }

    // Also try to load stories for the anonymous ID as a fallback
    const anonymousUserId = getUserId();
    console.log('🆔 Fallback anonymous user ID:', anonymousUserId);

    try {
      const storiesRef = collection(db, 'stories');
      let querySnapshot;
      
      // Always try to load stories for the target user ID first
      const q1 = query(storiesRef, where('userId', '==', targetUserId));
      const snapshot1 = await getDocs(q1);
      console.log('📚 Found', snapshot1.docs.length, 'stories for target user ID');
      
      // If we have stories for the target user ID, use those
      if (snapshot1.docs.length > 0) {
        console.log('✅ Found stories for target user ID, using those');
        querySnapshot = snapshot1;
      } else {
        // If no stories found for target user ID, try anonymous ID as fallback
        console.log('❌ No stories found for target user ID, trying anonymous ID');
        if (anonymousUserId && anonymousUserId !== targetUserId) {
          const q2 = query(storiesRef, where('userId', '==', anonymousUserId));
          const snapshot2 = await getDocs(q2);
          console.log('📚 Found', snapshot2.docs.length, 'stories for anonymous user ID');
          querySnapshot = snapshot2;
        } else {
          console.log('❌ No anonymous user ID or same as target, using empty result');
          querySnapshot = snapshot1; // Empty result
        }
      }
      
      const loadedStories: Story[] = [];
      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        console.log('📖 Loading story:', doc.id, 'with userId:', data.userId);
        loadedStories.push({
          id: doc.id,
          title: data.title,
          story: data.story,
          createdAt: data.createdAt?.toDate() || new Date(),
          competitionId: data.competitionId || 'daily',
          wordCount: data.wordCount || 0,
          isPublished: data.isPublished || false,
          promptCategory: data.promptCategory,
          promptText: data.promptText
        });
      });

      // Sort by creation date (newest first)
      loadedStories.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      console.log('📚 Final loaded stories count:', loadedStories.length);
      setStories(loadedStories);
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    if (!confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
      return;
    }

    setDeletingStory(storyId);
    try {
      await deleteDoc(doc(db, 'stories', storyId));
      setStories(prev => prev.filter(story => story.id !== storyId));
    } catch (error) {
      console.error('Error deleting story:', error);
    } finally {
      setDeletingStory(null);
    }
  };

  const handleTogglePublish = async (storyId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'stories', storyId), {
        isPublished: !currentStatus
      });
      
      // If unpublishing, deduct coins
      if (currentStatus) {
        // Always use the authenticated user ID if available, otherwise use anonymous ID
        const userId = currentUser?.uid || getUserId();
        
        if (userId) {
          try {
            await updateUserCoins(userId, -COIN_PENALTIES.UNPUBLISH_STORY, 'unpublish');
          } catch (error) {
            console.error('❌ Error during coin deduction:', error);
          }
        }
      }
      
      setStories(prev => prev.map(story => 
        story.id === storyId 
          ? { ...story, isPublished: !currentStatus }
          : story
      ));
    } catch (error) {
      console.error('Error updating story:', error);
    }
  };

  const handleEditStory = (story: Story) => {
    setEditingStory(story.id);
    setEditTitle(story.title);
    setEditStory(story.story);
  };

  const handleSaveEdit = async (storyId: string) => {
    try {
      await updateDoc(doc(db, 'stories', storyId), {
        title: editTitle.trim(),
        story: editStory.trim(),
        wordCount: editStory.trim().split(/\s+/).length
      });
      
      setStories(prev => prev.map(story => 
        story.id === storyId 
          ? { 
              ...story, 
              title: editTitle.trim(), 
              story: editStory.trim(),
              wordCount: editStory.trim().split(/\s+/).length
            }
          : story
      ));
      
      setEditingStory(null);
      setEditTitle('');
      setEditStory('');
    } catch (error) {
      console.error('Error updating story:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingStory(null);
    setEditTitle('');
    setEditStory('');
  };

  const handlePublishClick = (storyId: string) => {
    setActionStoryId(storyId);
    setShowPublishModal(true);
  };

  const handleUnpublishClick = (storyId: string) => {
    setActionStoryId(storyId);
    setShowUnpublishModal(true);
  };

  const handleDeleteClick = (storyId: string) => {
    setActionStoryId(storyId);
    setShowDeleteModal(true);
  };

  const confirmPublish = async () => {
    if (actionStoryId) {
      await handleTogglePublish(actionStoryId, false);
      setShowPublishModal(false);
      setActionStoryId(null);
    }
  };

  const confirmUnpublish = async () => {
    if (actionStoryId) {
      await handleTogglePublish(actionStoryId, true);
      setShowUnpublishModal(false);
      setActionStoryId(null);
    }
  };

  const confirmDelete = async () => {
    if (actionStoryId) {
      await handleDeleteStory(actionStoryId);
      setShowDeleteModal(false);
      setActionStoryId(null);
    }
  };

  const getModeLabel = (competitionId: string) => {
    switch (competitionId) {
      case 'micro': return 'Daily Challenge';
      case 'competition': return 'Competition';
      default: return 'Special Mode';
    }
  };

  const getModeIcon = (competitionId: string) => {
    switch (competitionId) {
      case 'micro': return '📝';
      case 'competition': return '🏁';
      default: return '✨';
    }
  };

  const filteredStories = stories.filter(story => {
    // Filter by publication status
    if (activeTab === 'private' && story.isPublished) return false;
    if (activeTab === 'published' && !story.isPublished) return false;

    // Filter by date
    if (dateFilter !== 'all') {
      const storyDate = story.createdAt.toDateString();
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toDateString();

      switch (dateFilter) {
        case 'today':
          if (storyDate !== today) return false;
          break;
        case 'yesterday':
          if (storyDate !== yesterday) return false;
          break;
        case 'week':
          if (story.createdAt < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) return false;
          break;
      }
    }

    // Filter by mode
    if (modeFilter !== 'all') {
      if (modeFilter === 'daily' && story.competitionId !== 'micro') return false;
      if (modeFilter === 'competition' && story.competitionId !== 'competition') return false;
      if (modeFilter === 'special' && story.competitionId === 'micro') return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-warm-text mx-auto"></div>
          <p className="mt-4 text-warm-text">Loading your stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 sm:mb-8"
        >
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-secondary glow-on-hover text-sm sm:text-base"
            >
              ← Back to Home
            </motion.button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 sm:space-y-6"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-warm-text mb-2">My Stories</h1>
              <p className="text-sm sm:text-base text-text-secondary">
                Manage your stories and track your writing progress
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = '/write-story'}
                className="btn-primary glow-on-hover text-xs sm:text-sm py-2 px-3 sm:px-4"
              >
                ✍️ New Story
              </motion.button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center">
            <div className="card p-1 w-full max-w-md">
              <div className="flex">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab('private')}
                  className={`flex-1 px-3 sm:px-6 py-2 sm:py-3 rounded-md font-medium transition-all duration-200 text-sm sm:text-base ${
                    activeTab === 'private'
                      ? 'bg-gradient-primary text-warm-white shadow-sm'
                      : 'text-text-secondary hover:text-warm-text'
                  }`}
                >
                  Private ({stories.filter(s => !s.isPublished).length})
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab('published')}
                  className={`flex-1 px-3 sm:px-6 py-2 sm:py-3 rounded-md font-medium transition-all duration-200 text-sm sm:text-base ${
                    activeTab === 'published'
                      ? 'bg-gradient-primary text-warm-white shadow-sm'
                      : 'text-text-secondary hover:text-warm-text'
                  }`}
                >
                  Published ({stories.filter(s => s.isPublished).length})
                </motion.button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full p-2 sm:p-3 border border-border-color rounded-lg bg-background text-warm-text text-sm sm:text-base"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">This Week</option>
              </select>
            </div>
            <div className="flex-1">
              <select
                value={modeFilter}
                onChange={(e) => setModeFilter(e.target.value)}
                className="w-full p-2 sm:p-3 border border-border-color rounded-lg bg-background text-warm-text text-sm sm:text-base"
              >
                <option value="all">All Modes</option>
                <option value="daily">Daily Challenge</option>
                <option value="competition">Competition</option>
                <option value="special">Special Mode</option>
              </select>
            </div>
          </div>

          {/* Stories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredStories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card p-4 sm:p-6 soft-border hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-xl">{getModeIcon(story.competitionId)}</span>
                    <span className="text-xs sm:text-sm text-text-secondary">{getModeLabel(story.competitionId)}</span>
                  </div>
                  <span className="text-xs text-text-muted">
                    {story.createdAt.toLocaleDateString()}
                  </span>
                </div>

                {editingStory === story.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full p-2 border border-border-color rounded bg-background text-warm-text text-sm"
                      placeholder="Story title"
                    />
                    <textarea
                      value={editStory}
                      onChange={(e) => setEditStory(e.target.value)}
                      className="w-full p-2 border border-border-color rounded bg-background text-warm-text text-sm h-24 resize-none"
                      placeholder="Story content"
                    />
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSaveEdit(story.id)}
                        className="btn-primary glow-on-hover text-xs py-1 px-3"
                      >
                        Save
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCancelEdit}
                        className="btn-secondary glow-on-hover text-xs py-1 px-3"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="font-bold text-lg sm:text-xl mb-2 text-warm-text line-clamp-2">{story.title}</h3>
                    <p className="text-text-secondary text-sm sm:text-base mb-3 line-clamp-3">{story.story}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs sm:text-sm text-text-muted">{story.wordCount} words</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        story.isPublished 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {story.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => window.location.href = `/story/${story.id}?from=my-stories`}
                        className="btn-primary glow-on-hover text-xs sm:text-sm py-2 px-3 flex-1"
                      >
                        View
                      </motion.button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>

          {filteredStories.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl sm:text-6xl mb-4">📚</div>
              <h3 className="text-lg sm:text-xl font-bold text-warm-text mb-2">No stories found</h3>
              <p className="text-text-secondary mb-6 text-sm sm:text-base">
                {activeTab === 'private' 
                  ? "You don't have any private stories yet." 
                  : "You haven't published any stories yet."
                }
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = '/write-story'}
                className="btn-primary glow-on-hover text-sm sm:text-base"
              >
                Write Your First Story
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Confirmation Modals */}
      {/* Publish Confirmation Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold text-warm-text mb-4">Publish Story</h3>
            <p className="text-text-secondary mb-6">
              Are you sure you want to publish this story? It will be visible to the community.
            </p>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={confirmPublish}
                className="btn-primary flex-1"
              >
                Publish
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPublishModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Unpublish Confirmation Modal */}
      {showUnpublishModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold text-warm-text mb-4">Unpublish Story</h3>
            <p className="text-text-secondary mb-6">
              Are you sure you want to unpublish this story? It will no longer be visible to the community.
            </p>
            <p className="text-orange-600 text-sm mb-6 font-medium">
              ⚠️ This action will deduct 5 coins from your balance.
            </p>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={confirmUnpublish}
                className="btn-secondary text-orange-600 flex-1"
              >
                Unpublish (-5 coins)
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowUnpublishModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold text-warm-text mb-4">Delete Story</h3>
            <p className="text-text-secondary mb-6">
              Are you sure you want to delete this story? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={confirmDelete}
                className="btn-secondary text-red-600 flex-1"
              >
                Delete
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 