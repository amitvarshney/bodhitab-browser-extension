// Background script for BodhiTab Chrome Extension
console.log('BodhiTab background script initialized');

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('BodhiTab extension installed');
});

// No additional functionality needed for now as this is primarily a new tab replacement
