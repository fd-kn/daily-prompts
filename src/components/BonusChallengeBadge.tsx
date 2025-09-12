'use client';

import { motion } from 'framer-motion';
import { bonusChallenges } from '../lib/bonusChallenges';

interface BonusChallengeBadgeProps {
  enabled: boolean;
  completed: boolean;
  challengeId?: string;
  points?: number;
}

export default function BonusChallengeBadge({ enabled, completed, challengeId, points }: BonusChallengeBadgeProps) {
  if (!enabled) return null;

  const challenge = bonusChallenges.find(c => c.id === challengeId);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
    >
      {completed ? (
        <div className="bg-green-100 text-green-800 flex items-center gap-2">
          <span>🎯</span>
          <span>Bonus Complete!</span>
          {points && <span className="text-green-600">+{points}pts</span>}
        </div>
      ) : (
        <div className="bg-amber-100 text-amber-800 flex items-center gap-2">
          <span>🎯</span>
          <span>Bonus Active</span>
          {challenge && <span className="text-amber-600">({challenge.title})</span>}
        </div>
      )}
    </motion.div>
  );
} 