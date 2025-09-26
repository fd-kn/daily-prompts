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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Competition Not Found</h1>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">The competition you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/competitions">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-md shadow-sm font-medium hover:bg-purple-700 transition-colors duration-200 text-sm sm:text-base w-full sm:w-auto"
            >
              Back to Competitions
            </motion.button>
          </Link>
        </div>
      </div>
    );
  }

  const timeRemaining = competition.deadline.getTime() - Date.now();

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 sm:mb-8"
        >
          <Link href="/competitions">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-secondary glow-on-hover text-sm sm:text-base"
            >
              ← Back to Competitions
            </motion.button>
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold warm-text mb-4 sm:mb-6">
            {competition.name}
          </h1>
          <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto px-4">
            {competition.description}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Competition Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="card p-4 sm:p-6 soft-border">
              <h2 className="text-lg sm:text-xl font-bold warm-text mb-4">Competition Prompt</h2>
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                {competition.prompt}
              </p>
            </div>

            <div className="card p-4 sm:p-6 soft-border">
              <h2 className="text-lg sm:text-xl font-bold warm-text mb-4">Rules & Guidelines</h2>
              <ul className="space-y-2 text-sm sm:text-base text-text-secondary">
                {competition.rules.map((rule, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-muted-amber mt-1">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Competition Info & Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6"
          >
            <div className="card p-4 sm:p-6 soft-border">
              <h2 className="text-lg sm:text-xl font-bold warm-text mb-4">Competition Details</h2>
              <div className="space-y-3 text-sm sm:text-base">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Cash Prize:</span>
                  <span className="font-semibold text-warm-text">{competition.cashPrize}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Word Limit:</span>
                  <span className="font-semibold text-warm-text">{competition.wordLimit} words</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Deadline:</span>
                  <span className="font-semibold text-warm-text">
                    {competition.deadline.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="card p-4 sm:p-6 soft-border text-center">
              <h3 className="text-lg sm:text-xl font-bold warm-text mb-4">Ready to Compete?</h3>
              <p className="text-sm sm:text-base text-text-secondary mb-6">
                Submit your story and compete for the grand prize!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary glow-on-hover text-base sm:text-lg font-semibold w-full sm:w-auto"
              >
                Submit Entry
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 