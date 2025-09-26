'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useSearchParams, useRouter } from 'next/navigation';
import { getRandomPrompt } from '../../lib/prompts';

interface Story {
  id: string;
  title: string;
  story: string;
  createdAt: Date;
  competitionId?: string;
  status?: 'draft';
  mode?: string;
  promptCategory?: string;
  promptText?: string;
  promptDescription?: string;
}

const competitions = [
  {
    id: 'flash',
    name: 'Flash Fiction',
    wordLimit: 300,
    description: 'Quick, impactful stories'
  },
  {
    id: 'short',
    name: 'Short Story',
    wordLimit: 1000,
    description: 'Traditional short stories'
  },
  {
    id: 'novella',
    name: 'Novella',
    wordLimit: 5000,
    description: 'Longer narratives'
  }
];

export default function CasualPage() {
  const [draftStories, setDraftStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'create' | 'drafts'>('create');
  const [selectedCompetition, setSelectedCompetition] = useState<typeof competitions[0] | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<{ text: string; description?: string } | null>(null);
  const [showPromptSelection, setShowPromptSelection] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    loadStories();
    const tabParam = searchParams.get('tab');
    if (tabParam === 'drafts') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const loadStories = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'stories'));
      const storiesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        competitionId: doc.data().competitionId || 'micro',
        mode: doc.data().mode || 'casual',
        status: doc.data().status || 'draft'
      })) as Story[];
      
      const casualStories = storiesData.filter(story => 
        story.competitionId !== 'micro' && story.mode === 'casual'
      );
      
      const drafts = casualStories.filter(story => story.status === 'draft');
      
      drafts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      setDraftStories(drafts);
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompetitionSelect = (competition: typeof competitions[0]) => {
    setSelectedCompetition(competition);
    setCurrentPrompt(getRandomPrompt(competition.id));
    setShowPromptSelection(true);
  };

  const handleReshufflePrompt = () => {
    if (selectedCompetition) {
      setCurrentPrompt(getRandomPrompt(selectedCompetition.id));
    }
  };


  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Back Button */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 sm:mb-8"
        >
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-secondary glow-on-hover text-sm sm:text-base"
            >
              ← Back to Home
            </motion.button>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold warm-text mb-4 sm:mb-6">Casual Writing</h1>
          <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto px-4">
            Write at your own pace, explore any genre, and let your creativity flow without pressure
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center mb-6 sm:mb-8"
        >
          <div className="card p-1 w-full max-w-md">
            <div className="flex">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('create')}
                className={`flex-1 px-3 sm:px-6 py-2 sm:py-3 rounded-md font-medium transition-all duration-200 text-sm sm:text-base ${
                  activeTab === 'create'
                    ? 'bg-gradient-primary text-warm-white shadow-sm'
                    : 'text-text-secondary hover:text-warm-text'
                }`}
              >
                Write New Story
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('drafts')}
                className={`flex-1 px-3 sm:px-6 py-2 sm:py-3 rounded-md font-medium transition-all duration-200 text-sm sm:text-base ${
                  activeTab === 'drafts'
                    ? 'bg-gradient-primary text-warm-white shadow-sm'
                    : 'text-text-secondary hover:text-warm-text'
                }`}
              >
                Drafts ({draftStories.length})
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {!showPromptSelection ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mb-8 sm:mb-12"
                >
                  <h2 className="text-xl sm:text-2xl font-bold warm-text mb-4 sm:mb-6">Choose Your Story Length</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {competitions.map((competition, index) => (
                      <motion.button
                        key={competition.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleCompetitionSelect(competition)}
                        className="card p-4 sm:p-6 rounded-lg border-2 transition-all duration-200 hover:soft-border text-left"
                      >
                        <h3 className="font-bold text-lg sm:text-xl mb-2 text-warm-text">{competition.name}</h3>
                        <p className="text-text-secondary mb-3 text-sm sm:text-base">{competition.description}</p>
                        <p className="text-muted-amber font-semibold text-sm sm:text-base">{competition.wordLimit} words</p>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-2xl mx-auto"
                >
                  <div className="text-center mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl font-bold warm-text mb-2">{selectedCompetition?.name}</h2>
                    <p className="text-text-secondary text-sm sm:text-base">{selectedCompetition?.wordLimit} words</p>
                  </div>

                  <div className="card p-4 sm:p-6 soft-border mb-6 sm:mb-8">
                    <div className="text-center space-y-3 sm:space-y-4">
                      <div className="space-y-2">
                        <p className="text-lg sm:text-xl text-warm-text font-medium">{currentPrompt?.text}</p>
                        {currentPrompt?.description && (
                          <p className="text-text-secondary text-sm sm:text-base">{currentPrompt.description}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleReshufflePrompt}
                      className="btn-secondary glow-on-hover text-sm sm:text-base py-2 sm:py-3 px-4 sm:px-6"
                    >
                      🔀 New Prompt
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push(`/write-story?competition=${selectedCompetition?.id}&prompt=${encodeURIComponent(currentPrompt?.text || '')}`)}
                      className="btn-primary glow-on-hover text-sm sm:text-base py-2 sm:py-3 px-4 sm:px-6"
                    >
                      ✍️ Start Writing
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowPromptSelection(false)}
                      className="btn-secondary glow-on-hover text-sm sm:text-base py-2 sm:py-3 px-4 sm:px-6"
                    >
                      ← Back
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'drafts' && (
            <motion.div
              key="drafts"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold warm-text mb-4 sm:mb-6">Your Drafts</h2>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">⏳</div>
                    <p className="text-text-secondary">Loading your drafts...</p>
                  </div>
                ) : draftStories.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📝</div>
                    <p className="text-text-secondary mb-4">No drafts yet. Start writing your first story!</p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab('create')}
                      className="btn-primary glow-on-hover text-sm sm:text-base"
                    >
                      Write New Story
                    </motion.button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {draftStories.map((story, index) => (
                      <motion.div
                        key={story.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="card p-4 sm:p-6 soft-border hover:shadow-lg transition-all duration-200"
                      >
                        <h3 className="font-bold text-lg sm:text-xl mb-2 text-warm-text line-clamp-2">{story.title}</h3>
                        <p className="text-text-secondary text-sm sm:text-base mb-3 line-clamp-3">{story.story}</p>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.push(`/write-story?draft=${story.id}`)}
                            className="btn-primary glow-on-hover text-xs sm:text-sm py-2 px-3 sm:px-4"
                          >
                            Continue Writing
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.push(`/story/${story.id}`)}
                            className="btn-secondary glow-on-hover text-xs sm:text-sm py-2 px-3 sm:px-4"
                          >
                            View
                          </motion.button>
                        </div>
                        <p className="text-xs text-text-muted mt-3">
                          {story.createdAt.toLocaleDateString()}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 