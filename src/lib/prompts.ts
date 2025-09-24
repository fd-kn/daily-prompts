export interface Prompt {
    text: string;
    description?: string;
  }
  
  export const prompts = {
    micro: [
      { 
        text: "Borrowed Time", 
        description: "You wake up to find a note on your pillow: 'You have 24 hours to live.' How do you spend your final day, and who do you trust?"
      },
      { 
        text: "The Dinner Guest", 
        description: "At a family dinner, a guest suddenly reveals a secret about you — one you never thought anyone at the table could know"
      },
      { 
        text: "Yes, My King", 
        description: "You've been hired to steal something from the king before the grand festival begins. To pull it off, you've disguised yourself as one of the palace servants — but with each attempt, the people of the palace start to wonder who you really are."
      },
      { 
        text: "Deliver Who?", 
        description: "As a postman finishing your route, you find a mysterious package with no name or address. The only marking: Do Not Open."
      },
      { 
        text: "Money Man", 
        description: "A stranger shoves a heavy briefcase into your hands before vanishing into the crowd. Inside: stacks of cash. No note, no instructions, just money beyond your dreams."
      },
      { 
        text: "River of Dark Promises", 
        description: "A mysterious river grants wishes to those who dare approach—but every wish comes with a price. What will you risk for yours?"
      },
      { 
        text: "What in the World?", 
        description: "In the middle of a busy market, a swirling portal opens—and something steps through from another world. What is it, and what does it want?"
      },
      { 
        text: "King for a Day", 
        description: "You blackmail the king and are suddenly in charge for 24 hours. How do you wield your power—and can you survive the consequences?"
      },
      { 
        text: "I'm a Hero?", 
        description: "Everyone thinks you’re the city’s greatest hero. You look just like him! Do you reveal the truth... or do you take in the undeserved glory and fame?"
      },
      { 
        text: "In the Eye of the Beholder", 
        description: "In a world where everyone knows magic, you’re the only one who doesn’t. Now you must impress the palace audience at the grand magic show… without revealing your secret."
      }
    ]
  };
  
  // For testing purposes - allows simulating different dates
  let testDate: Date | null = null;
  
  export function setTestDate(date: Date | null) {
    testDate = date;
    console.log('🧪 Test date set to:', date ? date.toDateString() : 'null (using real date)');
  }
  
  export function getDailyPrompt(competitionId: string): Prompt {
    const competitionPrompts = prompts[competitionId as keyof typeof prompts] || prompts.micro;
    
    // Use test date if set, otherwise use current date
    const now = testDate || new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Calculate day of year (0-based)
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    
    console.log('📅 Daily prompt calculation:', {
      date: today.toDateString(),
      dayOfYear,
      totalPrompts: competitionPrompts.length,
      selectedIndex: dayOfYear % competitionPrompts.length,
      isTestMode: testDate !== null
    });
    
    return competitionPrompts[dayOfYear % competitionPrompts.length];
  }
  
  export function getRandomPrompt(competitionId: string): Prompt {
    const competitionPrompts = prompts[competitionId as keyof typeof prompts] || prompts.micro;
    const randomIndex = Math.floor(Math.random() * competitionPrompts.length);
    return competitionPrompts[randomIndex];
  } 