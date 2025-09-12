export interface BonusChallenge {
  id: string;
  title: string;
  description: string;
  type: 'word' | 'object' | 'emotion' | 'structure' | 'theme';
  difficulty: 'easy' | 'medium' | 'hard';
  points?: number;
}

export const bonusChallenges: BonusChallenge[] = [
  // Word-based challenges
  {
    id: 'word-repetition',
    title: 'Word Master',
    description: 'Use the word "whisper" exactly 5 times in your story',
    type: 'word',
    difficulty: 'medium',
    points: 10
  },
  {
    id: 'word-variety',
    title: 'Vocabulary Builder',
    description: 'Include the word "serendipity" in your story',
    type: 'word',
    difficulty: 'hard',
    points: 15
  },
  {
    id: 'word-sound',
    title: 'Sound Effects',
    description: 'Use the word "echo" at least 3 times',
    type: 'word',
    difficulty: 'easy',
    points: 5
  },
  {
    id: 'word-color',
    title: 'Color Palette',
    description: 'Include the word "crimson" in your story',
    type: 'word',
    difficulty: 'medium',
    points: 8
  },

  // Object-based challenges
  {
    id: 'object-clock',
    title: 'Time Keeper',
    description: 'Include a broken clock in your story',
    type: 'object',
    difficulty: 'easy',
    points: 5
  },
  {
    id: 'object-mirror',
    title: 'Reflection',
    description: 'Include a mirror that shows something unexpected',
    type: 'object',
    difficulty: 'medium',
    points: 10
  },
  {
    id: 'object-key',
    title: 'Key to Success',
    description: 'Include a mysterious key that opens something important',
    type: 'object',
    difficulty: 'medium',
    points: 8
  },
  {
    id: 'object-book',
    title: 'Ancient Tome',
    description: 'Include an old book with secrets',
    type: 'object',
    difficulty: 'easy',
    points: 5
  },

  // Emotion-based challenges
  {
    id: 'emotion-fear',
    title: 'Heart Racing',
    description: 'Make the reader feel genuine fear',
    type: 'emotion',
    difficulty: 'hard',
    points: 15
  },
  {
    id: 'emotion-joy',
    title: 'Pure Joy',
    description: 'Create a moment of pure happiness',
    type: 'emotion',
    difficulty: 'medium',
    points: 10
  },
  {
    id: 'emotion-nostalgia',
    title: 'Memory Lane',
    description: 'Evoke a sense of nostalgia',
    type: 'emotion',
    difficulty: 'medium',
    points: 8
  },

  // Structure-based challenges
  {
    id: 'structure-dialogue',
    title: 'Conversation Starter',
    description: 'Include exactly 3 lines of dialogue',
    type: 'structure',
    difficulty: 'medium',
    points: 10
  },
  {
    id: 'structure-question',
    title: 'Question Everything',
    description: 'End your story with a question',
    type: 'structure',
    difficulty: 'easy',
    points: 5
  },
  {
    id: 'structure-repetition',
    title: 'Echo Effect',
    description: 'Start and end with the same sentence',
    type: 'structure',
    difficulty: 'hard',
    points: 15
  },

  // Theme-based challenges
  {
    id: 'theme-redemption',
    title: 'Second Chance',
    description: 'Write about redemption or forgiveness',
    type: 'theme',
    difficulty: 'hard',
    points: 15
  },
  {
    id: 'theme-transformation',
    title: 'Metamorphosis',
    description: 'Include a character transformation',
    type: 'theme',
    difficulty: 'medium',
    points: 12
  },
  {
    id: 'theme-discovery',
    title: 'Hidden Truth',
    description: 'Reveal a surprising truth at the end',
    type: 'theme',
    difficulty: 'medium',
    points: 10
  }
];

// Get a random bonus challenge for the day
export function getDailyBonusChallenge(competitionId: string = 'micro'): BonusChallenge {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  
  // Use day of year to get consistent challenge for the day (same logic as daily prompts)
  const challengeIndex = dayOfYear % bonusChallenges.length;
  return bonusChallenges[challengeIndex];
}

// Check if a story meets the bonus challenge criteria
export function checkBonusChallenge(story: string, challenge: BonusChallenge): boolean {
  const lowerStory = story.toLowerCase();
  
  switch (challenge.type) {
    case 'word':
      if (challenge.id === 'word-repetition') {
        const wordCount = (lowerStory.match(/whisper/g) || []).length;
        return wordCount === 5;
      } else if (challenge.id === 'word-variety') {
        return lowerStory.includes('serendipity');
      } else if (challenge.id === 'word-sound') {
        const wordCount = (lowerStory.match(/echo/g) || []).length;
        return wordCount >= 3;
      } else if (challenge.id === 'word-color') {
        return lowerStory.includes('crimson');
      }
      break;
      
    case 'object':
      if (challenge.id === 'object-clock') {
        return lowerStory.includes('clock') || lowerStory.includes('broken');
      } else if (challenge.id === 'object-mirror') {
        return lowerStory.includes('mirror');
      } else if (challenge.id === 'object-key') {
        return lowerStory.includes('key');
      } else if (challenge.id === 'object-book') {
        return lowerStory.includes('book') || lowerStory.includes('tome');
      }
      break;
      
    case 'structure':
      if (challenge.id === 'structure-dialogue') {
        const dialogueCount = (lowerStory.match(/"/g) || []).length / 2;
        return dialogueCount === 3;
      } else if (challenge.id === 'structure-question') {
        return lowerStory.trim().endsWith('?');
      } else if (challenge.id === 'structure-repetition') {
        const sentences = lowerStory.split(/[.!?]+/).filter(s => s.trim().length > 0);
        if (sentences.length < 2) return false;
        const first = sentences[0].trim();
        const last = sentences[sentences.length - 1].trim();
        return first === last;
      }
      break;
      
    // For emotion and theme challenges, we'll use a simple keyword check
    // In a real implementation, you might want more sophisticated analysis
    case 'emotion':
    case 'theme':
      const keywords = {
        'emotion-fear': ['fear', 'terrified', 'scared', 'horror', 'panic'],
        'emotion-joy': ['joy', 'happy', 'delighted', 'ecstatic', 'elated'],
        'emotion-nostalgia': ['memory', 'remember', 'past', 'childhood', 'nostalgic'],
        'theme-redemption': ['redemption', 'forgiveness', 'forgive', 'second chance'],
        'theme-transformation': ['transform', 'change', 'become', 'metamorphosis'],
        'theme-discovery': ['discover', 'reveal', 'truth', 'secret', 'hidden']
      };
      
      const challengeKeywords = keywords[challenge.id as keyof typeof keywords] || [];
      return challengeKeywords.some(keyword => lowerStory.includes(keyword));
  }
  
  return false;
}

// Get difficulty color for UI
export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'easy': return 'text-green-500';
    case 'medium': return 'text-yellow-500';
    case 'hard': return 'text-red-500';
    default: return 'text-gray-500';
  }
}

// Get difficulty badge color
export function getDifficultyBadgeColor(difficulty: string): string {
  switch (difficulty) {
    case 'easy': return 'bg-green-100 text-green-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'hard': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

// Get bonus challenges by type (for future use with different competition types)
export function getBonusChallengesByType(type: string): BonusChallenge[] {
  return bonusChallenges.filter(challenge => challenge.type === type);
}

// Get a random bonus challenge (for testing or special events)
export function getRandomBonusChallenge(): BonusChallenge {
  const randomIndex = Math.floor(Math.random() * bonusChallenges.length);
  return bonusChallenges[randomIndex];
} 