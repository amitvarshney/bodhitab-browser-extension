// Import quotes from data file
import { quotes } from '../data/quotes';

export interface Quote {
  text: string;
  author: string;
  savedAt?: number; // Timestamp for when the quote was saved as favorite
}

// Constants
const FAVORITES_KEY = 'bodhitab_favorites';

/**
 * Get a random quote from the quotes database
 */
export function getRandomQuote(): Quote {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
}

/**
 * Check if we're in the Chrome extension environment
 */
export function isExtensionEnvironment(): boolean {
  return typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
}

// Storage implementation for development environment
const devStorage = {
  async get(): Promise<Quote[]> {
    try {
      const favoritesJson = localStorage.getItem(FAVORITES_KEY);
      if (favoritesJson) {
        return JSON.parse(favoritesJson);
      }
      return [];
    } catch (error) {
      console.error('Error getting favorites from localStorage:', error);
      return [];
    }
  },

  async set(quotes: Quote[]): Promise<void> {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(quotes));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  },

  async clear(): Promise<void> {
    try {
      localStorage.removeItem(FAVORITES_KEY);
    } catch (error) {
      console.error('Error clearing favorites from localStorage:', error);
    }
  }
};

// Storage implementation for Chrome extension
const chromeStorage = {
  async get(): Promise<Quote[]> {
    try {
      const result = await chrome.storage.local.get(FAVORITES_KEY);
      return result[FAVORITES_KEY] || [];
    } catch (error) {
      console.error('Error getting favorites from chrome.storage:', error);
      return [];
    }
  },

  async set(quotes: Quote[]): Promise<void> {
    try {
      await chrome.storage.local.set({ [FAVORITES_KEY]: quotes });
    } catch (error) {
      console.error('Error saving favorites to chrome.storage:', error);
    }
  },

  async clear(): Promise<void> {
    try {
      await chrome.storage.local.remove(FAVORITES_KEY);
    } catch (error) {
      console.error('Error clearing favorites from chrome.storage:', error);
    }
  }
};

// Use appropriate storage based on environment
const storage = isExtensionEnvironment() ? chromeStorage : devStorage;

/**
 * Get all favorite quotes
 */
export async function getFavorites(): Promise<Quote[]> {
  return storage.get();
}

/**
 * Save a quote to favorites
 */
export async function saveFavorite(quote: Quote): Promise<void> {
  try {
    const favorites = await getFavorites();
    
    // Check if quote already exists to avoid duplicates
    const quoteExists = favorites.some(
      fav => fav.text === quote.text && fav.author === quote.author
    );
    
    if (!quoteExists) {
      // Add new quote with timestamp
      const updatedFavorites = [...favorites, {
        ...quote,
        savedAt: Date.now()
      }];
      
      await storage.set(updatedFavorites);
    }
  } catch (error) {
    console.error('Error saving favorite:', error);
    throw error;
  }
}

/**
 * Remove a quote from favorites
 */
export async function removeFavorite(quote: Quote): Promise<void> {
  try {
    const favorites = await getFavorites();
    const updatedFavorites = favorites.filter(
      fav => !(fav.text === quote.text && fav.author === quote.author)
    );
    
    await storage.set(updatedFavorites);
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
}

/**
 * Check if a quote is in favorites
 */
export async function isQuoteFavorite(quote: Quote): Promise<boolean> {
  try {
    const favorites = await getFavorites();
    return favorites.some(
      fav => fav.text === quote.text && fav.author === quote.author
    );
  } catch (error) {
    console.error('Error checking if quote is favorite:', error);
    return false;
  }
}

/**
 * Clear all favorites
 */
export async function clearFavorites(): Promise<void> {
  return storage.clear();
}
