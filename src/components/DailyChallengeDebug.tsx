'use client';

import { getDailyPrompt } from '../lib/prompts';
import { getDailyBonusChallenge } from '../lib/bonusChallenges';

export default function DailyChallengeDebug() {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const dailyPrompt = getDailyPrompt('micro');
  const dailyBonusChallenge = getDailyBonusChallenge('micro');

  return (
    <div className="card p-4 soft-border bg-gray-50 text-xs">
      <h3 className="font-semibold mb-2">Daily Challenge Debug</h3>
      <div className="space-y-1">
        <p><strong>Date:</strong> {today.toDateString()}</p>
        <p><strong>Day of Year:</strong> {dayOfYear}</p>
        <p><strong>Daily Prompt:</strong> {dailyPrompt.text}</p>
        <p><strong>Bonus Challenge:</strong> {dailyBonusChallenge.title}</p>
        <p><strong>Challenge Type:</strong> {dailyBonusChallenge.type}</p>
        <p><strong>Difficulty:</strong> {dailyBonusChallenge.difficulty}</p>
      </div>
    </div>
  );
} 