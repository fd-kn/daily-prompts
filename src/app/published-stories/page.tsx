'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface Story {
  id: string;
  title: string;
  story: string;
  createdAt: Date;
  competitionId?: string;
  mode?: string;
  status?: 'draft' | 'published';
  promptText?: string;
  promptDescription?: string;
  likes?: number;
}

export default function PublishedStories() {
  const [publishedStories, setPublishedStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPublishedStories();
  }, []);

  const loadPublishedStories = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'stories'));
      const storiesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        competitionId: doc.data().competitionId || 'micro',
        mode: doc.data().mode || 'casual',
        status: doc.data().status || 'draft',
        promptText: doc.data().promptText,
        promptDescription: doc.data().promptDescription,
        likes: doc.data().likes || 0
      })) as Story[];
      
      const published = storiesData.filter(story => 
        story.mode === 'casual' && story.status === 'published'
      );
      
      published.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      setPublishedStories(published);
    } catch (error) {
      console.error('Error loading published stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStoryCard = (story: Story) => (
    <motion.div 
      key={story.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card rounded-lg p-4 shadow-lg border border-border-color flex flex-col h-full"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">📖</span>
          <span className="text-sm text-text-secondary">Casual</span>
        </div>
        <span className="text-xs text-text-muted">
          {story.likes || 0} ❤️
        </span>
      </div>
      
      <h3 className="font-semibold text-warm-text mb-2 line-clamp-2">
        {story.title || story.story.substring(0, 50) + '...'}
            </h3>
      
      <p className="text-text-secondary text-sm mb-3 line-clamp-3 flex-grow">
        {story.story}
      </p>
      
      <div className="flex items-center justify-between text-xs text-text-muted mb-3">
        <span>{story.createdAt.toLocaleDateString()}</span>
        <span>{story.story.split(/\s+/).length} words</span>
          </div>
          
      <div className="flex items-center justify-between mt-auto">
        <span className="text-sm text-text-secondary">
          Published Story
        </span>
        <Link href={`/story/${story.id}?from=published`}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-secondary text-sm px-3 py-1"
          >
            Read
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-warm-text mx-auto"></div>
          <p className="mt-4 text-warm-text">Loading stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-warm-text mb-2">📖 Published Stories</h1>
              <p className="text-text-secondary">Discover stories shared by the community</p>
            </div>
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-secondary glow-on-hover"
              >
                ← Back to Home
              </motion.button>
            </Link>
          </div>

          {/* Stories Grid */}
          {publishedStories.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {publishedStories.map((story) => renderStoryCard(story))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card p-8 soft-border text-center"
            >
              <div className="text-4xl mb-4">📖</div>
              <h3 className="text-xl font-semibold text-warm-text mb-2">No published stories yet</h3>
              <p className="text-text-secondary mb-4">
                Be the first to publish a story and share it with the community!
            </p>
              <Link href="/write-story" className="btn-primary glow-on-hover">
                Write Your First Story
              </Link>
          </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 