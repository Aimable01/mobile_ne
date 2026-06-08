import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = '@dictionary_search_history';
const MAX_HISTORY_SIZE = 50;

export interface HistoryItem {
  word: string;
  timestamp: number;
}

export const searchHistory = {
  async getHistory(): Promise<HistoryItem[]> {
    try {
      const historyJson = await AsyncStorage.getItem(HISTORY_KEY);
      if (!historyJson) return [];
      const history = JSON.parse(historyJson) as HistoryItem[];
      return history.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error fetching search history:', error);
      return [];
    }
  },

  async addToHistory(word: string): Promise<void> {
    try {
      const trimmedWord = word.trim().toLowerCase();
      if (!trimmedWord) return;

      const history = await this.getHistory();
      
      // Remove duplicate if exists
      const filteredHistory = history.filter(item => item.word !== trimmedWord);
      
      // Add new item at the beginning
      const newHistory: HistoryItem[] = [
        { word: trimmedWord, timestamp: Date.now() },
        ...filteredHistory,
      ];

      // Keep only the most recent items
      const trimmedHistory = newHistory.slice(0, MAX_HISTORY_SIZE);

      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory));
    } catch (error) {
      console.error('Error adding to search history:', error);
    }
  },

  async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  },

  async removeFromHistory(word: string): Promise<void> {
    try {
      const trimmedWord = word.trim().toLowerCase();
      const history = await this.getHistory();
      const filteredHistory = history.filter(item => item.word !== trimmedWord);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(filteredHistory));
    } catch (error) {
      console.error('Error removing from search history:', error);
    }
  },
};
