import { quotes as localQuotes } from '../data/quotes';

export interface Quote {
  id: number;
  text: string;
  author: string;
  category?: string;
}

export interface QuoteResponse {
  id: number;
  text: string;
  author: string;
  category: string;
}

// BodhiTab Quotes API endpoint
const BODHITAB_API_URL = 'https://bodhitab-quotes-api.vercel.app/api';

class QuoteService {
  private cache: Map<string, Quote[]> = new Map();
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private seenLocalQuotes: Set<string> = new Set();
  private readonly SEEN_QUOTES_KEY = 'bodhitab_seen_quotes';

  constructor() {
    this.loadSeenQuotes();
  }

  private async loadSeenQuotes(): Promise<void> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(this.SEEN_QUOTES_KEY);
        if (result[this.SEEN_QUOTES_KEY]) {
          this.seenLocalQuotes = new Set(result[this.SEEN_QUOTES_KEY]);
        }
      }
    } catch (error) {
      console.warn('Failed to load seen quotes:', error);
    }
  }

  private async saveSeenQuotes(): Promise<void> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({
          [this.SEEN_QUOTES_KEY]: Array.from(this.seenLocalQuotes)
        });
      }
    } catch (error) {
      console.warn('Failed to save seen quotes:', error);
    }
  }

  private isOnline(): boolean {
    return navigator.onLine;
  }

  private async fetchWithTimeout(url: string, timeout: number = 5000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async fetchFromBodhiTabAPI(): Promise<Quote | null> {
    try {
      console.log('🔄 Fetching from BodhiTab API...');
      const response = await this.fetchWithTimeout(`${BODHITAB_API_URL}/quotes/random`);
      
      if (!response.ok) {
        throw new Error(`BodhiTab API responded with status: ${response.status}`);
      }
      
      const quote: QuoteResponse = await response.json();
      console.log('✅ Successfully fetched from BodhiTab API');
      
      return {
        id: quote.id,
        text: quote.text,
        author: quote.author,
        category: quote.category
      };
    } catch (error) {
      console.warn('⚠️ BodhiTab API failed:', error);
      return null;
    }
  }


  private getRandomLocalQuote(): Quote {
    // Get quotes that haven't been seen yet
    const unseenQuotes = localQuotes.filter(quote => {
      const quoteKey = `${quote.text}|${quote.author}`;
      return !this.seenLocalQuotes.has(quoteKey);
    });

    // If all quotes have been seen, reset and start over
    if (unseenQuotes.length === 0) {
      console.log('📚 All local quotes have been shown, resetting...');
      this.seenLocalQuotes.clear();
      this.saveSeenQuotes();
      return localQuotes[Math.floor(Math.random() * localQuotes.length)];
    }

    // Pick a random unseen quote
    const randomIndex = Math.floor(Math.random() * unseenQuotes.length);
    const selectedQuote = unseenQuotes[randomIndex];
    
    // Mark as seen
    const quoteKey = `${selectedQuote.text}|${selectedQuote.author}`;
    this.seenLocalQuotes.add(quoteKey);
    this.saveSeenQuotes();
    
    return selectedQuote;
  }

  async getRandomQuote(): Promise<Quote> {
    // Check if online - if offline, use local quotes immediately
    if (!this.isOnline()) {
      console.log('📴 Offline detected, using local quote');
      return this.getRandomLocalQuote();
    }

    // Always try BodhiTab API first when online
    console.log('🌐 Online - attempting to fetch from BodhiTab API...');
    
    const quote = await this.fetchFromBodhiTabAPI();
    
    if (quote) {
      console.log('✅ Successfully fetched from BodhiTab API');
      return quote;
    }
    
    // If API fails, check if we're still online
    // If offline, use local quotes
    if (!this.isOnline()) {
      console.log('📴 Offline confirmed after API failure, using local quote');
      return this.getRandomLocalQuote();
    }
    
    // If API failed but we're still online, try one more time with a shorter timeout
    console.log('⚠️ BodhiTab API failed but online, retrying...');
    const retryQuote = await this.fetchFromBodhiTabAPI();
    
    if (retryQuote) {
      console.log('✅ Successfully fetched from BodhiTab API on retry');
      return retryQuote;
    }
    
    // Final fallback to local quotes if API is unavailable
    console.log('📚 BodhiTab API unavailable, using local quote as fallback');
    return this.getRandomLocalQuote();
  }

  async getQuotesByCategory(category: string): Promise<Quote[]> {
    const cacheKey = `category_${category}`;
    const now = Date.now();
    
    // Check cache first
    if (this.cache.has(cacheKey) && (now - this.lastFetchTime) < this.CACHE_DURATION) {
      return this.cache.get(cacheKey) || [];
    }
    
    try {
      console.log(`🔄 Fetching quotes for category: ${category}`);
      const response = await this.fetchWithTimeout(`${BODHITAB_API_URL}/quotes/category/${category}`);
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      const quotes = data.quotes || [];
      
      // Cache the results
      this.cache.set(cacheKey, quotes);
      this.lastFetchTime = now;
      
      console.log(`✅ Successfully fetched ${quotes.length} quotes for category: ${category}`);
      return quotes;
    } catch (error) {
      console.warn(`⚠️ Failed to fetch quotes for category ${category}:`, error);
      
      // Fallback to local quotes filtered by category
      const filteredQuotes = localQuotes.filter(quote => 
        quote.category?.toLowerCase() === category.toLowerCase()
      );
      
      return filteredQuotes.length > 0 ? filteredQuotes : localQuotes.slice(0, 5);
    }
  }

  async getCategories(): Promise<string[]> {
    try {
      console.log('🔄 Fetching categories from BodhiTab API...');
      const response = await this.fetchWithTimeout(`${BODHITAB_API_URL}/categories`);
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Successfully fetched categories');
      return data.categories || [];
    } catch (error) {
      console.warn('⚠️ Failed to fetch categories, using local categories:', error);
      
      // Return unique categories from local quotes
      const categories = [...new Set(localQuotes.map(quote => quote.category).filter((category): category is string => Boolean(category)))];
      return categories;
    }
  }

  async getAPIStats(): Promise<{ totalQuotes: number; totalCategories: number } | null> {
    try {
      const response = await this.fetchWithTimeout(`${BODHITAB_API_URL}/stats`);
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        totalQuotes: data.totalQuotes,
        totalCategories: data.totalCategories
      };
    } catch (error) {
      console.warn('⚠️ Failed to fetch API stats:', error);
      return null;
    }
  }

  // Health check for the API
  async checkAPIHealth(): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout(`${BODHITAB_API_URL}/health`, 3000);
      return response.ok;
    } catch (error) {
      console.warn('⚠️ API health check failed:', error);
      return false;
    }
  }
}

export const quoteService = new QuoteService();
export default quoteService;
