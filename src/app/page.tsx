'use client';

import { useEffect, useState } from "react";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getDailyPrompt } from '../lib/prompts';
import { useRouter } from 'next/navigation';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import UsernameSetupModal from '../components/UsernameSetupModal';

export default function Home() {
  const [dailyPrompt] = useState(getDailyPrompt('micro'));
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  // Update the state and useEffect to fetch username
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showUsernameSetup, setShowUsernameSetup] = useState(false);

  // Scroll to top on page load/reload
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Listen for authentication state and fetch username
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Fetch username from user's profile
        try {
          const { doc, getDoc } = await import('firebase/firestore');
          const { db } = await import('../lib/firebase');
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const customUsername = userData.username;
            
            if (customUsername) {
              // User has a username, proceed normally
              setUsername(customUsername);
              setShowUsernameSetup(false);
            } else {
              // No username set, show setup modal immediately
              setUsername('');
              setShowUsernameSetup(true);
            }
          } else {
            // User document doesn't exist, show setup modal immediately
            setUsername('');
            setShowUsernameSetup(true);
          }
        } catch (error) {
          console.error('Error fetching username:', error);
          setUsername('');
          setShowUsernameSetup(true);
        }
      } else {
        setUsername('');
        setShowUsernameSetup(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Update countdown timer
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-warm-text">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-6 py-1 sm:py-2 relative">
        {/* Compact Welcome Message for Logged-in Users */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-2 sm:mt-1 mb-2 sm:mb-3"
          >
            <div className="flex items-center justify-center gap-2 px-2 py-1.5 bg-amber-100 rounded-lg border border-amber-200">
              <span className="text-lg">👋</span>
              <span className="text-sm sm:text-base font-medium text-warm-text italic">
                Welcome back, {username || 'Writer'}!
              </span>
            </div>
          </motion.div>
        )}

        {/* Compact Scroll - Desktop: top left, Mobile: below buttons */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="absolute top-2 left-2 z-10 hidden sm:block"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/creator-message')}
            className="cursor-pointer"
          >
            <div className="relative">
              {/* Scroll */}
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
                className="text-xl md:text-2xl text-warm-text"
              >
                📜
              </motion.div>
              
              {/* "Open Me" Text */}
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="text-center"
              >
                <p className="text-warm-text font-semibold text-xs">Open Me!</p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Centered Main Content */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-3 sm:mb-4"
        >
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg sm:text-xl md:text-2xl font-bold warm-text mt-2 sm:mt-3 mb-2 sm:mb-3"
          >
            Daily Story Challenge
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-xs sm:text-sm text-text-secondary mb-2 sm:mb-3 px-3"
          >
            100–250 words • Daily prompts • Earn coins — write in any style you like: funny, serious, creepy, or mix it up! Have fun with it!
          </motion.p>
          
          {/* Daily Challenge Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-3 sm:mb-4"
          >
            <div className="card p-2.5 sm:p-3 inline-block max-w-2xl w-full mx-1 sm:mx-0 soft-border">

              <p className="text-warm-text font-medium text-xs sm:text-sm mb-1.5 sm:mb-2">
                Today&apos;s prompt:
              </p>
              <div className="mb-2 sm:mb-3">
                <h3 className="text-sm sm:text-base text-warm-text font-semibold leading-relaxed mb-1.5">{dailyPrompt.text}</h3>
                {dailyPrompt.description && (
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">{dailyPrompt.description}</p>
                )}
              </div>

              {/* Countdown Timer */}
              <div className="border-t border-border-color pt-1.5 sm:pt-2">
                <p className="text-text-secondary text-xs mb-1.5">Next prompt in:</p>
                <div className="flex justify-center gap-1.5 sm:gap-2">
                  <div className="text-center">
                    <div className="bg-gradient-primary text-warm-white px-1.5 py-1 rounded-lg font-bold text-xs">
                      {timeLeft.hours.toString().padStart(2, '0')}
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">Hours</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-gradient-primary text-warm-white px-1.5 py-1 rounded-lg font-bold text-xs">
                      {timeLeft.minutes.toString().padStart(2, '0')}
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">Minutes</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-gradient-primary text-warm-white px-1.5 py-1 rounded-lg font-bold text-xs">
                      {timeLeft.seconds.toString().padStart(2, '0')}
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">Seconds</p>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-1.5 sm:gap-2 items-center justify-center px-3"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto"
            >
              <Link 
                href="/write-story"
                className="inline-block btn-secondary glow-on-hover text-xs sm:text-sm font-medium w-full sm:w-auto text-center py-2 sm:py-1.5 px-4 sm:px-3"
              >
                Start Today&apos;s Challenge
              </Link>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto"
            >
              <Link 
                href="/daily-challenges"
                className="inline-block btn-secondary glow-on-hover text-xs sm:text-sm font-medium w-full sm:w-auto text-center py-2 sm:py-1.5 px-4 sm:px-3"
              >
                View Today&apos;s Entries
              </Link>
            </motion.div>
          </motion.div>

          {/* Creator Message Icon - Mobile only, below buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-4 sm:hidden"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/creator-message')}
              className="cursor-pointer inline-block"
            >
              <div className="relative">
                {/* Scroll */}
                <motion.div
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="text-xl text-warm-text"
                >
                  📜
                </motion.div>
                
                {/* "Open Me" Text */}
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.8 }}
                  className="text-center"
                >
                  <p className="text-warm-text font-semibold text-xs">Open Me!</p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Username Setup Modal */}
        <UsernameSetupModal
          isOpen={showUsernameSetup}
          onComplete={(newUsername) => {
            setUsername(newUsername);
            setShowUsernameSetup(false);
          }}
          userId={user?.uid || ''}
        />

      </div>
    </div>
  );
}
