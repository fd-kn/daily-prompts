export interface UserProgress {
  userId: string;
  totalPoints: number;
  currentLevel: number;
  pointsInCurrentLevel: number;
  pointsToNextLevel: number;
  storiesCompleted: number;
  bonusChallengesCompleted: number;
  lastUpdated: Date;
}

export interface LevelInfo {
  level: number;
  minPoints: number;
  maxPoints: number;
  pointsNeeded: number;
  title: string;
  description: string;
}

// Level definitions
export const levels: LevelInfo[] = [
  { level: 1, minPoints: 0, maxPoints: 49, pointsNeeded: 50, title: "Novice Writer", description: "Just getting started on your writing journey" },
  { level: 2, minPoints: 50, maxPoints: 124, pointsNeeded: 75, title: "Storyteller", description: "Finding your voice and developing your craft" },
  { level: 3, minPoints: 125, maxPoints: 224, pointsNeeded: 100, title: "Wordsmith", description: "Crafting compelling narratives with skill" },
  { level: 4, minPoints: 225, maxPoints: 374, pointsNeeded: 150, title: "Narrative Artist", description: "Creating vivid worlds and memorable characters" },
  { level: 5, minPoints: 375, maxPoints: 599, pointsNeeded: 225, title: "Master Storyteller", description: "Weaving complex tales that captivate readers" },
  { level: 6, minPoints: 600, maxPoints: 899, pointsNeeded: 300, title: "Literary Virtuoso", description: "Achieving excellence in the art of storytelling" },
  { level: 7, minPoints: 900, maxPoints: 1299, pointsNeeded: 400, title: "Wordsmith Legend", description: "A true master of narrative craft" },
  { level: 8, minPoints: 1300, maxPoints: 1799, pointsNeeded: 500, title: "Storytelling Sage", description: "Wisdom and mastery in every word" },
  { level: 9, minPoints: 1800, maxPoints: 2399, pointsNeeded: 600, title: "Narrative Master", description: "Unparalleled skill in storytelling" },
  { level: 10, minPoints: 2400, maxPoints: 999999, pointsNeeded: 0, title: "Grand Storyteller", description: "Legendary status achieved" }
];

// Point rewards
export const POINT_REWARDS = {
  STORY_COMPLETION: 20,
  BONUS_CHALLENGE: 15,
  DAILY_STREAK: 5, // Bonus for consecutive days
  FIRST_STORY: 10, // Bonus for first story
  WEEKLY_GOAL: 25, // Bonus for completing weekly goals
} as const;

// Calculate level information based on total points
export function calculateLevelInfo(totalPoints: number): LevelInfo {
  const level = levels.find(l => totalPoints >= l.minPoints && totalPoints <= l.maxPoints) || levels[0];
  return level;
}

// Calculate progress within current level
export function calculateLevelProgress(totalPoints: number): {
  currentLevel: number;
  pointsInCurrentLevel: number;
  pointsToNextLevel: number;
  progressPercentage: number;
} {
  const levelInfo = calculateLevelInfo(totalPoints);
  const pointsInCurrentLevel = totalPoints - levelInfo.minPoints;
  const pointsToNextLevel = levelInfo.pointsNeeded - pointsInCurrentLevel;
  const progressPercentage = Math.min(100, (pointsInCurrentLevel / levelInfo.pointsNeeded) * 100);

  return {
    currentLevel: levelInfo.level,
    pointsInCurrentLevel,
    pointsToNextLevel,
    progressPercentage
  };
}

// Get user progress from Firestore
export async function getUserProgress(userId: string): Promise<UserProgress | null> {
  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const { db } = await import('./firebase');
    
    const docRef = doc(db, 'userProgress', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        userId,
        totalPoints: data.totalPoints || 0,
        currentLevel: data.currentLevel || 1,
        pointsInCurrentLevel: data.pointsInCurrentLevel || 0,
        pointsToNextLevel: data.pointsToNextLevel || 50,
        storiesCompleted: data.storiesCompleted || 0,
        bonusChallengesCompleted: data.bonusChallengesCompleted || 0,
        lastUpdated: data.lastUpdated?.toDate() || new Date()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user progress:', error);
    return null;
  }
}

// Create or update user progress
export async function updateUserProgress(userId: string, pointsToAdd: number, type: 'story' | 'bonus'): Promise<void> {
  try {
    const { doc, setDoc, getDoc } = await import('firebase/firestore');
    const { db } = await import('./firebase');
    
    const docRef = doc(db, 'userProgress', userId);
    const docSnap = await getDoc(docRef);
    
    let currentProgress: UserProgress;
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      currentProgress = {
        userId,
        totalPoints: data.totalPoints || 0,
        currentLevel: data.currentLevel || 1,
        pointsInCurrentLevel: data.pointsInCurrentLevel || 0,
        pointsToNextLevel: data.pointsToNextLevel || 50,
        storiesCompleted: data.storiesCompleted || 0,
        bonusChallengesCompleted: data.bonusChallengesCompleted || 0,
        lastUpdated: data.lastUpdated?.toDate() || new Date()
      };
    } else {
      currentProgress = {
        userId,
        totalPoints: 0,
        currentLevel: 1,
        pointsInCurrentLevel: 0,
        pointsToNextLevel: 50,
        storiesCompleted: 0,
        bonusChallengesCompleted: 0,
        lastUpdated: new Date()
      };
    }
    
    // Update points and stats
    currentProgress.totalPoints += pointsToAdd;
    if (type === 'story') {
      currentProgress.storiesCompleted += 1;
    } else if (type === 'bonus') {
      currentProgress.bonusChallengesCompleted += 1;
    }
    
    // Recalculate level information
    const levelProgress = calculateLevelProgress(currentProgress.totalPoints);
    currentProgress.currentLevel = levelProgress.currentLevel;
    currentProgress.pointsInCurrentLevel = levelProgress.pointsInCurrentLevel;
    currentProgress.pointsToNextLevel = levelProgress.pointsToNextLevel;
    currentProgress.lastUpdated = new Date();
    
    // Save to Firestore
    await setDoc(docRef, currentProgress);
  } catch (error) {
    console.error('Error updating user progress:', error);
  }
}

// Get level badge color
export function getLevelBadgeColor(level: number): string {
  if (level >= 8) return 'bg-purple-100 text-purple-800';
  if (level >= 6) return 'bg-blue-100 text-blue-800';
  if (level >= 4) return 'bg-green-100 text-green-800';
  if (level >= 2) return 'bg-yellow-100 text-yellow-800';
  return 'bg-gray-100 text-gray-800';
}

// Get level icon
export function getLevelIcon(level: number): string {
  if (level >= 10) return '👑';
  if (level >= 8) return '⭐';
  if (level >= 6) return '🌟';
  if (level >= 4) return '✨';
  if (level >= 2) return '��';
  return '✏️';
}

// Force refresh user level (for debugging and manual updates)
export async function refreshUserLevel(userId: string): Promise<number> {
  try {
    const progress = await getUserProgress(userId);
    if (progress) {
      console.log('Refreshed user level:', progress.currentLevel, 'Total points:', progress.totalPoints);
      return progress.currentLevel;
    }
    return 1;
  } catch (error) {
    console.error('Error refreshing user level:', error);
    return 1;
  }
}

// Debug function to check user's current progress
export async function debugUserProgress(userId: string): Promise<void> {
  try {
    const progress = await getUserProgress(userId);
    if (progress) {
      console.log('=== USER PROGRESS DEBUG ===');
      console.log('User ID:', userId);
      console.log('Total Points:', progress.totalPoints);
      console.log('Current Level:', progress.currentLevel);
      console.log('Points in Current Level:', progress.pointsInCurrentLevel);
      console.log('Points to Next Level:', progress.pointsToNextLevel);
      console.log('Stories Completed:', progress.storiesCompleted);
      console.log('Bonus Challenges Completed:', progress.bonusChallengesCompleted);
      console.log('Last Updated:', progress.lastUpdated);
      console.log('==========================');
    } else {
      console.log('No progress data found for user:', userId);
    }
  } catch (error) {
    console.error('Error debugging user progress:', error);
  }
} 