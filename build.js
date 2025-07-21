const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const sourceDir = __dirname;
const buildDir = path.join(__dirname, 'dist');
const manifestPath = path.join(sourceDir, 'manifest.json');

// Create build directory if it doesn't exist
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Copy manifest.json to build directory
console.log('Copying manifest.json...');
fs.copyFileSync(manifestPath, path.join(buildDir, 'manifest.json'));

// Create icons directory in build directory
const iconsBuildDir = path.join(buildDir, 'icons');
if (!fs.existsSync(iconsBuildDir)) {
  fs.mkdirSync(iconsBuildDir, { recursive: true });
}

// Copy placeholder icons or create them
console.log('Creating placeholder icons...');
const iconSizes = [16, 48, 128];
const iconPlaceholderPath = path.join(sourceDir, 'icons', 'placeholder.txt');

if (fs.existsSync(iconPlaceholderPath)) {
  // Create simple placeholder icons
  iconSizes.forEach(size => {
    try {
      // Use a simple command to create placeholder icons
      // In a real environment, you'd want to use proper icons
      execSync(`convert -size ${size}x${size} xc:navy -fill white -gravity center -pointsize ${size/4} -annotate 0 "BT" ${path.join(iconsBuildDir, `icon${size}.png`)}`);
      console.log(`Created placeholder icon${size}.png`);
    } catch (error) {
      console.warn(`Could not create icon${size}.png: ${error.message}`);
      console.log('Creating an empty file as placeholder...');
      fs.writeFileSync(path.join(iconsBuildDir, `icon${size}.png`), '');
    }
  });
}

// Run the build command for the React app
console.log('Building React application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('React build completed successfully.');
} catch (error) {
  console.error('Error building React application:', error.message);
  console.log('Continuing with extension packaging...');
}

// Create a zip file for the extension
console.log('Creating extension package...');
try {
  const zipFileName = 'bodhitab-extension.zip';
  const zipFilePath = path.join(__dirname, zipFileName);
  
  // Remove existing zip if it exists
  if (fs.existsSync(zipFilePath)) {
    fs.unlinkSync(zipFilePath);
  }
  
  execSync(`cd ${buildDir} && zip -r ../${zipFileName} ./*`);
  console.log(`Extension packaged successfully: ${zipFileName}`);
} catch (error) {
  console.error('Error creating extension package:', error.message);
}

console.log('Build process completed.');
