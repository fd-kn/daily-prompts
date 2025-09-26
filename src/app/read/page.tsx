'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import Link from 'next/link';
import { onAuthStateChanged } from 'firebase/auth';

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
  authorName?: string;
  likes?: number;
}

export default function ReadPage() {
  const [publicStories, setPublicStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [modeFilter, setModeFilter] = useState<string>('all');
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      loadStories();
    });

    return () => unsubscribe();
  }, []);

  const loadStories = async () => {
    try {
      // Load public stories
      const publicQuery = query(
        collection(db, 'stories'),
        where('isPublished', '==', true)
      );
      const publicSnapshot = await getDocs(publicQuery);
      
      const loadedPublicStories: Story[] = [];
      publicSnapshot.forEach((doc) => {
        const data = doc.data();
        loadedPublicStories.push({
          id: doc.id,
          title: data.title,
          story: data.story,
          createdAt: data.createdAt?.toDate() || new Date(),
          competitionId: data.competitionId || 'daily',
          wordCount: data.wordCount || 0,
          isPublished: data.isPublished || false,
          promptCategory: data.promptCategory,
          promptText: data.promptText,
          authorName: data.authorName || 'Anonymous',
          likes: data.likes || 0
        });
      });
      // Sort by creation date (newest first)
      loadedPublicStories.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setPublicStories(loadedPublicStories);
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
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

  const filterPublicStories = (stories: Story[]) => {
    return stories.filter(story => {
      // Filter by date
      if (dateFilter !== 'all') {
        const storyDate = story.createdAt.toDateString();
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

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
          case 'month':
            if (story.createdAt < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) return false;
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
  };

  const filteredPublicStories = filterPublicStories(publicStories);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-warm-text mx-auto"></div>
          <p className="mt-3 text-warm-text text-sm">Loading stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 sm:space-y-4"
        >
          {/* Back Button - Mobile: Top left, Desktop: Top right */}
          <div className="flex justify-start sm:justify-end">
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-secondary glow-on-hover text-xs sm:text-sm py-1.5 px-3"
              >
                ← Back to Home
              </motion.button>
            </Link>
          </div>

          {/* Header - Centered on mobile, left-aligned on desktop */}
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-bold text-warm-text mb-1">📚 Read Stories</h1>
            <p className="text-xs sm:text-sm text-text-secondary">Discover amazing stories from the community</p>
          </div>

          {/* Public Stories Section - Now the main content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* Filters - Mobile responsive */}
            <div className="bg-card p-2 sm:p-3 rounded-lg">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-warm-text mb-1">📅 Date</label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full bg-background border border-border-color rounded-lg px-2 py-1.5 text-warm-text text-xs sm:text-sm"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="week">Past Week</option>
                    <option value="month">Past Month</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-warm-text mb-1">🎯 Mode</label>
                  <select
                    value={modeFilter}
                    onChange={(e) => setModeFilter(e.target.value)}
                    className="w-full bg-background border border-border-color rounded-lg px-2 py-1.5 text-warm-text text-xs sm:text-sm"
                  >
                    <option value="all">All Modes</option>
                    <option value="daily">Daily Challenge</option>
                    <option value="competition">Competition</option>
                    <option value="special">Special Modes</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Stories Grid - Mobile responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredPublicStories.map((story) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="card p-4 sm:p-6 soft-border hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg sm:text-xl">{getModeIcon(story.competitionId)}</span>
                      <span className="text-xs sm:text-sm text-text-secondary">{getModeLabel(story.competitionId)}</span>
                    </div>
                    <span className="text-xs text-text-muted">
                      {story.likes || 0} ❤️
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-lg sm:text-xl mb-2 text-warm-text line-clamp-2">
                    {story.title || story.story.substring(0, 50) + '...'}
                  </h3>
                  
                  <p className="text-text-secondary text-sm sm:text-base mb-3 line-clamp-3 flex-grow">
                    {story.story}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs sm:text-sm text-text-muted mb-3">
                    <span>{story.createdAt.toLocaleDateString()}</span>
                    <span>{story.wordCount} words</span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs sm:text-sm text-text-secondary">
                      By {story.authorName}
                    </span>
                    <Link href={`/story/${story.id}?from=public`}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn-primary glow-on-hover text-xs sm:text-sm py-2 px-3"
                      >
                        Read
                      </motion.button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredPublicStories.length === 0 && (
              <div className="text-center py-6 sm:py-8">
                <div className="text-3xl sm:text-4xl mb-3">🙁</div>
                <p className="text-text-secondary text-xs sm:text-sm">No public stories found with the current filters.</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 