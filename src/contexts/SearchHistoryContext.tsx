import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { searchHistory, HistoryItem } from '../utils/searchHistory';

interface SearchHistoryContextType {
  history: HistoryItem[];
  isLoading: boolean;
  addToHistory: (word: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  removeFromHistory: (word: string) => Promise<void>;
  refreshHistory: () => Promise<void>;
}

const SearchHistoryContext = createContext<SearchHistoryContextType | undefined>(undefined);

export function SearchHistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const historyData = await searchHistory.getHistory();
      setHistory(historyData);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const addToHistory = async (word: string) => {
    await searchHistory.addToHistory(word);
    await loadHistory();
  };

  const clearHistory = async () => {
    await searchHistory.clearHistory();
    await loadHistory();
  };

  const removeFromHistory = async (word: string) => {
    await searchHistory.removeFromHistory(word);
    await loadHistory();
  };

  const refreshHistory = async () => {
    await loadHistory();
  };

  return (
    <SearchHistoryContext.Provider
      value={{
        history,
        isLoading,
        addToHistory,
        clearHistory,
        removeFromHistory,
        refreshHistory,
      }}
    >
      {children}
    </SearchHistoryContext.Provider>
  );
}

export function useSearchHistory() {
  const context = useContext(SearchHistoryContext);
  if (context === undefined) {
    throw new Error('useSearchHistory must be used within a SearchHistoryProvider');
  }
  return context;
}
