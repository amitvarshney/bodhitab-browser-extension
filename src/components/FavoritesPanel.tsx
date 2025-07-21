import React from 'react';
import { X } from 'lucide-react';
import type { Quote } from '../services';

interface FavoritesPanelProps {
  favorites: Quote[];
  isOpen: boolean;
  onClose: () => void;
  onRemove: (quote: Quote) => void;
}

const FavoritesPanel: React.FC<FavoritesPanelProps> = ({
  favorites,
  isOpen,
  onClose,
  onRemove,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[80vh] overflow-auto m-4 p-6 rounded-xl bg-[#0a0a0a] border border-white/[0.08] shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/[0.08] transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-white/70" />
        </button>

        <h2 className="text-2xl font-medium text-white/90 mb-6">Favorite Quotes</h2>

        {favorites.length === 0 ? (
          <p className="text-center text-white/40 py-8">
            No favorite quotes yet. Click the heart icon to save quotes you love!
          </p>
        ) : (
          <div className="space-y-4">
            {favorites.map((quote, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.08] relative group"
              >
                <button
                  onClick={() => onRemove(quote)}
                  className="absolute top-2 right-2 p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/[0.08] transition-all"
                  aria-label="Remove favorite"
                >
                  <X className="w-4 h-4 text-white/70" />
                </button>
                <blockquote className="text-lg text-white/90 mb-2">
                  "{quote.text}"
                </blockquote>
                <cite className="text-sm text-white/40 block">
                  — {quote.author}
                </cite>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPanel;