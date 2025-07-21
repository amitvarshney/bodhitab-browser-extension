import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock services
vi.mock('./services/quoteService', () => ({
  getRandomQuote: () => ({ text: 'Test quote', author: 'Test author' }),
  getFavorites: () => Promise.resolve([]),
  saveFavorite: vi.fn().mockResolvedValue(undefined),
  removeFavorite: vi.fn().mockResolvedValue(undefined),
  isQuoteFavorite: () => Promise.resolve(false),
}));

// Mock ThreeSphere component
vi.mock('./components/ThreeSphere', () => ({
  default: () => <div data-testid="three-sphere">ThreeSphere Mock</div>
}));

// Mock sharing utility
vi.mock('./utils/sharing', () => ({
  shareQuote: vi.fn().mockResolvedValue(undefined),
}));

describe('App Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Reset window.open mock
    vi.spyOn(window, 'open').mockImplementation(() => null);
    
    // Reset clipboard mock
    navigator.clipboard.writeText.mockClear();

    // Mock alert
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    // Mock Date.now() to return a fixed timestamp
    vi.spyOn(Date, 'now').mockImplementation(() => 1704110400000); // 2024-01-01T12:00:00Z
  });

  it('renders without crashing', async () => {
    render(<App />);
    await waitFor(() => {
      // Look for the BodhiTab text specifically in the badge
      expect(screen.getByTestId('app-badge')).toHaveTextContent('BodhiTab');
      expect(screen.getByText('Test quote')).toBeInTheDocument();
      expect(screen.getByText('— Test author')).toBeInTheDocument();
    });
  });

  it('displays time in correct format', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('time-display')).toHaveTextContent('12:00:00');
    });
  });

  it('toggles favorite status when heart button is clicked', async () => {
    render(<App />);
    const heartButton = screen.getByRole('button', { name: /toggle favorite/i });
    
    await userEvent.click(heartButton);
    await waitFor(() => {
      expect(heartButton.querySelector('svg')).toHaveClass('fill-rose-500');
    });
    
    await userEvent.click(heartButton);
    await waitFor(() => {
      expect(heartButton.querySelector('svg')).not.toHaveClass('fill-rose-500');
    });
  });

  it('opens and closes share modal', async () => {
    render(<App />);
    const shareButton = screen.getByRole('button', { name: /share quote/i });
    
    await userEvent.click(shareButton);
    await waitFor(() => {
      expect(screen.getByText('Share this quote')).toBeInTheDocument();
    });
    
    const closeButton = screen.getByRole('button', { name: 'Close' });
    await userEvent.click(closeButton);
    await waitFor(() => {
      expect(screen.queryByText('Share this quote')).not.toBeInTheDocument();
    });
  });

  it('opens and closes favorites panel', async () => {
    render(<App />);
    const favoritesButton = screen.getByRole('button', { name: /view favorites/i });
    
    await userEvent.click(favoritesButton);
    await waitFor(() => {
      expect(screen.getByText('Favorite Quotes')).toBeInTheDocument();
    });
    
    const closeButton = screen.getByRole('button', { name: 'Close' });
    await userEvent.click(closeButton);
    await waitFor(() => {
      expect(screen.queryByText('Favorite Quotes')).not.toBeInTheDocument();
    });
  });

  it('copies quote to clipboard', async () => {
    render(<App />);
    const shareButton = screen.getByRole('button', { name: /share quote/i });
    await userEvent.click(shareButton);
    
    const copyButton = screen.getByRole('button', { name: /copy to clipboard/i });
    await userEvent.click(copyButton);
    
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        '"Test quote" - Test author'
      );
      expect(window.alert).toHaveBeenCalledWith('Quote copied to clipboard!');
    });
  });

  it('opens buy me a coffee link in new tab', async () => {
    render(<App />);
    const coffeeButton = screen.getByRole('button', { name: /buy me a coffee/i });
    
    await userEvent.click(coffeeButton);
    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith(
        'https://www.buymeacoffee.com/amitvarshney',
        '_blank'
      );
    });
  });

  it('maintains layout on different screen sizes', async () => {
    const { container } = render(<App />);
    
    // Test mobile layout
    window.innerWidth = 375;
    window.innerHeight = 667;
    fireEvent(window, new Event('resize'));
    await waitFor(() => {
      expect(container.querySelector('.container')).toBeInTheDocument();
    });
    
    // Test tablet layout
    window.innerWidth = 768;
    window.innerHeight = 1024;
    fireEvent(window, new Event('resize'));
    await waitFor(() => {
      expect(container.querySelector('.container')).toBeInTheDocument();
    });
    
    // Test desktop layout
    window.innerWidth = 1920;
    window.innerHeight = 1080;
    fireEvent(window, new Event('resize'));
    await waitFor(() => {
      expect(container.querySelector('.container')).toBeInTheDocument();
    });
  });
});