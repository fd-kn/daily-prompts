'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Link from 'next/link';

export default function CreatorMessage() {
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await addDoc(collection(db, 'waitingList'), {
        email: email.trim().toLowerCase(),
        createdAt: new Date(),
        source: 'creator-message'
      });
      
      setIsSubmitted(true);
      setEmail('');
    } catch (error) {
      console.error('Error adding email to waiting list:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) {
      setFeedbackError('Please enter your feedback');
      return;
    }

    setIsSubmitting(true);
    setFeedbackError('');

    try {
      await addDoc(collection(db, 'feedback'), {
        feedback: feedback.trim(),
        createdAt: new Date(),
        source: 'creator-message'
      });
      
      setIsFeedbackSubmitted(true);
      setFeedback('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setFeedbackError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto p-8">
        {/* Back Button */}
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

        {/* Creator Message - First */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-6xl mb-6"
          >
            🎉
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-3xl font-bold warm-text mb-6"
          >
            Welcome to the Beta of StoryMode!
          </motion.h1>
        </motion.div>

        {/* Message Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="card p-6 soft-border mb-6"
        >
          <div className="text-text-secondary leading-relaxed space-y-4">
            <p>
              Hi there! Thanks so much for checking this out.
            </p>
            <p>
              This is very much a beta, which means things might look a little weird, feel unfinished, or even break completely 🙃. I'm testing the core idea right now, and pretty much everything is still open to change.
            </p>
            <p>
              I'd really love your honest feedback — what feels fun, what feels clunky, what you'd change, and what you'd love to see added. Don't hold back! Be mean, tell me if it sucks, or if it's something you'd genuinely use.
            </p>
            <p>
              If you sign up for the waiting list, I'll keep you updated as new features roll out. Plus, as a thank you for being an early tester and for joining the waiting list, you'll get a special membership later on that won't be available to anyone else.
            </p>
            <p>
              Thanks again for being here at the start — I hope this platform grows into something you'll enjoy using.
            </p>
            <p className="font-semibold text-warm-text">
              Happy writing! ✍️
            </p>
          </div>
        </motion.div>

        {/* Email Signup - Second */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="card p-6 soft-border mb-6"
        >
          <h3 className="text-lg font-bold warm-text mb-3 text-center">
            Join the Waiting List
          </h3>
          <p className="text-text-secondary text-center mb-4 text-sm">
            Be the first to know when new features launch! Enter your email below to get early access and exclusive updates.
          </p>

          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-3 bg-green-50 rounded-lg border border-green-200"
            >
              <div className="text-xl mb-1">🎉</div>
              <p className="text-green-800 font-semibold text-sm">You're on the list!</p>
              <p className="text-green-700 text-xs">We'll notify you as soon as the new features are ready.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="input-field w-full text-center"
                  disabled={isSubmitting}
                />
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-2 text-center"
                  >
                    {error}
                  </motion.p>
                )}
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
                className="btn-primary glow-on-hover w-full"
              >
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    Joining...
                  </motion.div>
                ) : (
                  'Join Waiting List'
                )}
              </motion.button>
            </form>
          )}
        </motion.div>

        {/* Feedback Form - Third */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="card p-6 soft-border"
        >
          <h3 className="text-lg font-bold warm-text mb-3 text-center">
            Share Your Feedback
          </h3>
          <p className="text-text-secondary text-center mb-4 text-sm">
          Tell me what you think! What’s working, what’s not, and what you’d like to see added. Feedback is anonymous and super appreciated.
          </p>

          {isFeedbackSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-3 bg-green-50 rounded-lg border border-green-200"
            >
              <div className="text-xl mb-1">💬</div>
              <p className="text-green-800 font-semibold text-sm">Thanks for your feedback!</p>
              <p className="text-green-700 text-xs">Your input helps make this platform better.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-3">
              <div>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share your thoughts, suggestions, or any issues you've encountered..."
                  className="input-field w-full min-h-[120px] resize-none"
                  disabled={isSubmitting}
                  rows={5}
                />
                {feedbackError && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-2 text-center"
                  >
                    {feedbackError}
                  </motion.p>
                )}
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
                className="btn-primary glow-on-hover w-full"
              >
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    Submitting...
                  </motion.div>
                ) : (
                  'Submit Feedback'
                )}
              </motion.button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
} 