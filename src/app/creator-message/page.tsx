'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Link from 'next/link';

export default function CreatorMessage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await addDoc(collection(db, 'waitingList'), {
        email: email.trim().toLowerCase(),
        createdAt: new Date(),
        source: 'creator-message'
      });
      
      setIsSubmitted(true);
      setEmail('');
    } catch (error) {
      console.error('Error adding email to waiting list:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto p-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
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

        {/* Creator Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-6xl mb-6"
          >
            📬
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-3xl font-bold warm-text mb-6"
          >
            A Message from the Creator
          </motion.h1>
        </motion.div>

        {/* Email Signup - First */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="card p-6 soft-border mb-6"
        >
          <h3 className="text-lg font-bold warm-text mb-3 text-center">
            Join the Waiting List
          </h3>
          <p className="text-text-secondary text-center mb-4 text-sm">
            Be the first to know when these features launch! Enter your email below to get early access and exclusive updates.
          </p>

          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-3 bg-green-50 rounded-lg border border-green-200"
            >
              <div className="text-xl mb-1">🎉</div>
              <p className="text-green-800 font-semibold text-sm">You're on the list!</p>
              <p className="text-green-700 text-xs">We'll notify you as soon as the new features are ready.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="input-field w-full text-center"
                  disabled={isSubmitting}
                />
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-2 text-center"
                  >
                    {error}
                  </motion.p>
                )}
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
                className="btn-primary glow-on-hover w-full"
              >
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    Joining...
                  </motion.div>
                ) : (
                  'Join Waiting List'
                )}
              </motion.button>
            </form>
          )}
        </motion.div>

        {/* Message Content - Second */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="card p-6 soft-border"
        >
          <div className="flex items-start gap-4">
            <div className="text-2xl">🎮</div>
            <div>
              <h2 className="text-lg font-bold warm-text mb-3">Exciting News Coming Soon!</h2>
              <div className="text-text-secondary leading-relaxed space-y-3">
                <p className="text-sm">
                  Hey writers! I'm thrilled to share that we're working on some incredible gamification features 
                  that will make your writing journey even more exciting and rewarding.
                </p>
                <p className="text-sm">
                  <strong>Here's what's coming:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li><strong>Points System:</strong> Earn points for completing challenges and writing consistently</li>
                  <li><strong>Achievements:</strong> Unlock badges and milestones as you progress</li>
                  <li><strong>Leaderboards:</strong> Compete with other writers and see your ranking</li>
                  <li><strong>Writing Streaks:</strong> Track your daily writing habits</li>
                  <li><strong>Rewards:</strong> Special perks and features for active writers</li>
                </ul>
                <p className="text-sm">
                  Get ready to level up your writing game! 📈✨
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 