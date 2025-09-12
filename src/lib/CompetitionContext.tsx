'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export interface Competition {
  id: string;
  name: string;
  wordLimit: number;
  description: string;
}

const defaultCompetition: Competition = {
  id: 'micro',
  name: 'Micro Fiction',
  wordLimit: 100,
  description: 'Ultra-short stories'
};

interface CompetitionContextType {
  currentCompetition: Competition;
  setCurrentCompetition: (competition: Competition) => void;
}

const CompetitionContext = createContext<CompetitionContextType | undefined>(undefined);

export function CompetitionProvider({ children }: { children: ReactNode }) {
  const [currentCompetition, setCurrentCompetition] = useState<Competition>(defaultCompetition);

  return (
    <CompetitionContext.Provider value={{ currentCompetition, setCurrentCompetition }}>
      {children}
    </CompetitionContext.Provider>
  );
}

export function useCompetition() {
  const context = useContext(CompetitionContext);
  if (context === undefined) {
    throw new Error('useCompetition must be used within a CompetitionProvider');
  }
  return context;
} 