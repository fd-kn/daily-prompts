export interface Prompt {
  text: string;
  category: string;
  description?: string;
}

export const prompts = {
  micro: [
    { 
      text: "Write a story about a mysterious door.", 
      category: "Mystery",
      description: "What lies behind the door? Who put it there? Explore the mystery and consequences of opening it."
    },
    { 
      text: "A letter arrives with no return address.", 
      category: "Suspense",
      description: "The envelope contains a message that changes everything. Who sent it and why?"
    },
    { 
      text: "The last person on Earth receives a phone call.", 
      category: "Sci-Fi",
      description: "After months of silence, the phone rings. Who could be calling and what do they want?"
    },
    { 
      text: "A child finds a key that opens nothing.", 
      category: "Fantasy",
      description: "The key fits no lock, yet it holds great power. What happens when they discover its true purpose?"
    },
    { 
      text: "Write about a moment that changes everything.", 
      category: "Drama",
      description: "A single decision, action, or revelation that alters the course of a life forever."
    },
    { 
      text: "A stranger leaves a note on your windshield.", 
      category: "Thriller",
      description: "The message contains a warning or a threat. What do you do next?"
    },
    { 
      text: "The clock strikes thirteen.", 
      category: "Horror",
      description: "When time itself seems broken, reality begins to unravel. What happens in this extra hour?"
    },
    { 
      text: "Write about an unexpected gift.", 
      category: "Romance",
      description: "A present arrives that brings joy, confusion, or perhaps something more sinister."
    },
    { 
      text: "A photograph that shouldn't exist.", 
      category: "Mystery",
      description: "The image shows something impossible or from a time that never happened. What's the truth?"
    },
    { 
      text: "The sound of footsteps when no one is there.", 
      category: "Horror",
      description: "Alone in the house, you hear someone walking. But you're the only one home."
    }
  ],
  flash: [
    { 
      text: "A detective solves a case using only a single clue.", 
      category: "Mystery",
      description: "One small detail holds the key to everything. How does the detective piece together the puzzle?"
    },
    { 
      text: "Write about a day in the life of a time traveler.", 
      category: "Sci-Fi",
      description: "What does an ordinary day look like when you can move through time? Explore the challenges and wonders."
    },
    { 
      text: "A chef creates a dish that brings back memories.", 
      category: "Drama",
      description: "A single bite transports someone to their past. What memories surface and how do they react?"
    },
    { 
      text: "Two strangers meet on a train platform.", 
      category: "Romance",
      description: "A chance encounter that changes both lives forever. What draws them together?"
    },
    { 
      text: "A child discovers they can talk to animals.", 
      category: "Fantasy",
      description: "The animals have stories to tell and wisdom to share. What do they reveal about the world?"
    },
    { 
      text: "Write about a family secret revealed at dinner.", 
      category: "Drama",
      description: "The truth comes out over a meal. How does this revelation change the family dynamic?"
    },
    { 
      text: "A scientist makes a breakthrough discovery.", 
      category: "Sci-Fi",
      description: "The discovery changes everything we know. What are the consequences and who wants to control it?"
    },
    { 
      text: "A musician plays for the last time.", 
      category: "Drama",
      description: "The final performance holds special meaning. What makes this moment so significant?"
    },
    { 
      text: "Write about a storm that brings more than rain.", 
      category: "Fantasy",
      description: "The storm brings something unexpected—magic, creatures, or a change in reality itself."
    },
    { 
      text: "A letter from the future arrives.", 
      category: "Sci-Fi",
      description: "The message contains a warning or advice. What does the future want to tell the present?"
    }
  ],
  short: [
    { 
      text: "Write about a character who discovers they can see into the past.", 
      category: "Fantasy",
      description: "The ability to witness history firsthand comes with great responsibility. What do they see and how does it change them?"
    },
    { 
      text: "A small town is changed forever by a single event.", 
      category: "Drama",
      description: "One moment transforms the community. How do the residents cope and what new dynamics emerge?"
    },
    { 
      text: "Write about a detective investigating their own crime.", 
      category: "Mystery",
      description: "The detective becomes both hunter and hunted. What secrets do they uncover about themselves?"
    },
    { 
      text: "A family moves into a house with a dark history.", 
      category: "Horror",
      description: "The house holds memories of its previous occupants. What supernatural forces are at work?"
    },
    { 
      text: "Write about a love story that spans decades.", 
      category: "Romance",
      description: "Love endures through time, distance, and life's challenges. What keeps them connected?"
    },
    { 
      text: "A scientist creates something that shouldn't exist.", 
      category: "Sci-Fi",
      description: "The creation defies the laws of nature. What are the ethical implications and consequences?"
    },
    { 
      text: "Write about a journey to find a lost treasure.", 
      category: "Adventure",
      description: "The quest reveals more than just riches. What personal discoveries await along the way?"
    },
    { 
      text: "A character receives a second chance at life.", 
      category: "Drama",
      description: "Given the opportunity to start over, what choices do they make differently?"
    },
    { 
      text: "Write about a world where dreams become reality.", 
      category: "Fantasy",
      description: "The boundary between imagination and reality dissolves. How does society adapt to this new power?"
    },
    { 
      text: "A character must choose between duty and desire.", 
      category: "Drama",
      description: "Personal happiness conflicts with responsibility. What is the cost of each choice?"
    }
  ],
  novella: [
    { 
      text: "Write about a character who discovers they are not who they thought they were.", 
      category: "Drama",
      description: "Identity is called into question when hidden truths emerge. How do they rebuild their sense of self?"
    },
    { 
      text: "A small community faces an otherworldly threat.", 
      category: "Horror",
      description: "The community must band together against forces beyond human understanding. What sacrifices are made?"
    },
    { 
      text: "Write about a love triangle that spans generations.", 
      category: "Romance",
      description: "Love, betrayal, and destiny intertwine across time. How do the choices of ancestors affect the present?"
    },
    { 
      text: "A detective investigates a series of impossible crimes.", 
      category: "Mystery",
      description: "The crimes defy logic and science. What supernatural or technological forces are at work?"
    },
    { 
      text: "Write about a journey to the center of the Earth.", 
      category: "Adventure",
      description: "The expedition reveals wonders and dangers beyond imagination. What ancient secrets lie beneath?"
    },
    { 
      text: "A character discovers they can manipulate reality.", 
      category: "Fantasy",
      description: "The power to reshape the world comes with great temptation. How do they use this ability?"
    },
    { 
      text: "Write about a family dynasty with dark secrets.", 
      category: "Drama",
      description: "Generations of lies and hidden truths threaten to destroy the family legacy. What will be revealed?"
    },
    { 
      text: "A scientist creates a new form of life.", 
      category: "Sci-Fi",
      description: "The creation raises profound questions about life, consciousness, and humanity's role as creator."
    },
    { 
      text: "Write about a war between parallel worlds.", 
      category: "Fantasy",
      description: "Multiple realities collide in a conflict that could destroy all existence. Who will survive?"
    },
    { 
      text: "A character must save the world from destruction.", 
      category: "Adventure",
      description: "An ordinary person becomes the world's only hope. What makes them capable of this impossible task?"
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

export function getPromptByCategory(competitionId: string, category: string): Prompt | null {
  const competitionPrompts = prompts[competitionId as keyof typeof prompts] || prompts.micro;
  const categoryPrompts = competitionPrompts.filter(p => p.category === category);
  return categoryPrompts.length > 0 ? categoryPrompts[0] : null;
}

export function getRandomPrompt(competitionId: string): Prompt {
  const competitionPrompts = prompts[competitionId as keyof typeof prompts] || prompts.micro;
  const randomIndex = Math.floor(Math.random() * competitionPrompts.length);
  return competitionPrompts[randomIndex];
} 