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


// Get difficulty badge color
export function getDifficultyBadgeColor(difficulty: string): string {
  switch (difficulty) {
    case 'easy': return 'bg-green-100 text-green-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'hard': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}
