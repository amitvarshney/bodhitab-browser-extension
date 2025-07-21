import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Copy manifest and icons to dist
function copyExtensionFiles() {
  // Copy manifest from root directory
  try {
    fs.copyFileSync(
      path.resolve(__dirname, '../manifest.json'),
      path.resolve(__dirname, '../dist/manifest.json')
    );
    console.log('Manifest copied successfully');
  } catch (error) {
    console.error('Error copying manifest:', error.message);
  }

  // Create icons directory in dist
  const iconsDir = path.resolve(__dirname, '../dist/icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Copy icons from icons directory if they exist
  const icons = ['icon16.png', 'icon48.png', 'icon128.png'];
  icons.forEach(icon => {
    try {
      const sourceIconPath = path.resolve(__dirname, `../icons/${icon}`);
      const destIconPath = path.resolve(__dirname, `../dist/icons/${icon}`);
      
      if (fs.existsSync(sourceIconPath)) {
        fs.copyFileSync(sourceIconPath, destIconPath);
        console.log(`Icon ${icon} copied successfully`);
      } else {
        // Create a placeholder icon file
        fs.writeFileSync(destIconPath, '');
        console.log(`Created empty placeholder for ${icon}`);
      }
    } catch (error) {
      console.error(`Error handling icon ${icon}:`, error.message);
    }
  });

  // Copy background.js if it exists
  try {
    const backgroundSrc = path.resolve(__dirname, '../background.js');
    const backgroundDest = path.resolve(__dirname, '../dist/background.js');
    
    if (fs.existsSync(backgroundSrc)) {
      fs.copyFileSync(backgroundSrc, backgroundDest);
      console.log('Background script copied successfully');
    }
  } catch (error) {
    console.error('Error copying background script:', error.message);
  }
}

copyExtensionFiles();
console.log('Extension preparation completed');