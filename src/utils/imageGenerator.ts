import { Quote } from '../services';

export async function generateQuoteImage(quote: Quote): Promise<Blob> {
  // Create canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // Set canvas size (1200x630 is optimal for social media)
  canvas.width = 1200;
  canvas.height = 630;
  
  // Get the actual quote container from the DOM
  const quoteContainer = document.querySelector('.quote-container') as HTMLElement;
  
  if (!quoteContainer) {
    // Fallback to default styling if container not found
    return generateDefaultQuoteImage(quote);
  }
  
  try {
    // Create high-quality image matching the UI
    // Note: We can use window.getComputedStyle(quoteContainer) if we need to match exact styling
    
    // Match background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#030303');
    gradient.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add mesh gradient effect
    addMeshGradient(ctx, canvas.width, canvas.height);
    
    // Add elegant shapes similar to UI
    addElegantShapes(ctx, canvas.width, canvas.height);
    
    // Add quote text with proper styling
    const maxWidth = canvas.width * 0.8;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Load Inter font
    await document.fonts.load('bold 60px Inter');
    
    // Quote text with gradient
    const words = quote.text.split(' ');
    let lines = [];
    let currentLine = words[0];
    
    ctx.font = 'bold 60px Inter';
    
    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    
    // Create text gradient
    const textGradient = ctx.createLinearGradient(
      canvas.width / 2 - maxWidth / 2,
      canvas.height / 2 - 50,
      canvas.width / 2 + maxWidth / 2,
      canvas.height / 2 + 50
    );
    textGradient.addColorStop(0, '#ffffff');
    textGradient.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
    ctx.fillStyle = textGradient;
    
    const lineHeight = 72;
    const totalHeight = lines.length * lineHeight;
    const startY = (canvas.height - totalHeight) / 2;
    
    lines.forEach((line, i) => {
      ctx.fillText(line, canvas.width / 2, startY + i * lineHeight);
    });
    
    // Add author with proper styling
    ctx.font = '300 32px Inter';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText(`— ${quote.author}`, canvas.width / 2, startY + totalHeight + 60);
    
    // Add subtle branding
    ctx.font = '300 24px Inter';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillText('BodhiTab', canvas.width / 2, canvas.height - 40);
    
    // Convert to blob with high quality
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob!),
        'image/png',
        1.0 // Maximum quality
      );
    });
  } catch (error) {
    console.error('Error generating styled image:', error);
    return generateDefaultQuoteImage(quote);
  }
}

function addMeshGradient(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const gradients = [
    { x: 0.27, y: 0.37, color: 'hsla(215, 98%, 61%, 0.15)' },
    { x: 0.97, y: 0.21, color: 'hsla(256, 98%, 72%, 0.15)' },
    { x: 0.52, y: 0.99, color: 'hsla(354, 98%, 61%, 0.15)' },
    { x: 0.10, y: 0.29, color: 'hsla(133, 96%, 67%, 0.15)' },
    { x: 0.97, y: 0.96, color: 'hsla(38, 60%, 74%, 0.15)' },
    { x: 0.33, y: 0.50, color: 'hsla(222, 67%, 73%, 0.15)' },
    { x: 0.79, y: 0.53, color: 'hsla(343, 68%, 79%, 0.15)' }
  ];

  gradients.forEach(({ x, y, color }) => {
    const gradient = ctx.createRadialGradient(
      x * width, y * height, 0,
      x * width, y * height, width * 0.5
    );
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  });
}

function addElegantShapes(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const shapes = [
    { w: 600, h: 140, x: -0.1, y: 0.2, rotate: 12, color: 'rgba(79, 70, 229, 0.15)' },
    { w: 500, h: 120, x: 1.1, y: 0.75, rotate: -15, color: 'rgba(244, 63, 94, 0.15)' },
    { w: 300, h: 80, x: 0.1, y: 0.9, rotate: -8, color: 'rgba(139, 92, 246, 0.15)' },
    { w: 200, h: 60, x: 0.8, y: 0.15, rotate: 20, color: 'rgba(245, 158, 11, 0.15)' }
  ];

  shapes.forEach(({ w, h, x, y, rotate, color }) => {
    ctx.save();
    ctx.translate(x * width, y * height);
    ctx.rotate((rotate * Math.PI) / 180);
    
    const gradient = ctx.createLinearGradient(0, 0, w, 0);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, w/2, h/2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  });
}

function generateDefaultQuoteImage(quote: Quote): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  canvas.width = 1200;
  canvas.height = 630;
  
  // Simple dark background
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add quote text
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 48px system-ui';
  ctx.fillStyle = '#ffffff';
  
  const maxWidth = canvas.width * 0.8;
  const words = quote.text.split(' ');
  let lines = [];
  let currentLine = words[0];
  
  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  
  const lineHeight = 60;
  const totalHeight = lines.length * lineHeight;
  const startY = (canvas.height - totalHeight) / 2;
  
  lines.forEach((line, i) => {
    ctx.fillText(line, canvas.width / 2, startY + i * lineHeight);
  });
  
  // Add author
  ctx.font = '300 32px system-ui';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillText(`— ${quote.author}`, canvas.width / 2, startY + totalHeight + 60);
  
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png', 1.0);
  });
}