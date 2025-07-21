import DOMPurify from 'dompurify';
import { Quote } from './quoteService';

// API endpoint for fetching quotes
const QUOTE_API_ENDPOINT = 'https://api.quotable.io/random';

/**
 * Service for fetching quotes from external API
 */
export class ApiQuoteService {
    /**
     * Fetch a quote from the API
     */
    async fetchQuote(): Promise<Quote> {
        try {
            const response = await fetch(QUOTE_API_ENDPOINT);
            if (!response.ok) {
                throw new Error('Quote fetch failed');
            }
            const data = await response.json();
            return this.sanitizeQuote(data);
        } catch (error) {
            console.error('Quote fetch error:', error);
            return this.getFallbackQuote();
        }
    }

    /**
     * Sanitize quote data to prevent XSS
     */
    private sanitizeQuote(quoteData: any): Quote {
        return {
            text: DOMPurify.sanitize(quoteData.content || quoteData.text || ''),
            author: DOMPurify.sanitize(quoteData.author || 'Unknown')
        };
    }

    /**
     * Get a fallback quote if API fails
     */
    private getFallbackQuote(): Quote {
        return {
            text: "The journey of a thousand miles begins with one step.",
            author: "Lao Tzu"
        };
    }
}

// Export a singleton instance
export const apiQuoteService = new ApiQuoteService();
