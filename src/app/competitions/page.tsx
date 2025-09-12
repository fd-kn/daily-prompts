'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CompetitionsPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto p-8">
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

        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold warm-text mb-6">
            Competitions
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Exciting writing competitions are coming soon!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card p-12 text-center soft-border"
        >
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 soft-pulse">
                <span className="text-3xl">🎯</span>
              </div>
            </motion.div>
            
            <h2 className="text-3xl font-bold warm-text-accent mb-4">
              Coming Soon!
            </h2>
            
            <p className="text-lg text-text-secondary mb-6">
              We're working hard to bring you exciting writing competitions with amazing prizes. 
              Stay tuned for announcements about our upcoming events!
            </p>
            
            <div className="bg-card-hover border border-border-color rounded-lg p-6 mb-8">
              <h3 className="text-xl font-semibold warm-text mb-3">
                What to Expect
              </h3>
              <ul className="text-text-secondary space-y-2 text-left">
                <li className="flex items-center gap-2">
                  <span className="text-muted-amber">•</span>
                  Creative writing prompts and challenges
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-muted-amber">•</span>
                  Cash prizes and recognition
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-muted-amber">•</span>
                  Fair judging and feedback
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-muted-amber">•</span>
                  Community of passionate writers
                </li>
              </ul>
            </div>
            
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary glow-on-hover text-lg font-semibold"
              >
                Back to Home
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 