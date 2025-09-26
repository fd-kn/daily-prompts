import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface UserCoins {
  userId: string;
  totalCoins: number;
  storiesCompleted: number;
  bonusChallengesCompleted: number;
  competitionsWon: number;
  competitionsParticipated: number;
  lastUpdated: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'writing' | 'competition' | 'achievement';
  requirement: number;
  earned: boolean;
  earnedDate?: Date;
}

export interface UserBadges {
  userId: string;
  badges: Badge[];
  lastUpdated: Date;
}

// Coin rewards and penalties
export const COIN_REWARDS = {
  STORY_COMPLETION: 20,
  COMPETITION_WIN: 100,
  COMPETITION_PARTICIPATION: 25,
} as const;

export const COIN_PENALTIES = {
  UNPUBLISH_STORY: 5,
} as const;

// Badge definitions
export const BADGE_DEFINITIONS: Omit<Badge, 'earned' | 'earnedDate'>[] = [
  // Writing badges
  {
    id: 'first-story',
    name: 'First Steps',
    description: 'Write your first story',
    icon: '📝',
    category: 'writing',
    requirement: 1,
  },
  {
    id: 'storyteller',
    name: 'Storyteller',
    description: 'Write 5 stories',
    icon: '📚',
    category: 'writing',
    requirement: 5,
  },
  {
    id: 'novelist',
    name: 'Novelist',
    description: 'Write 10 stories',
    icon: '✍️',
    category: 'writing',
    requirement: 10,
  },
  {
    id: 'master-writer',
    name: 'Master Writer',
    description: 'Write 25 stories',
    icon: '🏆',
    category: 'writing',
    requirement: 25,
  },
  {
    id: 'bonus-hunter',
    name: 'Bonus Hunter',
    description: 'Complete 5 bonus challenges',
    icon: '🎯',
    category: 'writing',
    requirement: 5,
  },
  {
    id: 'bonus-master',
    name: 'Bonus Master',
    description: 'Complete 15 bonus challenges',
    icon: '🎖️',
    category: 'writing',
    requirement: 15,
  },
  // Competition badges
  {
    id: 'first-competition',
    name: 'First Competition',
    description: 'Participate in your first competition',
    icon: '🏁',
    category: 'competition',
    requirement: 1,
  },
  {
    id: 'competitor',
    name: 'Competitor',
    description: 'Participate in 5 competitions',
    icon: '⚔️',
    category: 'competition',
    requirement: 5,
  },
  {
    id: 'champion',
    name: 'Champion',
    description: 'Win your first competition',
    icon: '👑',
    category: 'competition',
    requirement: 1,
  },
  {
    id: 'grand-champion',
    name: 'Grand Champion',
    description: 'Win 3 competitions',
    icon: '💎',
    category: 'competition',
    requirement: 3,
  },
  // Achievement badges
  {
    id: 'coin-collector',
    name: 'Coin Collector',
    description: 'Earn 100 coins',
    icon: '💰',
    category: 'achievement',
    requirement: 100,
  },
  {
    id: 'coin-master',
    name: 'Coin Master',
    description: 'Earn 500 coins',
    icon: '💰',
    category: 'achievement',
    requirement: 500,
  },
  {
    id: 'coin-legend',
    name: 'Coin Legend',
    description: 'Earn 1000 coins',
    icon: '💎',
    category: 'achievement',
    requirement: 1000,
  },
];

// Get user coins
export async function getUserCoins(userId: string): Promise<UserCoins | null> {
  try {
    const docRef = doc(db, 'userCoins', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        userId,
        totalCoins: data.totalCoins || 0,
        storiesCompleted: data.storiesCompleted || 0,
        bonusChallengesCompleted: data.bonusChallengesCompleted || 0,
        competitionsWon: data.competitionsWon || 0,
        competitionsParticipated: data.competitionsParticipated || 0,
        lastUpdated: data.lastUpdated?.toDate() || new Date()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user coins:', error);
    return null;
  }
}

// Update user coins
export async function updateUserCoins(userId: string, coinsToAdd: number, type: 'story' | 'bonus' | 'competition_win' | 'competition_participation' | 'unpublish'): Promise<void> {
  try {
    console.log('🪙 updateUserCoins called with:', { userId, coinsToAdd, type });
    const docRef = doc(db, 'userCoins', userId);
    const docSnap = await getDoc(docRef);
    
    let currentCoins: UserCoins;
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      currentCoins = {
        userId,
        totalCoins: data.totalCoins || 0,
        storiesCompleted: data.storiesCompleted || 0,
        bonusChallengesCompleted: data.bonusChallengesCompleted || 0,
        competitionsWon: data.competitionsWon || 0,
        competitionsParticipated: data.competitionsParticipated || 0,
        lastUpdated: data.lastUpdated?.toDate() || new Date()
      };
    } else {
      currentCoins = {
        userId,
        totalCoins: 0,
        storiesCompleted: 0,
        bonusChallengesCompleted: 0,
        competitionsWon: 0,
        competitionsParticipated: 0,
        lastUpdated: new Date()
      };
    }
    
    // Update coins and stats
    currentCoins.totalCoins += coinsToAdd;
    if (type === 'story') {
      currentCoins.storiesCompleted += 1;
    } else if (type === 'bonus') {
      currentCoins.bonusChallengesCompleted += 1;
    } else if (type === 'competition_win') {
      currentCoins.competitionsWon += 1;
    } else if (type === 'competition_participation') {
      currentCoins.competitionsParticipated += 1;
    }
    
    currentCoins.lastUpdated = new Date();
    
    // Save to Firestore
    console.log('💾 Saving to Firestore:', currentCoins);
    await setDoc(docRef, currentCoins);
    console.log('✅ Successfully saved coins to Firestore for user:', userId);
  } catch (error) {
    console.error('❌ Error updating user coins:', error);
  }
}

// Get user badges
export async function getUserBadges(userId: string): Promise<UserBadges | null> {
  try {
    const docRef = doc(db, 'userBadges', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        userId,
        badges: data.badges || [],
        lastUpdated: data.lastUpdated?.toDate() || new Date()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user badges:', error);
    return null;
  }
}

// Check and award badges
export async function checkAndAwardBadges(userId: string, userCoins: UserCoins): Promise<Badge[]> {
  try {
    const userBadges = await getUserBadges(userId) || { userId, badges: [], lastUpdated: new Date() };
    const earnedBadges: Badge[] = [];
    
    for (const badgeDef of BADGE_DEFINITIONS) {
      // Check if badge is already earned
      const existingBadge = userBadges.badges.find(b => b.id === badgeDef.id);
      if (existingBadge?.earned) continue;
      
      let shouldAward = false;
      
      // Check requirements based on badge category
      switch (badgeDef.category) {
        case 'writing':
          if (badgeDef.id.includes('story')) {
            shouldAward = userCoins.storiesCompleted >= badgeDef.requirement;
          } else if (badgeDef.id.includes('bonus')) {
            shouldAward = userCoins.bonusChallengesCompleted >= badgeDef.requirement;
          }
          break;
        case 'competition':
          if (badgeDef.id.includes('win')) {
            shouldAward = userCoins.competitionsWon >= badgeDef.requirement;
          } else {
            shouldAward = userCoins.competitionsParticipated >= badgeDef.requirement;
          }
          break;
        case 'achievement':
          shouldAward = userCoins.totalCoins >= badgeDef.requirement;
          break;
      }
      
      if (shouldAward) {
        const newBadge: Badge = {
          ...badgeDef,
          earned: true,
          earnedDate: new Date()
        };
        
        userBadges.badges.push(newBadge);
        earnedBadges.push(newBadge);
      }
    }
    
    // Save updated badges
    if (earnedBadges.length > 0) {
      userBadges.lastUpdated = new Date();
      const docRef = doc(db, 'userBadges', userId);
      await setDoc(docRef, userBadges);
    }
    
    return earnedBadges;
  } catch (error) {
    console.error('Error checking badges:', error);
    return [];
  }
}

// Get badge color based on category
export function getBadgeColor(category: Badge['category']): string {
  switch (category) {
    case 'writing': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'competition': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'achievement': return 'bg-amber-100 text-amber-800 border-amber-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
} 