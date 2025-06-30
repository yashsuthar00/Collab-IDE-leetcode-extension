// Constants
const API_BASE_URL = 'http://localhost:5000'; // Development URL
// const API_BASE_URL = 'https://collab-ide-ep5q.onrender.com'; // Production URL

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('LeetCode to Collab IDE extension installed');
  
  // Initialize extension state
  chrome.storage.local.set({
    isEnabled: true,
    token: null,
    user: null,
    lastSynced: null
  });
});

// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);
  
  if (message.type === 'CHECK_AUTH') {
    // Check if user is authenticated
    chrome.storage.local.get(['token', 'user'], (result) => {
      sendResponse({
        isAuthenticated: !!result.token,
        user: result.user
      });
    });
    return true; // Required for async sendResponse
  }
  
  else if (message.type === 'LOGIN') {
    // Store authentication details
    chrome.storage.local.set({
      token: message.token,
      user: message.user
    }, () => {
      sendResponse({ success: true });
    });
    return true; // Required for async sendResponse
  }
  
  else if (message.type === 'LOGOUT') {
    // Clear authentication details
    chrome.storage.local.set({
      token: null,
      user: null
    }, () => {
      sendResponse({ success: true });
    });
    return true; // Required for async sendResponse
  }
  
  else if (message.type === 'TOGGLE_EXTENSION') {
    chrome.storage.local.get(['isEnabled'], (result) => {
      const newState = !result.isEnabled;
      chrome.storage.local.set({ isEnabled: newState }, () => {
        // Notify all active tabs of the state change
        chrome.tabs.query({ url: 'https://leetcode.com/problems/*' }, (tabs) => {
          tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, {
              type: 'EXTENSION_STATE_CHANGED',
              isEnabled: newState
            });
          });
        });
        
        sendResponse({ isEnabled: newState });
      });
    });
    return true; // Required for async sendResponse
  }
  
  else if (message.type === 'SAVE_SOLUTION') {
    chrome.storage.local.get(['token'], async (result) => {
      if (!result.token) {
        sendResponse({ 
          success: false, 
          error: 'Not authenticated. Please log in first.' 
        });
        return;
      }
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/leetcode/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${result.token}`
          },
          body: JSON.stringify(message.solution)
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // Update last synced time
          chrome.storage.local.set({
            lastSynced: new Date().toISOString()
          });
          
          sendResponse({ 
            success: true, 
            data: data 
          });
        } else {
          sendResponse({ 
            success: false, 
            error: data.message || 'Failed to save solution' 
          });
        }
      } catch (error) {
        console.error('Error saving solution:', error);
        sendResponse({ 
          success: false, 
          error: error.message || 'Network error while saving solution' 
        });
      }
    });
    return true; // Required for async sendResponse
  }
});
