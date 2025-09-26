'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CompetitionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 sm:mb-6"
        >
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-secondary glow-on-hover text-sm"
            >
              ← Back to Home
            </motion.button>
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-warm-text mb-3 sm:mb-4">
            🚀 Competitions – Coming Soon!
          </h1>
          <p className="text-sm sm:text-base text-text-secondary max-w-xl mx-auto px-4">
            Get ready to level up your writing and compete with writers from around the world!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card p-4 sm:p-6 md:p-8 text-center soft-border"
        >
          <div className="max-w-xl mx-auto">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-4 sm:mb-6"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 soft-pulse">
                <span className="text-xl sm:text-2xl">🚀</span>
              </div>
            </motion.div>
            
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-warm-text mb-4 sm:mb-6">
              What&apos;s Coming:
            </h2>
            
            <div className="space-y-3 sm:space-y-4 text-left">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-warm-text rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-warm-text mb-1">
                    Weekly Challenges
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary">
                    Short, intense prompts with coin prizes to boost your progress.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-warm-text rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-warm-text mb-1">
                    Monthly Showdowns
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary">
                    Longer stories, deeper prompts, and the chance to win real cash prizes.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-warm-text rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-warm-text mb-1">
                    Creative Prompts & Unique Challenges
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary">
                    Push your skills, explore new genres, and think outside the box.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-warm-text rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-warm-text mb-1">
                    Fair Judging & Feedback
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary">
                    Your stories will be evaluated by experienced writers and the community.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-warm-text rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-warm-text mb-1">
                    Join a Passionate Writing Community
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary">
                    Connect, compete, and share with fellow storytellers.
                  </p>
                </div>
              </div>
            </div>
            
          </div>
        </motion.div>
      </div>
    </div>
  );
} 