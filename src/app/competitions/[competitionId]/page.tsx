'use client';

import { use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const competitions = [
  {
    id: 'spring2024',
    name: 'Spring 2024 Grand Competition',
    prompt: 'Write a story about a world where memories can be bought and sold. Explore the consequences for individuals and society.',
    cashPrize: '$500',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    wordLimit: 2000,
    rules: [
      'One entry per person.',
      'Original work only.',
      'Maximum 2000 words.',
      'Deadline is strictly enforced.',
      'No AI-generated stories.',
      'Stories must be written in English.',
      'Plagiarism will result in immediate disqualification.',
      'The decision of the judges is final.'
    ],
    description: 'This competition challenges writers to explore the ethical and emotional implications of a world where human memories have become a commodity. What happens to personal identity when memories can be traded? How does this affect relationships, society, and the human experience?'
  }
];

export default function CompetitionDetailsPage({ params }: { params: Promise<{ competitionId: string }> }) {
  const { competitionId } = use(params);
  const competition = competitions.find(c => c.id === competitionId);

  if (!competition) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Competition Not Found</h1>
          <p className="text-gray-600 mb-6">The competition you're looking for doesn't exist.</p>
          <Link href="/competitions">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-purple-600 text-white px-6 py-3 rounded-md shadow-sm font-medium hover:bg-purple-700 transition-colors duration-200"
            >
              Back to Competitions
            </motion.button>
          </Link>
        </div>
      </div>
    );
  }

  const timeRemaining = competition.deadline.getTime() - Date.now();
  const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link href="/competitions">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-secondary glow-on-hover"
            >
              ← Back to Competitions
            </motion.button>
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-8">
            <h1 className="text-3xl font-bold mb-4">{competition.name}</h1>
            <div className="flex flex-wrap gap-4">
              <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full font-semibold">
                Prize: {competition.cashPrize}
              </span>
              <span className="bg-red-400 text-red-900 px-3 py-1 rounded-full font-semibold">
                {daysRemaining} days remaining
              </span>
              <span className="bg-green-400 text-green-900 px-3 py-1 rounded-full font-semibold">
                {competition.wordLimit} words max
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Description */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-3">About This Competition</h2>
              <p className="text-gray-700 leading-relaxed">{competition.description}</p>
            </motion.div>

            {/* Prompt */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-6"
            >
              <h2 className="text-xl font-bold text-blue-800 mb-3">Writing Prompt</h2>
              <p className="text-blue-900 text-lg leading-relaxed">{competition.prompt}</p>
            </motion.div>

            {/* Rules */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">Competition Rules</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <ul className="space-y-3">
                  {competition.rules.map((rule, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Important Dates */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-6"
            >
              <h2 className="text-xl font-bold text-yellow-800 mb-3">Important Dates</h2>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-yellow-900 font-medium">Submission Deadline:</span>
                  <span className="text-yellow-900 font-semibold">{competition.deadline.toLocaleDateString()} at 11:59 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-yellow-900 font-medium">Time Remaining:</span>
                  <span className="text-yellow-900 font-semibold">{daysRemaining} days</span>
                </div>
              </div>
            </motion.div>

            {/* Action Button */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-center pt-6"
            >
              <Link href={`/write-competition?competition=${competition.id}&mode=timed`}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-purple-600 text-white px-12 py-4 rounded-md shadow-lg hover:bg-purple-700 transition-all duration-200 text-xl font-semibold"
                >
                  Enter Competition
                </motion.button>
              </Link>
              <p className="text-gray-600 mt-4">
                By entering, you agree to all competition rules and terms.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 