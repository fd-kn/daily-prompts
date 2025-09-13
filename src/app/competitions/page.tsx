'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CompetitionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 sm:mb-8"
        >
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-secondary glow-on-hover text-sm sm:text-base"
            >
              ← Back to Home
            </motion.button>
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-warm-text mb-4 sm:mb-6">
            🚀 Competitions – Coming Soon!
          </h1>
          <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto px-4">
            Get ready to level up your writing and compete with writers from around the world!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card p-6 sm:p-8 md:p-12 text-center soft-border"
        >
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6 sm:mb-8"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 soft-pulse">
                <span className="text-2xl sm:text-3xl">🚀</span>
              </div>
            </motion.div>
            
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-warm-text mb-6 sm:mb-8">
              What's Coming:
            </h2>
            
            <div className="space-y-4 sm:space-y-6 text-left">
              <div className="bg-card-hover border border-border-color rounded-lg p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-warm-text mb-2">
                  Weekly Challenges
                </h3>
                <p className="text-sm sm:text-base text-text-secondary">
                  Short, intense prompts with coin prizes to boost your progress.
                </p>
              </div>
              
              <div className="bg-card-hover border border-border-color rounded-lg p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-warm-text mb-2">
                  Monthly Showdowns
                </h3>
                <p className="text-sm sm:text-base text-text-secondary">
                  Longer stories, deeper prompts, and the chance to win real cash prizes.
                </p>
              </div>
              
              <div className="bg-card-hover border border-border-color rounded-lg p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-warm-text mb-2">
                  Creative Prompts & Unique Challenges
                </h3>
                <p className="text-sm sm:text-base text-text-secondary">
                  Push your skills, explore new genres, and think outside the box.
                </p>
              </div>
              
              <div className="bg-card-hover border border-border-color rounded-lg p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-warm-text mb-2">
                  Fair Judging & Feedback
                </h3>
                <p className="text-sm sm:text-base text-text-secondary">
                  Your stories will be evaluated by experienced writers and the community.
                </p>
              </div>
              
              <div className="bg-card-hover border border-border-color rounded-lg p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-warm-text mb-2">
                  Join a Passionate Writing Community
                </h3>
                <p className="text-sm sm:text-base text-text-secondary">
                  Connect, compete, and share with fellow storytellers.
                </p>
              </div>
            </div>
            
          </div>
        </motion.div>
      </div>
    </div>
  );
} 