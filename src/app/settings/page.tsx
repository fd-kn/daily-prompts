'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged, User, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Link from 'next/link';
import LogoutConfirmModal from '../../components/LogoutConfirmModal';

interface UserSettings {
  emailNotifications: boolean;
  storyVisibility: 'public' | 'private' | 'friends';
  theme: 'light' | 'dark' | 'auto';
  language: string;
}

export default function Settings() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<UserSettings>({
    emailNotifications: true,
    storyVisibility: 'private',
    theme: 'auto',
    language: 'en'
  });
  const [saving, setSaving] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        // Load user settings from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setSettings({
              emailNotifications: data.emailNotifications ?? true,
              storyVisibility: data.storyVisibility ?? 'private',
              theme: data.theme ?? 'auto',
              language: data.language ?? 'en'
            });
          }
        } catch (error) {
          console.error('Error loading settings:', error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSaveSettings = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...settings,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user || !passwordData.currentPassword || !passwordData.newPassword) {
      setPasswordError('Please fill in all fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setChangingPassword(true);
    setPasswordError('');

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email!, passwordData.currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, passwordData.newPassword);
      
      // Clear form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      alert('Password updated successfully!');
    } catch (error: any) {
      console.error('Error changing password:', error);
      if (error.code === 'auth/wrong-password') {
        setPasswordError('Current password is incorrect');
      } else {
        setPasswordError('Failed to update password. Please try again.');
      }
    } finally {
      setChangingPassword(false);
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
              <p className="text-sm sm:text-base text-text-secondary">Manage your account preferences</p>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* General Settings */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-4 sm:p-6 soft-border"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-warm-text mb-4 sm:mb-6">General Settings</h2>
              
              <div className="space-y-4 sm:space-y-6">
                {/* Email Notifications */}
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <h3 className="font-medium text-warm-text text-sm sm:text-base">Email Notifications</h3>
                    <p className="text-xs sm:text-sm text-text-secondary">Receive updates about competitions and new features</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => setSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-gradient-primary"></div>
                  </label>
                </div>

                {/* Story Visibility */}
                <div>
                  <label className="block text-sm font-medium text-warm-text mb-2">
                    Default Story Visibility
                  </label>
                  <select
                    value={settings.storyVisibility}
                    onChange={(e) => setSettings(prev => ({ ...prev, storyVisibility: e.target.value as any }))}
                    className="input-field w-full text-sm sm:text-base py-2 sm:py-3"
                  >
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                    <option value="friends">Friends Only</option>
                  </select>
                </div>

                {/* Theme */}
                <div>
                  <label className="block text-sm font-medium text-warm-text mb-2">
                    Theme
                  </label>
                  <select
                    value={settings.theme}
                    onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value as any }))}
                    className="input-field w-full text-sm sm:text-base py-2 sm:py-3"
                  >
                    <option value="auto">Auto (System)</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-warm-text mb-2">
                    Language
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                    className="input-field w-full text-sm sm:text-base py-2 sm:py-3"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Security Settings */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-4 sm:p-6 soft-border"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-warm-text mb-4 sm:mb-6">Security</h2>
              
              <div className="space-y-4 sm:space-y-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-warm-text mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-text-secondary text-sm sm:text-base">{user.email}</span>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Verified</span>
                  </div>
                </div>

                {/* Change Password */}
                <div>
                  <h3 className="font-medium text-warm-text mb-3 text-sm sm:text-base">Change Password</h3>
                  <div className="space-y-3">
                    <input
                      type="password"
                      placeholder="Current password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="input-field w-full text-sm sm:text-base py-2 sm:py-3"
                    />
                    <input
                      type="password"
                      placeholder="New password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="input-field w-full text-sm sm:text-base py-2 sm:py-3"
                    />
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="input-field w-full text-sm sm:text-base py-2 sm:py-3"
                    />
                    {passwordError && (
                      <p className="text-red-500 text-xs sm:text-sm">{passwordError}</p>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleChangePassword}
                      disabled={changingPassword}
                      className="btn-primary glow-on-hover text-sm sm:text-base py-2 sm:py-3 w-full"
                    >
                      {changingPassword ? 'Updating...' : 'Update Password'}
                    </motion.button>
                  </div>
                </div>

                {/* Account Actions */}
                <div className="pt-4 border-t border-border-color">
                  <h3 className="font-medium text-warm-text mb-4 text-sm sm:text-base">Account Actions</h3>
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowLogoutConfirm(true)}
                      className="w-full p-3 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-sm sm:text-base"
                    >
                      🚪 Log Out
                    </motion.button>
                    
                    <button
                      className="w-full p-3 text-orange-600 border border-orange-300 rounded-lg hover:bg-orange-50 transition-colors text-sm sm:text-base"
                      disabled
                    >
                      🗑️ Delete Account (Coming Soon)
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveSettings}
              disabled={saving}
              className="btn-primary glow-on-hover text-sm sm:text-base py-2 sm:py-3 px-6 sm:px-8"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
} 