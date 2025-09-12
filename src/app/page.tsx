'use client';

import { useEffect, useState } from "react";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getDailyPrompt } from '../lib/prompts';
import { useRouter } from 'next/navigation';
import DailyPromptTester from '../components/DailyPromptTester';

export default function Home() {
  const [dailyPrompt, setDailyPrompt] = useState(getDailyPrompt('micro'));
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  // Calculate time until next midnight and update prompt
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const difference = tomorrow.getTime() - now.getTime();
      
      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft({ hours, minutes, seconds });
      } else {
        // It's past midnight, update the prompt
        setDailyPrompt(getDailyPrompt('micro'));
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto p-8 relative">
        {/* Compact Scroll - Top Left */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="absolute top-8 left-8 z-10"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/creator-message')}
            className="cursor-pointer"
          >
            <div className="relative">
              {/* Scroll */}
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
                className="text-4xl text-warm-text"
              >
                📜
              </motion.div>
              
              {/* "Open Me" Text */}
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="text-center"
              >
                <p className="text-warm-text font-semibold text-sm">Open Me!</p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Centered Main Content */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-bold warm-text mt-10 mb-10"
          >
            Daily Story Challenge
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-lg text-text-secondary mb-8"
          >
            100-250 words • Daily prompts • Earn coins
          </motion.p>
          
          {/* Daily Challenge Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <div className="card p-6 inline-block max-w-2xl soft-border">

              <p className="text-warm-text font-medium text-lg mb-4">
                Today's prompt:
              </p>
              <div className="mb-6">
                <h3 className="text-xl text-warm-text font-semibold">{dailyPrompt.text}</h3>
              </div>

              {/* Countdown Timer */}
              <div className="border-t border-border-color pt-4">
                <p className="text-text-secondary text-sm mb-2">Next prompt in:</p>
                <div className="flex justify-center gap-3">
                  <div className="text-center">
                    <div className="bg-gradient-primary text-warm-white px-3 py-2 rounded-lg font-bold text-lg">
                      {timeLeft.hours.toString().padStart(2, '0')}
                    </div>
                    <p className="text-xs text-text-muted mt-1">Hours</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-gradient-primary text-warm-white px-3 py-2 rounded-lg font-bold text-lg">
                      {timeLeft.minutes.toString().padStart(2, '0')}
                    </div>
                    <p className="text-xs text-text-muted mt-1">Minutes</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-gradient-primary text-warm-white px-3 py-2 rounded-lg font-bold text-lg">
                      {timeLeft.seconds.toString().padStart(2, '0')}
                    </div>
                    <p className="text-xs text-text-muted mt-1">Seconds</p>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-center"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link 
                href="/write-story"
                className="inline-block btn-primary glow-on-hover text-xl font-semibold"
              >
                Start Today's Challenge
              </Link>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link 
                href="/daily-challenges"
                className="inline-block btn-secondary glow-on-hover text-lg font-medium"
              >
                View Today's Entries
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

      </div>
      
      {/* Daily Prompt Tester - Only show in development */}
      {process.env.NODE_ENV === 'development' && <DailyPromptTester />}
    </div>
  );
}
