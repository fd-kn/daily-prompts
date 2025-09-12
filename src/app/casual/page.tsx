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
  const [selectedCompetition, setSelectedCompetition] = useState<any>(null);
  const [currentPrompt, setCurrentPrompt] = useState<any>(null);
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

  const handleCompetitionSelect = (competition: any) => {
    setSelectedCompetition(competition);
    setCurrentPrompt(getRandomPrompt(competition.id));
    setShowPromptSelection(true);
  };

  const handleReshufflePrompt = () => {
    if (selectedCompetition) {
      setCurrentPrompt(getRandomPrompt(selectedCompetition.id));
    }
  };

  const handleAcceptPrompt = () => {
    if (selectedCompetition && currentPrompt) {
      const params = new URLSearchParams({
        competition: selectedCompetition.id,
        mode: 'casual',
        prompt: currentPrompt.text,
        category: currentPrompt.category
      });
      if (currentPrompt.description) {
        params.append('description', currentPrompt.description);
      }
      router.push(`/write-competition?${params.toString()}`);
    }
  };

  const handleBackToSelection = () => {
    setShowPromptSelection(false);
    setSelectedCompetition(null);
    setCurrentPrompt(null);
  };

  const renderStoryCard = (story: Story, isDraft: boolean = false) => (
    <motion.div 
      key={story.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01, y: -2 }}
      className="card p-6"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <Link href={`/story/${story.id}`} className="block cursor-pointer">
            <h3 className="font-bold text-xl text-warm-text hover:text-muted-amber transition-colors duration-200 mb-3">
              {story.title}
            </h3>
          </Link>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary mb-3">
            <span className="bg-gradient-primary text-warm-white px-2 py-1 rounded-full font-medium">
              Casual
            </span>
            {isDraft && (
              <span className="bg-gradient-secondary text-warm-text px-2 py-1 rounded-full font-medium">
                Draft
              </span>
            )}
          </div>
          
          <div className="text-sm text-text-muted mb-3">
            <span>Created on {story.createdAt.toLocaleDateString()} at {story.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          
          {story.promptText && (
            <div className="text-sm text-text-secondary">
              <p className="font-medium text-warm-text mb-1">Prompt: {story.promptText}</p>
              {story.promptDescription && (
                <p className="text-text-muted text-xs">{story.promptDescription}</p>
              )}
            </div>
          )}
        </div>
        
        {isDraft && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-secondary glow-on-hover ml-4"
            onClick={() => router.push(`/story/${story.id}`)}
          >
            Edit
          </motion.button>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-8">
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

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold warm-text mb-6">Casual Writing</h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Write at your own pace, explore any genre, and let your creativity flow without pressure
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="card p-1">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('create')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
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
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'drafts'
                  ? 'bg-gradient-primary text-warm-white shadow-sm'
                  : 'text-text-secondary hover:text-warm-text'
              }`}
            >
              Drafts ({draftStories.length})
            </motion.button>
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
                className="mb-12"
              >
                  <h2 className="text-2xl font-bold warm-text mb-6">Choose Your Story Length</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {competitions.map((competition, index) => (
                    <motion.button
                      key={competition.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCompetitionSelect(competition)}
                        className="card p-6 rounded-lg border-2 transition-all duration-200 hover:soft-border"
                    >
                        <h3 className="font-bold text-xl mb-2 text-warm-text">{competition.name}</h3>
                        <p className="text-text-secondary mb-3">{competition.description}</p>
                        <p className="text-muted-amber font-semibold">{competition.wordLimit} words</p>
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
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold warm-text mb-2">{selectedCompetition?.name}</h2>
                    <p className="text-text-secondary">{selectedCompetition?.wordLimit} words</p>
                  </div>

                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="card p-8 soft-border mb-8"
                  >
                    <div className="text-center space-y-4">
                      <div className="space-y-2">
                        <p className="text-xl text-warm-text font-medium">{currentPrompt?.text}</p>
                        {currentPrompt?.description && (
                          <p className="text-text-secondary text-sm">{currentPrompt.description}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  <div className="flex gap-4 justify-center">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleReshufflePrompt}
                      className="btn-secondary glow-on-hover"
                    >
                      🔄 Reshuffle
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAcceptPrompt}
                      className="btn-primary glow-on-hover"
                    >
                      ✍️ Start Writing
                    </motion.button>
                  </div>

                  <div className="text-center mt-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleBackToSelection}
                      className="text-text-secondary hover:text-warm-text transition-colors duration-200"
                    >
                      ← Choose Different Length
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
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold warm-text mb-6">My Drafts</h2>
                
                {loading ? (
                  <div className="text-center py-12">
                    <div className="text-2xl mb-4">⚡</div>
                    <p className="text-text-secondary">Loading your drafts...</p>
                  </div>
                ) : draftStories.length > 0 ? (
                  <div className="space-y-6">
                    <AnimatePresence>
                      {draftStories.map((story) => renderStoryCard(story, true))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center py-12"
                  >
                    <div className="text-4xl mb-4">📝</div>
                    <h3 className="text-xl font-semibold text-warm-text mb-2">No Drafts Yet</h3>
                    <p className="text-text-secondary mb-4">Start writing to create your first draft!</p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab('create')}
                      className="btn-primary glow-on-hover"
                    >
                      Write Your First Story
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 