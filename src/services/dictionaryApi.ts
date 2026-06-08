import axios from 'axios';

const API_BASE_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';

export interface Phonetic {
  text?: string;
  audio?: string;
}

export interface Definition {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

export interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms?: string[];
  antonyms?: string[];
}

export interface WordData {
  word: string;
  phonetic?: string;
  phonetics: Phonetic[];
  meanings: Meaning[];
  origin?: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

export const dictionaryApi = {
  async searchWord(word: string): Promise<WordData[]> {
    try {
      const trimmedWord = word.trim().toLowerCase();
      
      if (!trimmedWord) {
        throw new Error('Please enter a word to search');
      }

      const response = await axios.get<WordData[]>(`${API_BASE_URL}/${trimmedWord}`);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Word not found in the dictionary');
        }
        if (error.code === 'ERR_NETWORK') {
          throw new Error('Network error. Please check your internet connection');
        }
        throw new Error(error.response?.data?.message || 'Failed to fetch word data');
      }
      throw new Error('An unexpected error occurred');
    }
  },
};
