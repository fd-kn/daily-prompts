'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getUserProgress, calculateLevelProgress, getLevelBadgeColor, getLevelIcon } from '../lib/pointsSystem';
import { getUserId } from '../lib/userUtils';
import Link from 'next/link';

export default function PointsDisplay() {
  const [progress, setProgress] = useState<{ totalPoints: number; level: number; pointsToNextLevel: number; levelProgress: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    const userId = getUserId();
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const userProgress = await getUserProgress(userId);
      setProgress(userProgress);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !progress) {
    return (
      <div className="card p-4 soft-border">
        <div className="flex items-center gap-3">
          <div className="text-2xl">✏️</div>
          <div>
            <p className="text-sm text-text-secondary">Loading progress...</p>
          </div>
        </div>
      </div>
    );
  }

  const levelProgress = calculateLevelProgress(progress.totalPoints);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card p-4 soft-border"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{getLevelIcon(progress.currentLevel)}</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-warm-text">Level {progress.currentLevel}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelBadgeColor(progress.currentLevel)}`}>
                {progress.totalPoints} pts
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              {progress.pointsToNextLevel > 0 
                ? `${progress.pointsToNextLevel} to next level`
                : 'Max level reached!'
              }
            </p>
          </div>
        </div>
        <Link 
          href="/progress" 
          className="text-xs text-text-secondary hover:text-warm-text transition-colors"
        >
          View Details →
        </Link>
      </div>

      {/* Progress Bar */}
      <div className="mb-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${levelProgress.progressPercentage}%` }}
            transition={{ duration: 1, delay: 0.2 }}
            className="bg-gradient-primary h-2 rounded-full"
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="flex justify-between text-xs text-text-secondary">
        <span>{progress.storiesCompleted} stories</span>

      </div>
    </motion.div>
  );
} 