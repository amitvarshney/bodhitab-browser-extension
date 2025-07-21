class StorageService {
    // Add storage quota checking
    async checkStorageQuota() {
        try {
            const {quota, usage} = await navigator.storage.estimate();
            if (usage > quota * 0.9) {
                this.cleanupOldData();
            }
        } catch (error) {
            console.error('Storage quota check failed:', error);
        }
    }

    // Add data persistence verification
    async saveFavorite(quote) {
        try {
            await chrome.storage.local.set({
                [`favorite_${Date.now()}`]: quote
            });
            
            // Verify data was saved
            const saved = await this.verifyFavoriteSaved(quote);
            if (!saved) {
                throw new Error('Data verification failed');
            }
        } catch (error) {
            console.error('Save favorite failed:', error);
            throw error;
        }
    }
} 