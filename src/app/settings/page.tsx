'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';

export default function Settings() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [confirmationUsername, setConfirmationUsername] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        // Load username from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUsername(data.username || '');
          }
        } catch (error) {
          console.error('Error loading username:', error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    if (confirmationUsername !== username) {
      setError('Username does not match. Please try again.');
      return;
    }

    setDeleting(true);
    setError('');

    try {
      // Re-authenticate using Google (since that's how users log in)
      const { reauthenticateWithPopup, GoogleAuthProvider } = await import('firebase/auth');
      const provider = new GoogleAuthProvider();
      await reauthenticateWithPopup(user, provider);

      // Now proceed with account deletion
      const { deleteUser } = await import('firebase/auth');
      const { collection, query, where, getDocs, deleteDoc } = await import('firebase/firestore');
      
      // Delete user's stories
      const storiesRef = collection(db, 'stories');
      const userStoriesQuery = query(storiesRef, where('userId', '==', user.uid));
      const storiesSnapshot = await getDocs(userStoriesQuery);
      
      const deletePromises = storiesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Delete user's profile
      await deleteDoc(doc(db, 'users', user.uid));
      
      // Delete user's coins and badges
      await deleteDoc(doc(db, 'userCoins', user.uid));
      await deleteDoc(doc(db, 'userBadges', user.uid));

      // Finally delete the user account
      await deleteUser(user);
      
      // Redirect immediately to home page
      window.location.href = '/';
      
    } catch (error: unknown) {
      console.error('Error deleting account:', error);
      if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/popup-closed-by-user') {
        setError('Account deletion cancelled. Please try again.');
      } else if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/user-mismatch') {
        setError('Please select the same Google account you used to create this account.');
      } else if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/credential-already-in-use') {
        setError('This Google account is already associated with another account.');
      } else if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError('Failed to delete account. Please try again.');
      }
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-warm-text mx-auto"></div>
          <p className="mt-4 text-warm-text">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold text-warm-text mb-2">Access Denied</h2>
          <p className="text-text-secondary mb-4">Please log in to access settings</p>
          <Link href="/" className="btn-primary glow-on-hover">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 sm:space-y-8"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-warm-text mb-2">Settings</h1>
              <p className="text-sm sm:text-base text-text-secondary">Manage your account</p>
            </div>
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-secondary glow-on-hover text-sm sm:text-base"
              >
                ← Back to Home
              </motion.button>
            </Link>
          </div>

          {/* Delete Account Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="card p-6 sm:p-8 soft-border border-red-200">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">⚠️</div>
                <h2 className="text-xl sm:text-2xl font-bold text-red-600 mb-2">Delete Account</h2>
                <p className="text-sm sm:text-base text-text-secondary">
                  This action cannot be undone. All your stories and data will be permanently deleted.
                </p>
              </div>

              {!showConfirm ? (
                <div className="space-y-4">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-red-800 mb-2">What will be deleted:</h3>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• Your account and profile information</li>
                      <li>• All your stories (published and unpublished)</li>
                      <li>• Your progress and statistics</li>
                      <li>• All associated data</li>
                    </ul>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowConfirm(true)}
                    className="w-full py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    I understand, proceed to delete my account
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Warning about data deletion - moved to top */}
                  <div className="bg-red-100 border border-red-300 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">⚠️ Warning: This action cannot be undone</h4>
                    <p className="text-sm text-red-700 mb-2">Deleting your account will permanently remove:</p>
                    <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                      <li>All your stories and drafts</li>
                      <li>Your coin balance and achievements</li>
                      <li>Your profile information and settings</li>
                      <li>All your writing progress and statistics</li>
                    </ul>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-red-700 mb-2">
                      To confirm account deletion, please type your username exactly as it appears:
                    </p>
                    <p className="font-semibold text-red-800 text-lg">{username}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-warm-text mb-2">
                      Type your username to confirm:
                    </label>
                    <input
                      type="text"
                      value={confirmationUsername}
                      onChange={(e) => setConfirmationUsername(e.target.value)}
                      className="w-full p-3 border border-red-300 rounded-lg bg-background text-warm-text"
                      placeholder="Enter your username"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowConfirm(false);
                        setConfirmationUsername('');
                        setError('');
                      }}
                      className="flex-1 py-3 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                    >
                      Cancel
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (confirmationUsername === username) {
                          setShowFinalConfirm(true);
                        } else {
                          setError('Username does not match. Please enter your exact username.');
                        }
                      }}
                      disabled={deleting || confirmationUsername !== username}
                      className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue to Final Confirmation
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Final Confirmation Modal */}
      {showFinalConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card p-8 max-w-md w-full soft-border border-red-200"
          >
            <div className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="text-6xl"
              >
                ⚠️
              </motion.div>

              <div>
                <h2 className="text-2xl font-bold text-red-600 mb-2">FINAL WARNING</h2>
                <p className="text-text-secondary leading-relaxed">
                  This action is <strong>PERMANENT</strong> and cannot be undone. All your stories, progress, and data will be deleted forever.
                </p>
              </div>

              <div className="bg-red-100 p-4 rounded-lg">
                <p className="text-sm text-red-700">
                  Are you absolutely certain you want to delete your account?
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowFinalConfirm(false)}
                  className="flex-1 py-3 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  No, Keep My Account
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Deleting Account...' : 'Yes, Delete Forever'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 