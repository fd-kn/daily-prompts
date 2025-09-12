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
    id: 'timed-story',
    title: 'Timed Story Challenge',
    description: 'Write a complete story within a time limit. Race against the clock to create compelling narratives.',
    icon: '⏱️',
    status: 'coming-soon'
  },
  {
    id: 'prompt-challenge',
    title: 'Prompt Challenge',
    description: 'Get a random creative prompt and craft a story around it. Perfect for breaking writer\'s block.',
    icon: '🎲',
    status: 'coming-soon'
  },
  {
    id: 'word-sprint',
    title: 'Word Sprint',
    description: 'Write as many words as possible in a short time period. Speed and creativity combined.',
    icon: '🏃',
    status: 'coming-soon'
  },
  {
    id: 'genre-roulette',
    title: 'Genre Roulette',
    description: 'Spin the wheel and get assigned a random genre. Write a story that fits perfectly.',
    icon: '🎰',
    status: 'coming-soon'
  },
  {
    id: 'collaborative-story',
    title: 'Collaborative Story',
    description: 'Work with other writers to create a story together. Each person adds their own chapter.',
    icon: '🤝',
    status: 'coming-soon'
  },
  {
    id: 'micro-series',
    title: 'Micro Series',
    description: 'Write a series of connected micro-stories. Build a world in tiny chapters.',
    icon: '📚',
    status: 'coming-soon'
  }
];

export default function SpecialModes() {
  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1"></div>
            <div className="flex-1 text-center">
              <h1 className="text-4xl font-bold warm-text mb-4">
                Special Story Modes
              </h1>
              <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                Explore unique writing challenges designed to push your creativity and storytelling skills to new heights.
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              <Link href="/">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-secondary glow-on-hover"
                >
                  ← Back to Home
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Special Modes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialModes.map((mode, index) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="card p-6 soft-border cursor-pointer"
            >
              {/* Icon */}
              <div className="text-4xl mb-4 text-center">
                {mode.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold warm-text mb-3 text-center">
                {mode.title}
              </h3>

              {/* Description */}
              <p className="text-text-secondary text-sm leading-relaxed mb-4">
                {mode.description}
              </p>

              {/* Status Badge */}
              <div className="flex justify-center">
                {mode.status === 'coming-soon' ? (
                  <span className="bg-gradient-secondary text-warm-text px-3 py-1 rounded-full text-sm font-medium">
                    Coming Soon
                  </span>
                ) : (
                  <span className="bg-gradient-primary text-warm-white px-3 py-1 rounded-full text-sm font-medium">
                    Available
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-12"
        >
          <div className="card p-6 inline-block max-w-2xl soft-border">
            <h3 className="text-xl font-bold warm-text mb-3">
              🚀 More Modes Coming Soon!
            </h3>
            <p className="text-text-secondary">
              We're constantly developing new and exciting story challenges. 
              Check back regularly for updates and new features!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 