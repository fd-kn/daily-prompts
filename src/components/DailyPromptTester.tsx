'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { setTestDate, getDailyPrompt } from '../lib/prompts';

export default function DailyPromptTester() {
  const [isVisible, setIsVisible] = useState(false);
  const [testDate, setTestDateState] = useState<string>('');

  const testDates = [
    { label: 'Today', date: new Date() },
    { label: 'Tomorrow', date: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    { label: 'Day After Tomorrow', date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
    { label: 'Next Week', date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    { label: 'Next Month', date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  ];

  const handleTestDate = (date: Date) => {
    setTestDate(date);
    setTestDateState(date.toDateString());
    console.log('🧪 Testing with date:', date.toDateString());
  };

  const resetToRealDate = () => {
    setTestDate(null);
    setTestDateState('');
    console.log('🔄 Reset to real date');
  };

  const getCurrentPrompt = () => {
    return getDailyPrompt('micro');
  };

  if (!isVisible) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50"
      >
        🧪 Test Daily Prompt
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 max-w-sm"
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-gray-800">🧪 Daily Prompt Tester</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        <div className="text-sm">
          <strong>Current Prompt:</strong>
          <div className="mt-1 p-2 bg-gray-100 rounded text-xs">
            {getCurrentPrompt().text}
          </div>
        </div>

        {testDate && (
          <div className="text-sm">
            <strong>Test Date:</strong> {testDate}
          </div>
        )}

        <div className="space-y-2">
          <div className="text-sm font-semibold">Test Different Dates:</div>
          {testDates.map((item, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTestDate(item.date)}
              className="block w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded text-sm transition-colors"
            >
              {item.label} ({item.date.toDateString()})
            </motion.button>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={resetToRealDate}
          className="w-full px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm transition-colors"
        >
          🔄 Reset to Real Date
        </motion.button>
      </div>
    </motion.div>
  );
} 