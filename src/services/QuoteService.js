// Add error handling for quote fetching
class QuoteService {
    async fetchQuote() {
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

    // Add quote sanitization
    sanitizeQuote(quoteData) {
        return {
            text: DOMPurify.sanitize(quoteData.text),
            author: DOMPurify.sanitize(quoteData.author || 'Unknown')
        };
    }

    // Add fallback mechanism
    getFallbackQuote() {
        return {
            text: "The journey of a thousand miles begins with one step.",
            author: "Lao Tzu"
        };
    }
} 