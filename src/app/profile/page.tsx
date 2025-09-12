'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';
import LogoutConfirmModal from '../../components/LogoutConfirmModal';
import { getUserCoins, getUserBadges } from '../../lib/coinSystem';

interface UserProfile {
  username: string;
  bio: string;
  profilePicture: string;
  createdAt: Date;
  lastUpdated: Date;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>({
    username: '',
    bio: '',
    profilePicture: '',
    createdAt: new Date(),
    lastUpdated: new Date()
  });
  const [originalProfile, setOriginalProfile] = useState<UserProfile>({
    username: '',
    bio: '',
    profilePicture: '',
    createdAt: new Date(),
    lastUpdated: new Date()
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [userCoins, setUserCoins] = useState<any>(null);
  const [userBadges, setUserBadges] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    let coinsUnsubscribe: (() => void) | null = null;
    let badgesUnsubscribe: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        
        // Clean up previous listeners
        if (coinsUnsubscribe) coinsUnsubscribe();
        if (badgesUnsubscribe) badgesUnsubscribe();
        
        // Load user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            const loadedProfile = {
              username: data.username || '',
              bio: data.bio || '',
              profilePicture: data.profilePicture || '',
              createdAt: data.createdAt?.toDate() || new Date(),
              lastUpdated: data.lastUpdated?.toDate() || new Date()
            };
            setProfile(loadedProfile);
            setOriginalProfile(loadedProfile);
          } else {
            // Create new profile
            const newProfile = {
              username: '',
              bio: '',
              profilePicture: '',
              createdAt: new Date(),
              lastUpdated: new Date()
            };
            await setDoc(doc(db, 'users', user.uid), newProfile);
            setProfile(newProfile);
            setOriginalProfile(newProfile);
          }

          // Set up real-time listeners for coins and badges
          coinsUnsubscribe = onSnapshot(doc(db, 'userCoins', user.uid), (doc) => {
            if (doc.exists()) {
              const coinsData = doc.data();
              console.log('💰 Profile: Coins updated:', coinsData);
              setUserCoins(coinsData);
            } else {
              console.log('💰 Profile: No coins data found, creating default');
              setUserCoins({
                totalCoins: 0,
                storiesCompleted: 0,

                badgesEarned: 0
              });
            }
          });

          badgesUnsubscribe = onSnapshot(doc(db, 'userBadges', user.uid), (doc) => {
            if (doc.exists()) {
              const badgesData = doc.data();
              console.log('🏆 Profile: Badges updated:', badgesData);
              setUserBadges(badgesData);
            } else {
              console.log('🏆 Profile: No badges data found, creating default');
              setUserBadges({
                badges: []
              });
            }
          });
        } catch (error) {
          console.error('Error loading profile:', error);
        }
      } else {
        // Not logged in, redirect to home
        router.push('/');
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (coinsUnsubscribe) coinsUnsubscribe();
      if (badgesUnsubscribe) badgesUnsubscribe();
    };
  }, [router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Check file size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      alert('Image file is too large. Please select an image smaller than 5MB.');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    setImageUploading(true);
    try {
      // Compress the image before converting to base64
      const compressedImage = await compressImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setProfile(prev => ({ ...prev, profilePicture: base64 }));
        setImageUploading(false);
      };
      reader.readAsDataURL(compressedImage);
    } catch (error) {
      console.error('Error uploading image:', error);
      setImageUploading(false);
      alert('Error processing image. Please try again.');
    }
  };

  // Function to compress image
  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 300x300 for profile pictures)
        const maxSize = 300;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          0.7 // 70% quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        username: profile.username,
        bio: profile.bio,
        profilePicture: profile.profilePicture,
        lastUpdated: new Date()
      });
      // Update original profile with saved data
      setOriginalProfile(profile);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Revert all changes back to original state
    setProfile(originalProfile);
    setIsEditing(false);
    setImageUploading(false);
  };

  const handleStartEdit = () => {
    // Store current state as original before editing
    setOriginalProfile(profile);
    setIsEditing(true);
  };



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4">⚡</div>
          <p className="text-text-secondary">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to home
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto p-8">
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

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold warm-text mb-4">Profile</h1>
          <p className="text-text-secondary">Manage your account and preferences</p>
        </motion.div>

        {/* Profile Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card p-8 soft-border max-w-2xl mx-auto"
        >
          {/* Profile Picture Section */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-card-hover border-4 border-border-color">
                {profile.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-text-muted">
                    👤
                  </div>
                )}
              </div>
              
              {/* Upload Button - Only show in edit mode */}
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-gradient-primary text-warm-white p-2 rounded-full cursor-pointer hover:scale-110 transition-transform duration-200">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={imageUploading}
                  />
                  {imageUploading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    '📷'
                  )}
                </label>
              )}
            </div>
            
            {imageUploading && (
              <p className="text-sm text-text-muted mt-2">Processing image...</p>
            )}
            {isEditing && (
              <p className="text-sm text-text-muted mt-2">
                Click the camera icon to upload a profile picture (max 5MB, will be resized to 300x300)
              </p>
            )}
          </div>

          {/* Profile Form */}
          <div className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-warm-text mb-2">
                Username
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.username}
                  onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
                  className="input-field w-full p-3"
                  placeholder="Enter your username"
                  maxLength={30}
                />
              ) : (
                <div className="p-3 bg-card-hover rounded-lg">
                  <span className="text-warm-text">
                    {profile.username || 'No username set'}
                  </span>
                </div>
              )}
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-warm-text mb-2">
                Bio
              </label>
              {isEditing ? (
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  className="input-field w-full p-3 resize-none"
                  placeholder="Tell us about yourself..."
                  rows={4}
                  maxLength={200}
                />
              ) : (
                <div className="p-3 bg-card-hover rounded-lg min-h-[60px]">
                  <span className="text-warm-text">
                    {profile.bio || 'No bio set'}
                  </span>
                </div>
              )}
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-warm-text mb-2">
                Email
              </label>
              <div className="p-3 bg-card-hover rounded-lg">
                <span className="text-text-secondary">{user.email}</span>
              </div>
            </div>

            {/* Account Stats */}
            <div className="border-t border-border-color pt-4">
              <h3 className="text-lg font-semibold text-warm-text mb-4">Account Stats</h3>
              
              {/* Coin Balance */}
              <div className="flex items-center gap-3 p-3 bg-card-hover rounded-lg mb-3">
                                  <span className="text-2xl">💰</span>
                <div>
                  <p className="text-sm text-text-secondary">Coin Balance</p>
                  <p className="font-semibold text-warm-text">{userCoins?.totalCoins || 0} coins</p>
                </div>
              </div>

              {/* Membership Tier */}
              <div className="flex items-center gap-3 p-3 bg-card-hover rounded-lg mb-3">
                <span className="text-2xl">👑</span>
                <div>
                  <p className="text-sm text-text-secondary">Membership</p>
                  <p className="font-semibold text-warm-text">Free Tier</p>
                </div>
              </div>

              {/* Badges Earned */}
              <div className="flex items-center gap-3 p-3 bg-card-hover rounded-lg mb-3">
                <span className="text-2xl">🏆</span>
                <div>
                  <p className="text-sm text-text-secondary">Badges Earned</p>
                  <p className="font-semibold text-warm-text">
                    {userBadges?.badges?.filter((badge: any) => badge.earned).length || 0} badges
                  </p>
                </div>
              </div>

              {/* Account Info */}
              <div className="text-sm text-text-muted space-y-1 mt-4 pt-4 border-t border-border-color">
                <p>Member since: {profile.createdAt.toLocaleDateString()}</p>
                <p>Last updated: {profile.lastUpdated.toLocaleDateString()}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              {isEditing ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary glow-on-hover flex-1 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancel}
                    className="btn-secondary glow-on-hover"
                  >
                    Cancel
                  </motion.button>
                </>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartEdit}
                    className="btn-primary glow-on-hover flex-1"
                  >
                    Edit Profile
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowLogoutConfirm(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded-md shadow-sm font-semibold transition-all duration-200 hover:bg-red-700"
                  >
                    Logout
                  </motion.button>
                </>
              )}
            </div>
          </div>
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