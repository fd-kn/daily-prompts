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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const navigationLinks = [
    { href: '/', label: 'Daily', icon: '✍️' },
    { href: '/read', label: 'Read', icon: '📚' },
    { href: '/special-modes', label: 'Modes', icon: '⚔️' },
    { href: '/competitions', label: 'Competitions', icon: '🏆' },
    { href: '/shop', label: 'Shop', icon: '🛒' }
  ];

  return (
    <>
      <nav className="bg-background border-b border-border-color sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-2xl sm:text-3xl"
              >
                ✍️
              </motion.div>
              <span className="text-lg sm:text-xl font-bold text-warm-text hidden sm:block">
                Story Prompt
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4 flex-shrink-0">
              {/* Navigation Links */}
              <div className="flex items-center gap-2">
                {navigationLinks.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        pathname === item.href
                          ? 'bg-gradient-primary text-white'
                          : 'hover:bg-card-hover text-warm-text'
                      }`}
                    >
                      {item.label}
                    </motion.div>
                  </Link>
                ))}
              </div>

              {/* User Section */}
              {user ? (
                <div className="flex items-center gap-4">
                  {/* Coin Display */}
                  <Link href="/progress">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-3 px-4 py-3 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 cursor-pointer shadow-lg border-2 border-amber-300 hover:shadow-xl transition-all duration-300 ease-out"
                    >
                      <span className="text-xl">💰</span>
                      <span className="text-sm font-bold text-amber-800">
                        {userCoins}
                      </span>
                    </motion.div>
                  </Link>

                  {/* Profile Menu */}
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="flex items-center gap-3 p-3 rounded-full hover:bg-card-hover transition-colors"
                    >
                      {userProfile.profilePicture ? (
                        <img
                          src={userProfile.profilePicture}
                          alt="Profile"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-card-hover flex items-center justify-center text-xl">
                          👤
                        </div>
                      )}
                    </motion.button>

                    <AnimatePresence>
                      {showProfileMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute right-0 mt-3 w-52 bg-background border border-border-color rounded-lg shadow-lg z-50"
                        >
                          <div className="py-3">
                            <Link href="/profile" className="block px-5 py-3 text-sm text-warm-text hover:bg-card-hover">
                              Profile
                            </Link>
                            <Link href="/my-stories" className="block px-5 py-3 text-sm text-warm-text hover:bg-card-hover">
                              My Stories
                            </Link>
                            <Link href="/settings" className="block px-5 py-3 text-sm text-warm-text hover:bg-card-hover">
                              Settings
                            </Link>
                            <hr className="my-3 border-border-color" />
                            <button
                              onClick={() => setShowLogoutConfirm(true)}
                              className="block w-full text-left px-5 py-3 text-sm text-red-600 hover:bg-red-50"
                            >
                              Logout
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowLoginModal(true)}
                  className="btn-primary glow-on-hover px-6 py-3"
                >
                  Login
                </motion.button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-3 rounded-lg hover:bg-card-hover transition-colors"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className={`block w-5 h-0.5 bg-amber-700 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1' : ''}`}></span>
                <span className={`block w-5 h-0.5 bg-amber-700 transition-all duration-300 mt-1 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block w-5 h-0.5 bg-amber-700 transition-all duration-300 mt-1 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1' : ''}`}></span>
              </div>
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Modals */}
      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
      />
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
} 