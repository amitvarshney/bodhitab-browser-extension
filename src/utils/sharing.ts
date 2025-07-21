import { Quote } from '../services';
import { generateQuoteImage } from './imageGenerator';

// Social media meta data
const EXTENSION_NAME = 'BodhiTab';
const EXTENSION_URL = 'https://chrome.google.com/webstore/detail/bodhitab/[your-extension-id]';

interface ShareOptions {
  quote: Quote;
  platform: 'twitter' | 'download';
}

async function uploadImageToImgur(blob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('image', blob);

  try {
    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        'Authorization': 'Client-ID YOUR_IMGUR_CLIENT_ID'
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error('Failed to upload image to Imgur');
    }

    return data.data.link;
  } catch (error: unknown) {
    console.error('Error uploading to Imgur:', error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}

export async function shareQuote({ quote, platform }: ShareOptions): Promise<void> {
  try {
    // Generate the quote image
    const imageBlob = await generateQuoteImage(quote);
    
    // Create sharing text with proper formatting
    const shareText = `"${quote.text}"\n\n— ${quote.author}\n\nGet your daily dose of inspiration with ${EXTENSION_NAME}`;
    
    switch (platform) {
      case 'download':
        const downloadUrl = URL.createObjectURL(imageBlob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `quote-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
        break;

      case 'twitter':
        try {
          const imageUrl = await uploadImageToImgur(imageBlob);
          
          const twitterText = `${quote.text}\n\n— ${quote.author}\n\nGet inspired daily with ${EXTENSION_NAME}`;
          const twitterUrl = new URL('https://twitter.com/intent/tweet');
          twitterUrl.searchParams.append('text', twitterText);
          twitterUrl.searchParams.append('url', imageUrl);
          twitterUrl.searchParams.append('hashtags', 'DailyInspiration,Motivation,BodhiTab');
          
          openShareWindow(twitterUrl.toString(), 'Twitter');
        } catch (error) {
          console.error('Twitter sharing error:', error);
          // Fallback to text-only
          const fallbackUrl = new URL('https://twitter.com/intent/tweet');
          fallbackUrl.searchParams.append('text', `${shareText}\n${EXTENSION_URL}`);
          openShareWindow(fallbackUrl.toString(), 'Twitter');
        }
        break;
    }
  } catch (error: unknown) {
    console.error('Sharing error:', error);
    throw new Error(`Failed to share quote: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function openShareWindow(url: string, title: string): void {
  const width = 600;
  const height = 600;
  const left = (window.screen.width / 2) - (width / 2);
  const top = (window.screen.height / 2) - (height / 2);
  
  const features = [
    `width=${width}`,
    `height=${height}`,
    `left=${left}`,
    `top=${top}`,
    'toolbar=no',
    'location=no',
    'status=no',
    'menubar=no',
    'scrollbars=yes',
    'resizable=yes'
  ].join(',');
  
  window.open(url, `Share on ${title}`, features);
}