// LinkSmith Background Service Worker
// Minimal service worker for Chrome extension

// Initialize default state on install
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    const defaultState = {
      format: 'md',
      captureDestination: 'total',
      viewMode: 'total',
      selectedFolderId: null,
      searchQuery: '',
      totalHistory: [],
      folders: {},
      folderOrder: [],
      pinnedIds: [],
      titleOverrides: {}
    };

    chrome.storage.local.set({ linksmith_state_v1: defaultState }, () => {
      console.log('LinkSmith: Default state initialized');
    });
  }
});

// Listen for any messages from popup (extensibility point)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getState') {
    chrome.storage.local.get('linksmith_state_v1', (result) => {
      sendResponse(result.linksmith_state_v1 || null);
    });
    return true; // Keep channel open for async response
  }
});
