'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Story {
  id: string;
  title: string;
  story: string;
  createdAt: Date;
  likes?: number;
  competitionId?: string;
  authorName?: string;
  isPublished?: boolean;
}

export default function DailyChallenges() {
  const [stories, setStories] = useState<Story[]>([]);
  const [allStories, setAllStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('today');
  const [sortBy, setSortBy] = useState('newest');
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  useEffect(() => {
    loadStories();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setShowTimeDropdown(false);
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadStories = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'stories'));
      const storiesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        likes: doc.data().likes || 0,
        competitionId: doc.data().competitionId || 'micro',
        authorName: doc.data().authorName || 'Anonymous'
      })) as Story[];
      
      // Filter stories by micro fiction competition only and published stories
      const filteredStories = storiesData.filter(story => 
        story.competitionId === 'micro' && story.isPublished !== false
      );
      
      // Sort by creation date (newest first)
      filteredStories.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      // Get today's date (start of day)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Filter today's stories
      const todaysStories = filteredStories.filter(story => {
        const storyDate = new Date(story.createdAt);
        storyDate.setHours(0, 0, 0, 0);
        return storyDate.getTime() === today.getTime();
      });
      
      setAllStories(filteredStories);
      setStories(todaysStories);
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filteredStories = [...allStories];
    
    // Apply time filter
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    switch (timeFilter) {
      case 'today':
        filteredStories = filteredStories.filter(story => {
          const storyDate = new Date(story.createdAt);
          storyDate.setHours(0, 0, 0, 0);
          return storyDate.getTime() === today.getTime();
        });
        break;
      case 'week':
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filteredStories = filteredStories.filter(story => 
          story.createdAt >= weekAgo
        );
        break;
      case 'month':
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filteredStories = filteredStories.filter(story => 
          story.createdAt >= monthAgo
        );
        break;
      case 'all':
        // No filtering needed
        break;
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filteredStories.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'oldest':
        filteredStories.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;
      case 'most-liked':
        filteredStories.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
      // Remove least-liked case as it's no longer needed
    }
    
    setStories(filteredStories);
  };

  useEffect(() => {
    applyFilters();
  }, [timeFilter, sortBy, allStories]);

  // Remove toggleView function as it's no longer needed

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-warm-text text-xl font-semibold text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-2xl mb-4 warm-text-accent"
          >
            ✨
          </motion.div>
          Loading daily challenge stories...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto p-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-bold warm-text mt-10 mb-6"
          >
            {timeFilter === 'today' ? "Today's Daily Challenge Entries" :
             timeFilter === 'week' ? 'Past Week Entries' :
             timeFilter === 'month' ? 'Past Month Entries' :
             'All Daily Challenge Entries'}
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6"
          >
              {/* Time Filter Dropdown */}
              <div className="relative dropdown-container">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                  className="btn-secondary glow-on-hover flex items-center gap-2"
                >
                  <span>📅</span>
                  {timeFilter === 'today' && 'Today'}
                  {timeFilter === 'week' && 'Past Week'}
                  {timeFilter === 'month' && 'Past Month'}
                  {timeFilter === 'all' && 'All Time'}
                  <span className="text-sm">▼</span>
                </motion.button>
                
                <AnimatePresence>
                  {showTimeDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-border-color z-10"
                    >
                      <div className="py-2">
                        {[
                          { value: 'today', label: 'Today' },
                          { value: 'week', label: 'Past Week' },
                          { value: 'month', label: 'Past Month' },
                          { value: 'all', label: 'All Time' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setTimeFilter(option.value);
                              setShowTimeDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-card-hover transition-colors duration-200 ${
                              timeFilter === option.value ? 'text-warm-text font-medium' : 'text-text-secondary'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sort Dropdown */}
              <div className="relative dropdown-container">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="btn-secondary glow-on-hover flex items-center gap-2"
                >
                  <span>📊</span>
                  {sortBy === 'newest' && 'Newest First'}
                  {sortBy === 'oldest' && 'Oldest First'}
                  {sortBy === 'most-liked' && 'Most Liked'}
                  <span className="text-sm">▼</span>
                </motion.button>
                
                <AnimatePresence>
                  {showSortDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-border-color z-10"
                    >
                      <div className="py-2">
                        {[
                          { value: 'newest', label: 'Newest First' },
                          { value: 'oldest', label: 'Oldest First' },
                          { value: 'most-liked', label: 'Most Liked' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSortBy(option.value);
                              setShowSortDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-card-hover transition-colors duration-200 ${
                              sortBy === option.value ? 'text-warm-text font-medium' : 'text-text-secondary'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12"
        >
          {stories.length > 0 && (
            <motion.h3 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-2xl font-bold mb-8 warm-text"
            >
              {stories.length} {stories.length === 1 ? 'Entry' : 'Entries'}
            </motion.h3>
          )}
          
          <AnimatePresence>
            {stories.map((storyItem, index) => (
              <motion.div 
                key={storyItem.id}
                initial={{ opacity: 0, x: -50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ 
                  scale: 1.01, 
                  boxShadow: "var(--soft-shadow-hover)",
                  y: -2
                }}
                className="mb-6 p-6 card"
              >
                <Link 
                  href={`/story/${storyItem.id}`}
                  className="block cursor-pointer"
                >
                  <motion.h4 
                    whileHover={{ color: "var(--muted-amber)" }}
                    className="font-bold text-xl text-warm-text hover:text-muted-amber transition-colors duration-200 mb-2"
                  >
                    {storyItem.title}
                  </motion.h4>
                  <div className="flex items-center gap-6">
                    <p className="text-sm text-text-muted">
                      Created on {storyItem.createdAt.toLocaleDateString()}
                    </p>
                    <p className="text-sm text-text-secondary">
                      By <span className="font-medium text-warm-text">{storyItem.authorName || 'Anonymous'}</span>
                    </p>
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center gap-2 text-sm text-text-secondary"
                    >
                      <span className="text-lg">❤️</span>
                      <span>{storyItem.likes || 0} {storyItem.likes === 1 ? 'like' : 'likes'}</span>
                    </motion.div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {stories.length === 0 && !loading && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-center text-gray-500 mt-12"
            >
              <p className="text-lg mb-4">
                No daily challenge entries found for the selected filter.
              </p>
              <p className="text-base">
                Try adjusting your filters or check back later for more entries!
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 