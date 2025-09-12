'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getUserCoins, getUserBadges, BADGE_DEFINITIONS, getBadgeColor, COIN_REWARDS } from '../../lib/coinSystem';
import { getUserId } from '../../lib/userUtils';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Link from 'next/link';

export default function ProgressPage() {
  const [userCoins, setUserCoins] = useState<any>(null);
  const [userBadges, setUserBadges] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    let coinsUnsubscribe: (() => void) | null = null;
    let badgesUnsubscribe: (() => void) | null = null;

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      
      // Clean up previous listeners
      if (coinsUnsubscribe) coinsUnsubscribe();
      if (badgesUnsubscribe) badgesUnsubscribe();
      
      if (user) {
        // User is logged in, use their Firebase UID
        loadProgress(user.uid).then((cleanup) => {
          if (cleanup) {
            const { coins, badges } = cleanup;
            coinsUnsubscribe = coins;
            badgesUnsubscribe = badges;
          }
        });
      } else {
        // User is not logged in, use anonymous ID
        const anonymousUserId = getUserId();
        if (anonymousUserId) {
          loadProgress(anonymousUserId).then((cleanup) => {
            if (cleanup) {
              const { coins, badges } = cleanup;
              coinsUnsubscribe = coins;
              badgesUnsubscribe = badges;
            }
          });
        } else {
          setLoading(false);
        }
      }
    });

    return () => {
      unsubscribe();
      if (coinsUnsubscribe) coinsUnsubscribe();
      if (badgesUnsubscribe) badgesUnsubscribe();
    };
  }, []);

  const loadProgress = async (userId: string) => {
    if (!userId) {
      setLoading(false);
      return null;
    }

    try {
      console.log('🔄 Loading progress for user:', userId);
      
      // Set up real-time listeners for coins and badges
      const coinsUnsubscribe = onSnapshot(doc(db, 'userCoins', userId), (doc) => {
        if (doc.exists()) {
          const coinsData = doc.data();
          console.log('💰 Coins updated:', coinsData);
          setUserCoins(coinsData);
        } else {
          console.log('💰 No coins data found, creating default');
          setUserCoins({
            totalCoins: 0,
            storiesCompleted: 0,
            badgesEarned: 0
          });
        }
      });

      const badgesUnsubscribe = onSnapshot(doc(db, 'userBadges', userId), (doc) => {
        if (doc.exists()) {
          const badgesData = doc.data();
          console.log('🏆 Badges updated:', badgesData);
          setUserBadges(badgesData);
        } else {
          console.log('🏆 No badges data found, creating default');
          setUserBadges({
            badges: BADGE_DEFINITIONS.map(badge => ({
              ...badge,
              earned: false,
              earnedDate: null
            }))
          });
        }
      });

      setLoading(false);

      // Return cleanup functions
      return {
        coins: coinsUnsubscribe,
        badges: badgesUnsubscribe
      };
    } catch (error) {
      console.error('Error loading progress:', error);
      setLoading(false);
      return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-warm-text mx-auto"></div>
          <p className="mt-4 text-warm-text">Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (!userCoins) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-8 soft-border text-center"
          >
            <div className="text-6xl mb-4">💰</div>
            <h1 className="text-2xl font-bold text-warm-text mb-4">Writer Progress</h1>
            <p className="text-text-secondary mb-6">Start writing stories to earn coins and unlock badges!</p>
            <Link href="/write-story" className="btn-primary glow-on-hover">
              Write Your First Story
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const earnedBadges = userBadges?.badges?.filter((badge: any) => badge.earned) || [];
  const totalBadges = BADGE_DEFINITIONS.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1"></div>
            <div className="flex-1 text-center">
              <h1 className="text-3xl font-bold text-warm-text mb-2">Writer Progress</h1>
              <p className="text-text-secondary">Track your writing journey and achievements</p>
            </div>
            <div className="flex-1 flex justify-end">
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
          </div>

          {/* Coins Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6 soft-border"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl">💰</div>
                <div>
                  <h2 className="text-xl font-semibold text-warm-text">Total Coins</h2>
                  <p className="text-text-secondary text-sm">Earn coins by writing stories and completing challenges</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-amber-600">
                {userCoins.totalCoins}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center p-3 bg-card-hover rounded-lg">
                <div className="text-2xl mb-1">📝</div>
                <p className="text-sm text-text-secondary">Stories</p>
                <p className="font-semibold text-warm-text">{userCoins.storiesCompleted}</p>
              </div>

              <div className="text-center p-3 bg-card-hover rounded-lg">
                <div className="text-2xl mb-1">🏁</div>
                <p className="text-sm text-text-secondary">Competitions</p>
                <p className="font-semibold text-warm-text">{userCoins.competitionsParticipated}</p>
              </div>
              <div className="text-center p-3 bg-card-hover rounded-lg">
                <div className="text-2xl mb-1">👑</div>
                <p className="text-sm text-text-secondary">Wins</p>
                <p className="font-semibold text-warm-text">{userCoins.competitionsWon}</p>
              </div>
            </div>
          </motion.div>

          {/* Badges Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6 soft-border"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-warm-text">Badges & Achievements</h2>
                <p className="text-text-secondary text-sm">Unlock badges by reaching milestones</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-text-secondary">Progress</p>
                <p className="font-semibold text-warm-text">{earnedBadges.length} / {totalBadges}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {BADGE_DEFINITIONS.map((badgeDef, index) => {
                const earnedBadge = earnedBadges.find((b: any) => b.id === badgeDef.id);
                const isEarned = !!earnedBadge;
                
                return (
                  <motion.div
                    key={badgeDef.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      isEarned 
                        ? `${getBadgeColor(badgeDef.category)} shadow-lg` 
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{badgeDef.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{badgeDef.name}</h3>
                        <p className="text-xs text-text-secondary">{badgeDef.description}</p>
                        {isEarned && earnedBadge.earnedDate && (
                          <p className="text-xs text-green-600 mt-1">
                            Earned {(earnedBadge.earnedDate.toDate ? earnedBadge.earnedDate.toDate() : new Date(earnedBadge.earnedDate)).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {isEarned && (
                        <div className="text-green-500">✓</div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Coin Rewards Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6 soft-border"
          >
            <h3 className="text-lg font-semibold text-warm-text mb-4">How to Earn Coins</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-card-hover rounded-lg">
                <div className="text-2xl">📝</div>
                <div>
                  <p className="font-medium text-warm-text">Complete a Story</p>
                  <p className="text-sm text-text-secondary">+{COIN_REWARDS.STORY_COMPLETION} coins</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-card-hover rounded-lg">
                <div className="text-2xl">🏁</div>
                <div>
                  <p className="font-medium text-warm-text">Participate in Competition</p>
                  <p className="text-sm text-text-secondary">+{COIN_REWARDS.COMPETITION_PARTICIPATION} coins</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-card-hover rounded-lg">
                <div className="text-2xl">👑</div>
                <div>
                  <p className="font-medium text-warm-text">Win Competition</p>
                  <p className="text-sm text-text-secondary">+{COIN_REWARDS.COMPETITION_WIN} coins</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/write-story" className="btn-primary glow-on-hover text-center">
              Write Today's Story
            </Link>
            <Link href="/daily-challenges" className="btn-secondary glow-on-hover text-center">
              View Daily Challenges
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 