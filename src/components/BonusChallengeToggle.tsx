'use client';

import { motion } from 'framer-motion';

export default function BonusChallengeToggle() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4 soft-border"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🎯</div>
          <div>
            <h3 className="font-semibold text-warm-text">Bonus Challenge</h3>
            <p className="text-sm text-text-secondary">Extra points for creativity!</p>
            <p className="text-xs text-text-muted">Coming Soon</p>
          </div>
        </div>
        
        {/* Disabled Toggle Switch */}
        <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 cursor-not-allowed opacity-50">
          <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
        </div>
      </div>

      {/* Coming Soon Message */}
      <div className="space-y-3 pt-2 border-t border-border-color">
        <div className="text-center py-6">
          <div className="text-3xl mb-3">🚧</div>
          <h4 className="font-medium text-warm-text mb-2">Bonus Challenges Coming Soon!</h4>
          <p className="text-sm text-text-secondary leading-relaxed">
            We&apos;re working on exciting bonus challenges that will give you extra points for creativity. 
            Stay tuned for daily challenges that will test your writing skills and earn you additional coins!
          </p>
          <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
            <p className="text-xs text-amber-700">
              💡 <strong>What to expect:</strong> Word challenges, object integration, emotion themes, 
              and special story structures that will reward creative writing!
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
