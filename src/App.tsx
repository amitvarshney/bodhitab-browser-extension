import { useState, useEffect, useRef } from 'react';
import { Clock, Heart, Share2, Copy, Twitter, Download, Circle, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { getRandomQuote, getFavorites, saveFavorite, removeFavorite, isQuoteFavorite } from './services';
import { shareQuote } from './utils/sharing';
import ThreeSphere from './components/ThreeSphere';
import FavoritesPanel from './components/FavoritesPanel';
import { NotificationManager } from './components/Notification';
import type { Quote } from './services';
import type { NotificationType } from './components/Notification';

// ElegantShape component removed as it's not being used

const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
      delay: 0.5 + i * 0.2,
      ease: [0.25, 0.4, 0.25, 1],
    },
  }),
};

function AppContent({ showNotification }: { showNotification: (message: string, type?: NotificationType, duration?: number) => void }) {
  const [quote, setQuote] = useState<Quote>({ text: '', author: '' });
  const [time, setTime] = useState<string>('');
  const [showShareOptions, setShowShareOptions] = useState<boolean>(false);
  const [showFavorites, setShowFavorites] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<Quote[]>([]);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Initialize quote
  useEffect(() => {
    const initializeQuote = async () => {
      const newQuote = await getRandomQuote();
      setQuote(newQuote);
      
      const loadedFavorites = await getFavorites();
      setFavorites(loadedFavorites);
      
      const isCurrentFavorite = await isQuoteFavorite(newQuote);
      setIsFavorite(isCurrentFavorite);
    };

    initializeQuote();
  }, []);

  // Initialize clock
  useEffect(() => {
    updateTime();
    const intervalId = setInterval(updateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const updateTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    setTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await removeFavorite(quote);
        setIsFavorite(false);
        showNotification('Quote removed from favorites', 'success');
      } else {
        await saveFavorite(quote);
        setIsFavorite(true);
        showNotification('Quote added to favorites', 'success');
      }
      // Refresh favorites list
      const updatedFavorites = await getFavorites();
      setFavorites(updatedFavorites);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showNotification(`Error: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
  };

  const copyToClipboard = async () => {
    try {
      const textToCopy = `"${quote.text}" - ${quote.author}`;
      navigator.clipboard.writeText(textToCopy);
      showNotification('Quote copied to clipboard!', 'success');
    } catch (error) {
      console.error('Failed to copy:', error);
      showNotification('Failed to copy to clipboard', 'error');
    }
  };

  const handleShare = async (platform: 'twitter' | 'download') => {
    try {
      await shareQuote({ quote, platform });
      setShowShareOptions(false);
    } catch (error) {
      console.error('Error sharing:', error);
      showNotification(`Error: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
  };

  const handleBuyMeCoffee = () => {
    window.open('https://www.buymeacoffee.com/amitvarshney', '_blank');
  };

  const handleRemoveFavorite = async (quoteToRemove: Quote) => {
    try {
      await removeFavorite(quoteToRemove);
      const updatedFavorites = await getFavorites();
      setFavorites(updatedFavorites);
      
      if (quoteToRemove.text === quote.text && quoteToRemove.author === quote.author) {
        setIsFavorite(false);
      }
      showNotification('Quote removed from favorites', 'success');
    } catch (error) {
      console.error('Error removing favorite:', error);
      showNotification(`Error: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#030303]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />
      
      <ThreeSphere 
        size={9} 
        position={[0, 0, -10]} 
        className="z-0" 
        colors={["#00c2a8", "#7b68ee", "#ff7e5f", "#feb47b"]}
      />
      
      <motion.div 
        className="fixed w-12 h-12 rounded-full pointer-events-none z-50 mix-blend-difference bg-white/20 backdrop-blur-md"
        animate={{
          left: mousePosition.x,
          top: mousePosition.y
        }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 300
        }}
        style={{
          transform: 'translate(-50%, -50%)',
        }}
      />
      
      <div className="absolute top-8 left-8 flex items-center space-x-2 z-20">
        <Clock className="w-6 h-6 text-white/70" />
        <span className="text-3xl font-light text-white/90" data-testid="time-display">{time}</span>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <motion.div 
          className="max-w-3xl mx-auto quote-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <motion.div
            custom={0}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="flex justify-center mb-8 md:mb-12"
          >
            <div 
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08]"
              data-testid="app-badge"
            >
              <Circle className="h-2 w-2 fill-rose-500/80" />
              <span className="text-sm text-white/60 tracking-wide">
                BodhiTab
              </span>
            </div>
          </motion.div>

          <motion.div
            className="relative backdrop-blur-md bg-white/[0.03] border border-white/10 rounded-2xl p-8 md:p-12 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.5,
              ease: [0.25, 0.4, 0.25, 1] 
            }}
          >
            <div className="relative z-10 text-center">
              <motion.div
                custom={1}
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
              >
                <blockquote className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 md:mb-8 tracking-tight" data-testid="quote-text">
                  <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
                    "{quote.text}"
                  </span>
                </blockquote>
              </motion.div>

              <motion.div
                custom={2}
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
              >
                <cite className="text-xl sm:text-2xl text-white/40 block" data-testid="quote-author">
                  — {quote.author}
                </cite>
              </motion.div>
              
              <motion.div
                custom={3}
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-wrap justify-center items-center gap-4 mt-12"
              >
                <motion.button 
                  onClick={toggleFavorite}
                  className="p-3 rounded-full bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Toggle favorite"
                >
                  <Heart className={`w-6 h-6 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white/70'}`} />
                </motion.button>
                
                <motion.button 
                  onClick={() => setShowShareOptions(!showShareOptions)}
                  className="p-3 rounded-full bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Share quote"
                >
                  <Share2 className="w-6 h-6 text-white/70" />
                </motion.button>

                <motion.button 
                  onClick={() => setShowFavorites(true)}
                  className="p-3 rounded-full bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="View favorites"
                >
                  <BookOpen className="w-6 h-6 text-white/70" />
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {showShareOptions && (
        <motion.div 
          className="fixed inset-0 flex items-center justify-center z-30 bg-black/20 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="p-8 rounded-lg bg-[#0a0a0a] border border-white/[0.08] shadow-xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <h2 className="text-2xl font-medium text-white/90 mb-6">Share this quote</h2>
            <div className="flex flex-wrap gap-4 justify-center">
              <motion.button 
                onClick={() => handleShare('twitter')}
                className="p-3 rounded-full bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Share on Twitter"
              >
                <Twitter className="w-6 h-6 text-[#1DA1F2]" />
              </motion.button>
              <motion.button 
                onClick={() => handleShare('download')}
                className="p-3 rounded-full bg-white/[0.03] hover:bg-white/[0.08] transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Download quote"
              >
                <Download className="w-6 h-6 text-white/70" />
              </motion.button>
              <motion.button 
                onClick={copyToClipboard}
                className="p-3 rounded-full bg-white/[0.03] hover:bg-white/[0.08] transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Copy to clipboard"
              >
                <Copy className="w-6 h-6 text-white/70" />
              </motion.button>
            </div>
            <motion.button 
              onClick={() => setShowShareOptions(false)}
              className="mt-6 px-4 py-2 w-full rounded-md bg-white/[0.03] hover:bg-white/[0.08] transition-colors text-white/70"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Close
            </motion.button>
          </motion.div>
        </motion.div>
      )}

      <FavoritesPanel
        favorites={favorites}
        isOpen={showFavorites}
        onClose={() => setShowFavorites(false)}
        onRemove={handleRemoveFavorite}
      />

      <motion.button
        onClick={handleBuyMeCoffee}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF813F] hover:bg-[#ff9661] transition-all shadow-lg hover:shadow-xl text-white font-medium"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.8, 
          delay: 0.5,
          ease: [0.25, 0.4, 0.25, 1] 
        }}
      >
        <img 
          src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg" 
          alt="Buy me a coffee" 
          className="h-6 w-6"
        />
        <span>Buy me a coffee</span>
      </motion.button>

      <div className="absolute bottom-4 left-0 right-0 text-center text-white/40 text-sm">
        BodhiTab
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />
    </div>
  );
}

// Wrap AppContent with NotificationManager
function App() {
  return (
    <NotificationManager>
      {(showNotification) => <AppContent showNotification={showNotification} />}
    </NotificationManager>
  );
}

export default App;