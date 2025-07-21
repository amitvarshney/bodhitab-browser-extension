import { Quote } from './quoteService';

// Key for storing favorites in Chrome storage
const FAVORITES_KEY = 'bodhitab_favorites';

/**
 * Service for handling storage operations
 */
export class StorageService {
  /**
   * Check storage quota and cleanup if needed
   */
  async checkStorageQuota(): Promise<void> {
    try {
      const { quota, usage } = await navigator.storage.estimate();
      if (quota && usage && usage > quota * 0.9) {
        await this.cleanupOldData();
      }
    } catch (error) {
      console.error('Storage quota check failed:', error);
    }
  }

  /**
   * Save a quote to favorites
   */
  async saveFavorite(quote: Quote): Promise<void> {
    try {
      // Get existing favorites
      const favorites = await this.getFavorites();
      
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
        
        // Save to Chrome storage
        await chrome.storage.local.set({
          [FAVORITES_KEY]: updatedFavorites
        });
        
        // Verify data was saved
        const saved = await this.verifyFavoriteSaved(quote);
        if (!saved) {
          throw new Error('Data verification failed');
        }
      }
    } catch (error) {
      console.error('Save favorite failed:', error);
      throw error;
    }
  }

  /**
   * Get all favorite quotes
   */
  async getFavorites(): Promise<Quote[]> {
    try {
      const result = await chrome.storage.local.get(FAVORITES_KEY);
      return result[FAVORITES_KEY] || [];
    } catch (error) {
      console.error('Get favorites failed:', error);
      return [];
    }
  }

  /**
   * Remove a quote from favorites
   */
  async removeFavorite(quote: Quote): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const updatedFavorites = favorites.filter(
        fav => !(fav.text === quote.text && fav.author === quote.author)
      );
      
      await chrome.storage.local.set({
        [FAVORITES_KEY]: updatedFavorites
      });
    } catch (error) {
      console.error('Remove favorite failed:', error);
      throw error;
    }
  }

  /**
   * Check if a quote is in favorites
   */
  async isQuoteFavorite(quote: Quote): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      return favorites.some(
        fav => fav.text === quote.text && fav.author === quote.author
      );
    } catch (error) {
      console.error('Check favorite failed:', error);
      return false;
    }
  }

  /**
   * Verify a quote was saved successfully
   */
  private async verifyFavoriteSaved(quote: Quote): Promise<boolean> {
    const favorites = await this.getFavorites();
    return favorites.some(
      fav => fav.text === quote.text && fav.author === quote.author
    );
  }

  /**
   * Clean up old data if storage is nearly full
   */
  private async cleanupOldData(): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      
      // If we have more than 100 favorites, remove the oldest ones
      if (favorites.length > 100) {
        // Sort by savedAt timestamp (oldest first)
        const sortedFavorites = favorites.sort((a, b) => {
          const timeA = a.savedAt || 0;
          const timeB = b.savedAt || 0;
          return timeA - timeB;
        });
        
        // Keep only the 50 most recent favorites
        const trimmedFavorites = sortedFavorites.slice(-50);
        
        await chrome.storage.local.set({
          [FAVORITES_KEY]: trimmedFavorites
        });
      }
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }
}

// Export a singleton instance
export const storageService = new StorageService();
