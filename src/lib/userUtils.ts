// Generate a unique user ID and store it in localStorage
export function getUserId(): string {
  let userId = localStorage.getItem('storyPlatformUserId');
  
  if (!userId) {
    userId = generateUUID();
    localStorage.setItem('storyPlatformUserId', userId);
  }
  
  return userId;
}

// Generate a UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Check if user has already submitted a story today
export function hasSubmittedToday(): boolean {
  const today = new Date().toDateString();
  const lastSubmission = localStorage.getItem('lastDailySubmission');
  return lastSubmission === today;
}

// Mark that user has submitted today
export function markSubmittedToday(): void {
  const today = new Date().toDateString();
  localStorage.setItem('lastDailySubmission', today);
}

// Clear the submission record (for when user deletes their story)
export function clearSubmissionRecord(): void {
  localStorage.removeItem('lastDailySubmission');
}

// Check if a story belongs to the current user
export function isOwnStory(storyUserId: string): boolean {
  const currentUserId = getUserId();
  return storyUserId === currentUserId;
}

// TEMPORARY: Test function to reset user data (remove in production)
export function resetUserData(): void {
  localStorage.removeItem('storyPlatformUserId');
  localStorage.removeItem('lastDailySubmission');
  console.log('User data reset. Refresh the page to get a new user ID.');
}

// TEMPORARY: Test function to show current user info (remove in production)
export function showUserInfo(): void {
  const userId = getUserId();
  const hasSubmitted = hasSubmittedToday();
  console.log('Current User ID:', userId);
  console.log('Has submitted today:', hasSubmitted);
  console.log('To reset user data, call: resetUserData()');
} 