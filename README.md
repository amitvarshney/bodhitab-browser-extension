# BodhiTab - Motivational New Tab Extension

A Chrome extension that transforms your new tab experience into an inspiring and functional dashboard with a beautiful, modern UI.

## Features

- **Motivational Quotes**: Display inspiring quotes on each new tab with a clean, elegant design
- **Utility Widgets**: UTC clock display for global time reference
- **Quote Management**: Save favorite quotes and access them anytime

- **Beautiful UI**: Modern design with animated 3D sphere background using Three.js
- **Social Sharing**: Share quotes on social media or download as images
- **Custom Notifications**: Modern notification system replacing browser alerts

## Technical Implementation

- Built with React and TypeScript
- Styled with Tailwind CSS and Framer Motion for animations
- 3D background with Three.js
- Chrome Extension manifest v3 compliant
- Environment-aware storage (Chrome storage API with localStorage fallback)

- External quotes API integration with local fallback

## Prerequisites

### API Keys

Before building the extension, you need to set up the following API keys:

1. **Imgur API Client ID** (for image sharing):
   - Register an application at [Imgur API](https://api.imgur.com/oauth2/addclient)
   - Replace the placeholder in `src/utils/sharing.ts` with your actual client ID

### Custom Icons

The extension uses placeholder icons that should be replaced with actual icons:

1. Replace the following files in the `icons` directory with your custom icons:
   - `icon16.png` (16x16 pixels)
   - `icon48.png` (48x48 pixels)
   - `icon128.png` (128x128 pixels)

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Build the extension: `npm run build`

## Building and Installing the Extension

1. Configure API keys as mentioned in the Prerequisites section
2. Replace placeholder icons with your custom icons
3. Build the extension: `npm run build`
4. Open Chrome and navigate to `chrome://extensions/`
5. Enable "Developer mode" in the top right
6. Click "Load unpacked" and select the `dist` directory
7. The extension should now be installed and will override your new tab page

## Troubleshooting

- If you encounter TypeScript errors during build, make sure all dependencies are properly installed
- If the weather widget doesn't work, verify that your OpenWeatherMap API key is correct
- For sharing issues, check that your Imgur Client ID is properly configured

## Future Enhancements

- Customizable backgrounds
- User-submitted quotes
- Widget customization options
- Cross-browser support
- Additional weather data and forecasts