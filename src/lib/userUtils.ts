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


// Clear the submission record (for when user deletes their story)
export function clearSubmissionRecord(): void {
  localStorage.removeItem('lastDailySubmission');
}

// Check if a story belongs to the current user
export function isOwnStory(storyUserId: string): boolean {
  const currentUserId = getUserId();
  return storyUserId === currentUserId;
}
