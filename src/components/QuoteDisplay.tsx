import React from 'react';

interface Quote {
  text: string;
  author: string;
}

interface QuoteDisplayProps {
  quote: Quote;
}

const QuoteDisplay: React.FC<QuoteDisplayProps> = ({ quote }) => {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <blockquote className="text-3xl md:text-4xl font-light leading-relaxed mb-4">
        "{quote.text}"
      </blockquote>
      <cite className="text-xl opacity-75 block">— {quote.author}</cite>
    </div>
  );
};

export default QuoteDisplay;