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

// Your own API endpoints (update these URLs after deployment)
const BODHITAB_API_URL = 'https://your-project-name.vercel.app/api';
const ZENQUOTES_API_URL = 'https://zenquotes.io/api/random';

class QuoteService {
  private cache: Map<string, Quote[]> = new Map();
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

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

  private async fetchFromZenQuotes(): Promise<Quote | null> {
    try {
      console.log('🔄 Fetching from ZenQuotes API...');
      const response = await this.fetchWithTimeout(ZENQUOTES_API_URL);
      
      if (!response.ok) {
        throw new Error(`ZenQuotes API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      const quote = data[0];
      
      if (!quote || !quote.q || !quote.a) {
        throw new Error('Invalid response format from ZenQuotes');
      }
      
      console.log('✅ Successfully fetched from ZenQuotes API');
      
      return {
        id: Date.now(), // Generate temporary ID
        text: quote.q,
        author: quote.a,
        category: 'inspiration'
      };
    } catch (error) {
      console.warn('⚠️ ZenQuotes API failed:', error);
      return null;
    }
  }

  private getRandomLocalQuote(): Quote {
    const randomIndex = Math.floor(Math.random() * localQuotes.length);
    return localQuotes[randomIndex];
  }

  async getRandomQuote(): Promise<Quote> {
    // Try BodhiTab API first (your own API)
    let quote = await this.fetchFromBodhiTabAPI();
    
    if (quote) {
      return quote;
    }
    
    // Fallback to ZenQuotes
    quote = await this.fetchFromZenQuotes();
    
    if (quote) {
      return quote;
    }
    
    // Final fallback to local quotes
    console.log('📚 Using local quote as fallback');
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
