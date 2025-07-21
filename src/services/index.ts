// Import services
import { quoteService } from './quoteService.ts';
import { storageService } from './storageService.ts';
import type { Quote, QuoteResponse } from './quoteService.ts';

// Re-export all functions and types from quoteService.ts
export type { Quote, QuoteResponse } from './quoteService.ts';
export { quoteService } from './quoteService.ts';
export { storageService } from './storageService.ts';

// Export the functions that the app expects
export const getRandomQuote = () => quoteService.getRandomQuote();
export const getFavorites = () => storageService.getFavorites();
export const saveFavorite = (quote: Quote) => storageService.saveFavorite(quote);
export const removeFavorite = (quote: Quote) => storageService.removeFavorite(quote);
export const isQuoteFavorite = (quote: Quote) => storageService.isQuoteFavorite(quote);
export const clearFavorites = async () => {
  await chrome.storage.local.remove('bodhitab_favorites');
};

// Check if running in extension environment
export const isExtensionEnvironment = () => {
  return typeof chrome !== 'undefined' && chrome.storage;
};

export default quoteService;
