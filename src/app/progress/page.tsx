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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 sm:p-8 soft-border text-center"
          >
            <div className="text-4xl sm:text-6xl mb-4">💰</div>
            <h1 className="text-xl sm:text-2xl font-bold text-warm-text mb-4">Writer Progress</h1>
            <p className="text-sm sm:text-base text-text-secondary mb-6">Start writing stories to earn coins and unlock badges!</p>
            <Link href="/write-story" className="btn-primary glow-on-hover text-sm sm:text-base">
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 sm:space-y-6"
        >
          {/* Header - Mobile responsive */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-warm-text mb-2">Writer Progress</h1>
            <p className="text-sm sm:text-base text-text-secondary">Track your writing journey and achievements</p>
          </div>

          {/* Coins Card - Mobile responsive */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-4 sm:p-6 soft-border"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="text-3xl sm:text-4xl">💰</div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-warm-text">Total Coins</h2>
                  <p className="text-xs sm:text-sm text-text-secondary">Earn coins by writing stories and completing challenges</p>
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-amber-600">
                {userCoins.totalCoins}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-4">
              <div className="text-center p-3 bg-card-hover rounded-lg">
                <div className="text-xl sm:text-2xl mb-1">📝</div>
                <p className="text-xs sm:text-sm text-text-secondary">Stories</p>
                <p className="font-semibold text-warm-text text-sm sm:text-base">{userCoins.storiesCompleted}</p>
              </div>

              <div className="text-center p-3 bg-card-hover rounded-lg">
                <div className="text-xl sm:text-2xl mb-1">🏁</div>
                <p className="text-xs sm:text-sm text-text-secondary">Competitions</p>
                <p className="font-semibold text-warm-text text-sm sm:text-base">{userCoins.competitionsParticipated || 0}</p>
              </div>
              <div className="text-center p-3 bg-card-hover rounded-lg">
                <div className="text-xl sm:text-2xl mb-1">👑</div>
                <p className="text-xs sm:text-sm text-text-secondary">Wins</p>
                <p className="font-semibold text-warm-text text-sm sm:text-base">{userCoins.competitionsWon || 0}</p>
              </div>
            </div>
          </motion.div>

          {/* Badges Section - Mobile responsive */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-4 sm:p-6 soft-border"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-warm-text">Badges & Achievements</h2>
                <p className="text-xs sm:text-sm text-text-secondary">Unlock badges by reaching milestones</p>
              </div>
              <div className="text-right">
                <p className="text-xs sm:text-sm text-text-secondary">Progress</p>
                <p className="font-semibold text-warm-text text-sm sm:text-base">{earnedBadges.length} / {totalBadges}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {BADGE_DEFINITIONS.map((badgeDef, index) => {
                const earnedBadge = earnedBadges.find((b: any) => b.id === badgeDef.id);
                const isEarned = !!earnedBadge;
                
                return (
                  <motion.div
                    key={badgeDef.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className={`p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 ${
                      isEarned 
                        ? `${getBadgeColor(badgeDef.category)} shadow-lg` 
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="text-xl sm:text-2xl">{badgeDef.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-xs sm:text-sm truncate">{badgeDef.name}</h3>
                        <p className="text-xs text-text-secondary line-clamp-2">{badgeDef.description}</p>
                        {isEarned && earnedBadge.earnedDate && (
                          <p className="text-xs text-green-600 mt-1">
                            Earned {(earnedBadge.earnedDate.toDate ? earnedBadge.earnedDate.toDate() : new Date(earnedBadge.earnedDate)).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {isEarned && (
                        <div className="text-green-500 text-sm sm:text-base">✓</div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Coin Rewards Info - Mobile responsive */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-4 sm:p-6 soft-border"
          >
            <h3 className="text-base sm:text-lg font-semibold text-warm-text mb-3 sm:mb-4">How to Earn Coins</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3 p-3 bg-card-hover rounded-lg">
                <div className="text-xl sm:text-2xl">📝</div>
                <div>
                  <p className="font-medium text-warm-text text-sm sm:text-base">Complete a Story</p>
                  <p className="text-xs sm:text-sm text-text-secondary">+{COIN_REWARDS.STORY_COMPLETION} coins</p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 p-3 bg-card-hover rounded-lg">
                <div className="text-xl sm:text-2xl">🏁</div>
                <div>
                  <p className="font-medium text-warm-text text-sm sm:text-base">Participate in Competition</p>
                  <p className="text-xs sm:text-sm text-text-secondary">+{COIN_REWARDS.COMPETITION_PARTICIPATION} coins</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 p-3 bg-card-hover rounded-lg">
                <div className="text-xl sm:text-2xl">👑</div>
                <div>
                  <p className="font-medium text-warm-text text-sm sm:text-base">Win Competition</p>
                  <p className="text-xs sm:text-sm text-text-secondary">+{COIN_REWARDS.COMPETITION_WIN} coins</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Back Button - Moved to bottom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center pt-4"
          >
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-secondary glow-on-hover text-sm sm:text-base py-2 sm:py-3 px-4 sm:px-6"
              >
                ← Back to Home
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 