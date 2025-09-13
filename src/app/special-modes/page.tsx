'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface SpecialMode {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'coming-soon' | 'available';
  href?: string;
}

const specialModes: SpecialMode[] = [
  {
    id: 'speed-round',
    title: '⚡ Speed Round',
    description: 'Write a complete story in just 3 minutes. The clock is ticking!',
    icon: '⚡',
    status: 'coming-soon'
  },
  {
    id: 'mystery-box',
    title: '🎲 Mystery Box',
    description: 'Your story must include 3 random words. Can you weave them all in?',
    icon: '🎲',
    status: 'coming-soon'
  },
  {
    id: 'picture-sparks',
    title: '🖼️ Picture Sparks',
    description: 'Get inspired by an image instead of a text prompt. What story does it spark?',
    icon: '🖼️',
    status: 'coming-soon'
  },
  {
    id: 'genre-flip',
    title: '🎭 Genre Flip',
    description: 'The prompt is normal — but you must write it in a specific genre (horror, comedy, sci-fi, romance, etc).',
    icon: '🎭',
    status: 'coming-soon'
  },
  {
    id: 'first-last-line',
    title: '🔗 First & Last Line',
    description: 'We give you the opening and closing lines. Your challenge: fill in the story between them.',
    icon: '🔗',
    status: 'coming-soon'
  },
  {
    id: 'forbidden-word',
    title: '🚫 Forbidden Word',
    description: 'Write your story without using one specific word. Break the rule, lose the challenge!',
    icon: '🚫',
    status: 'coming-soon'
  }
];

export default function SpecialModes() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 sm:space-y-8"
        >
          {/* Back Button - Mobile: Top left, Desktop: Top right */}
          <div className="flex justify-start sm:justify-end">
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-secondary glow-on-hover text-sm sm:text-base py-2 px-4"
              >
                ← Back to Home
              </motion.button>
            </Link>
          </div>

          {/* Header - Centered on mobile, left-aligned on desktop */}
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-warm-text mb-3 sm:mb-4">
              Special Story Modes
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-text-secondary max-w-2xl mx-auto sm:mx-0">
              Explore unique writing challenges designed to push your creativity and storytelling skills to new heights.
            </p>
          </div>

          {/* Special Modes Grid - Mobile responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {specialModes.map((mode, index) => (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="card p-4 sm:p-6 soft-border cursor-pointer"
              >
                {/* Icon */}
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 text-center">
                  {mode.icon}
                </div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-bold text-warm-text mb-2 sm:mb-3 text-center">
                  {mode.title}
                </h3>

                {/* Description - Fixed text stacking */}
                <p className="text-text-secondary text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 text-center">
                  {mode.description}
                </p>

                {/* Status Badge */}
                <div className="flex justify-center">
                  {mode.status === 'coming-soon' ? (
                    <span className="bg-gradient-secondary text-warm-text px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                      Coming Soon
                    </span>
                  ) : (
                    <span className="bg-gradient-primary text-warm-white px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                      Available
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
