import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

interface DailySubmission {
  userId: string;
  lastSubmissionDate: string; // YYYY-MM-DD format
  hasSubmittedToday: boolean;
  hasPublishedToday: boolean;
  lastPublishDate: string; // YYYY-MM-DD format
}

// Check if user has already submitted today
export async function hasSubmittedToday(userId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'dailySubmissions', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as DailySubmission;
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Check if the last submission was today
      if (data.lastSubmissionDate === today) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking daily submission:', error);
    return false;
  }
}

// Check if user has already published today
export async function hasPublishedToday(userId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'dailySubmissions', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as DailySubmission;
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Check if the last publish was today
      if (data.lastPublishDate === today) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking daily publish:', error);
    return false;
  }
}

// Mark that user has submitted today
export async function markSubmittedToday(userId: string): Promise<void> {
  try {
    const docRef = doc(db, 'dailySubmissions', userId);
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Get existing data to preserve publish status
    const docSnap = await getDoc(docRef);
    const existingData = docSnap.exists() ? docSnap.data() as DailySubmission : null;
    
    await setDoc(docRef, {
      userId,
      lastSubmissionDate: today,
      hasSubmittedToday: true,
      hasPublishedToday: existingData?.hasPublishedToday || false,
      lastPublishDate: existingData?.lastPublishDate || ''
    });
  } catch (error) {
    console.error('Error marking daily submission:', error);
  }
}

// Mark that user has published today
export async function markPublishedToday(userId: string): Promise<void> {
  try {
    const docRef = doc(db, 'dailySubmissions', userId);
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Get existing data to preserve submission status
    const docSnap = await getDoc(docRef);
    const existingData = docSnap.exists() ? docSnap.data() as DailySubmission : null;
    
    await setDoc(docRef, {
      userId,
      lastSubmissionDate: existingData?.lastSubmissionDate || '',
      hasSubmittedToday: existingData?.hasSubmittedToday || false,
      hasPublishedToday: true,
      lastPublishDate: today
    });
  } catch (error) {
    console.error('Error marking daily publish:', error);
  }
}

// Reset daily submission (for testing or admin purposes)
export async function resetDailySubmission(userId: string): Promise<void> {
  try {
    const docRef = doc(db, 'dailySubmissions', userId);
    await setDoc(docRef, {
      userId,
      lastSubmissionDate: '',
      hasSubmittedToday: false
    });
  } catch (error) {
    console.error('Error resetting daily submission:', error);
  }
}

// Get user's last submission date
export async function getLastSubmissionDate(userId: string): Promise<string | null> {
  try {
    const docRef = doc(db, 'dailySubmissions', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as DailySubmission;
      return data.lastSubmissionDate || null;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting last submission date:', error);
    return null;
  }
} 