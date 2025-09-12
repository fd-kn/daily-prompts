'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import LogoutConfirmModal from './LogoutConfirmModal';
import LoginModal from './LoginModal';
import { getUserCoins, updateUserCoins } from '../lib/coinSystem';
import { getUserId } from '../lib/userUtils';


export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<{ username?: string; profilePicture?: string }>({});
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userCoins, setUserCoins] = useState<number>(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Load user profile
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserProfile({
              username: data.username,
              profilePicture: data.profilePicture
            });
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      } else {
        setUserProfile({});
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen for profile updates and load user level
  useEffect(() => {
    const loadCoinsForUser = async (userId: string) => {
      try {
        console.log('🪙 Loading coins for user:', userId);
        const coins = await getUserCoins(userId);
        if (coins) {
          console.log('✅ Found coins document:', coins);
          console.log('💰 Setting user coins to:', coins.totalCoins);
          setUserCoins(coins.totalCoins);
        } else {
          console.log('❌ No coins document found for user:', userId);
          setUserCoins(0);
        }
      } catch (error) {
        console.error('❌ Error loading user coins:', error);
        setUserCoins(0);
      }
    };

    const setupCoinsListener = (userId: string) => {
      const coinsDocRef = doc(db, 'userCoins', userId);
      return onSnapshot(coinsDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          console.log('🔄 Coins updated in real-time for user:', userId);
          console.log('💰 New total coins:', data.totalCoins);
          setUserCoins(data.totalCoins || 0);
        } else {
          console.log('❌ No coins document found in listener for user:', userId);
          setUserCoins(0);
        }
      }, (error) => {
        console.error('❌ Error listening to coins updates:', error);
        setUserCoins(0);
      });
    };

    if (user) {
      // Authenticated user - ONLY use authenticated user ID
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setUserProfile({
            username: data.username,
            profilePicture: data.profilePicture
          });
        }
      });

      // Load coins for authenticated user only
      loadCoinsForUser(user.uid);
      const unsubscribeCoins = setupCoinsListener(user.uid);

      return () => {
        unsubscribe();
        unsubscribeCoins();
      };
    } else {
      // Anonymous user - only load coins for anonymous ID
      const anonymousUserId = getUserId();
      loadCoinsForUser(anonymousUserId);
      const unsubscribeCoins = setupCoinsListener(anonymousUserId);

      return () => {
        unsubscribeCoins();
      };
    }
  }, [user]);



  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.profile-menu-container')) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  return (
    <nav className="bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* App Name - Far Left */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="text-xl font-bold warm-text flex items-center gap-2"
              >
                <span className="text-2xl">📛</span>
                Story Platform
              </motion.div>
            </Link>
          </div>

          {/* Navigation Links - Center */}
          <div className="flex items-center gap-6 flex-1 justify-center">
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`glow-on-hover flex items-center gap-2 ${
                  pathname === '/' 
                    ? 'btn-primary' 
                    : 'btn-secondary'
                }`}
              >
                <span>✍️</span>
                Daily
              </motion.button>
            </Link>
            <Link href="/read">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`glow-on-hover flex items-center gap-2 ${
                  pathname === '/read' 
                    ? 'btn-primary' 
                    : 'btn-secondary'
                }`}
              >
                <span>📚</span>
                Read
              </motion.button>
            </Link>
            <Link href="/special-modes">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`glow-on-hover flex items-center gap-2 ${
                  pathname === '/special-modes' 
                    ? 'btn-primary' 
                    : 'btn-secondary'
                }`}
              >
                <span>⚔️</span>
                Modes
              </motion.button>
            </Link>
            <Link href="/competitions">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`glow-on-hover flex items-center gap-2 ${
                  pathname === '/competitions' 
                    ? 'btn-primary' 
                    : 'btn-secondary'
                }`}
              >
                <span>🏆</span>
                Competitions
              </motion.button>
            </Link>
            <Link href="/shop">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`glow-on-hover flex items-center gap-2 ${
                  pathname === '/shop' 
                    ? 'btn-primary' 
                    : 'btn-secondary'
                }`}
              >
                <span>🛒</span>
                Shop
              </motion.button>
            </Link>
          </div>



          {/* Right Side - Profile Menu or Login */}
          <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
            {user ? (
              <>
                {/* Coin Display */}
                <Link href="/progress">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 cursor-pointer shadow-lg border-2 border-amber-300 hover:shadow-xl transition-all duration-300 ease-out"
                  >
                    <span className="text-lg">💰</span>
                    <span className="text-sm font-bold text-amber-800">
                      {userCoins}
                    </span>
                  </motion.div>
                </Link>

                <div className="relative profile-menu-container">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="p-2 rounded-lg hover:bg-card-hover transition-colors duration-200"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-primary flex items-center justify-center">
                      {userProfile.profilePicture ? (
                        <img
                          src={userProfile.profilePicture}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-warm-white text-lg">👤</span>
                      )}
                    </div>
                  </motion.button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-[#faf8f5] rounded-lg shadow-lg border border-border-color z-50"
                    >
                      <div className="p-2">
                        <Link href="/profile">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full text-left px-3 py-2 rounded-md hover:bg-card-hover transition-colors duration-200 text-warm-text"
                            onClick={() => setShowProfileMenu(false)}
                          >
                            📄 My Profile
                          </motion.button>
                        </Link>

                        <Link href="/my-stories">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full text-left px-3 py-2 rounded-md hover:bg-card-hover transition-colors duration-200 text-warm-text"
                            onClick={() => setShowProfileMenu(false)}
                          >
                            📚 My Stories
                          </motion.button>
                        </Link>
                        <Link href="/settings">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full text-left px-3 py-2 rounded-md hover:bg-card-hover transition-colors duration-200 text-warm-text"
                            onClick={() => setShowProfileMenu(false)}
                          >
                            ⚙️ Settings
                          </motion.button>
                        </Link>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setShowLogoutConfirm(true)}
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-card-hover transition-colors duration-200 text-red-500"
                        >
                          🚪 Log Out
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowLoginModal(true)}
                className="btn-primary glow-on-hover flex items-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign In
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => {
          setShowLogoutConfirm(false);
          setShowProfileMenu(false);
        }}
      />
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </nav>
  );
} 