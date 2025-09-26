'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface UsernameSetupModalProps {
  isOpen: boolean;
  onComplete: (username: string) => void;
  userId: string;
}

export default function UsernameSetupModal({ isOpen, onComplete, userId }: UsernameSetupModalProps) {
  const [username, setUsername] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    // Update the validation and input
    if (username.length > 25) {
      setError('Username must be less than 25 characters');
      return;
    }

    // Update the validation to allow spaces
    if (!/^[a-zA-Z0-9_\s-]+$/.test(username)) {
      setError('Username can only contain letters, numbers, spaces, underscores, and hyphens');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await setDoc(doc(db, 'users', userId), {
        username: username.trim(),
        createdAt: new Date(),
        lastUpdated: new Date()
      }, { merge: true });

      onComplete(username.trim());
    } catch (error) {
      console.error('Error saving username:', error);
      setError('Failed to save username. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="card p-6 sm:p-8 max-w-md w-full soft-border"
          >
            <div className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="text-4xl"
              >
                ✨
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold warm-text"
              >
                Welcome to Story Prompt!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-text-secondary leading-relaxed"
              >
                Let&apos;s set up your username! Don&apos;t worry - you can change it anytime in your profile.
              </motion.p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-warm-text mb-2">
                    Choose your username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="input-field w-full text-center"
                    maxLength={25}
                    autoFocus
                  />
                  <p className="text-xs text-text-muted mt-1">
                    {username.length}/25 characters
                  </p>
                </div>

                {error && (
                  <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSaving || !username.trim()}
                  className="w-full btn-primary glow-on-hover py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Setting up...' : 'Complete Setup'}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 