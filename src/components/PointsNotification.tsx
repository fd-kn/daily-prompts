'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface PointsNotificationProps {
  points: number;
  type: 'story' | 'bonus' | 'badge';
  isVisible: boolean;
  onClose: () => void;
}

export default function PointsNotification({ points, type, isVisible, onClose }: PointsNotificationProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const getNotificationContent = () => {
    switch (type) {
      case 'story':
        return {
          icon: '📝',
          title: 'Story Completed!',
          message: `+${points} coins earned`,
          color: 'bg-[#d4a574]'
        };
      case 'bonus':
        return {
          icon: '🎯',
          title: 'Bonus Challenge!',
          message: `+${points} bonus coins`,
          color: 'bg-[#e6b17a]'
        };
      case 'badge':
        return {
          icon: '🏆',
          title: 'Badge Earned!',
          message: `Congratulations! You've earned a new badge!`,
          color: 'bg-[#8b7355]'
        };
      default:
        return {
          icon: '🎉',
          title: 'Coins Earned!',
          message: `+${points} coins`,
          color: 'bg-[#d4a574]'
        };
    }
  };

  const content = getNotificationContent();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          className="fixed top-4 right-4 z-50"
        >
          <motion.div
            animate={isAnimating ? { 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            } : {}}
            transition={{ duration: 0.5 }}
            className={`${content.color} text-white p-4 rounded-lg shadow-lg border border-white/20`}
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">{content.icon}</div>
              <div>
                <h3 className="font-semibold text-sm">{content.title}</h3>
                <p className="text-xs opacity-90">{content.message}</p>
              </div>
            </div>
            
            {/* Progress bar */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 3, ease: 'linear' }}
              className="h-1 bg-white/30 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 