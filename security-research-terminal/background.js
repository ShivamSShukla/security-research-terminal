/**
 * Background Service Worker
 * 
 * Manages extension badge state to provide clear visibility when
 * the security research panel is active.
 * 
 * ETHICAL DESIGN: Clear status indicators prevent hidden or silent execution.
 */

// Track active state per tab
const tabStates = new Map();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabId = sender.tab?.id || chrome.devtools?.inspectedWindow?.tabId;
  
  switch(message.type) {
    case 'PANEL_OPENED':
      // Panel is open - set badge to indicate tool is accessible
      chrome.action.setBadgeText({ text: 'ON' });
      chrome.action.setBadgeBackgroundColor({ color: '#00ff00' });
      if (tabId) {
        tabStates.set(tabId, { panelOpen: true });
      }
      break;
      
    case 'PANEL_CLOSED':
      // Panel closed - clear badge
      chrome.action.setBadgeText({ text: '' });
      if (tabId) {
        tabStates.delete(tabId);
      }
      break;
      
    case 'EXECUTION_START':
      // Active execution - show RUN badge
      chrome.action.setBadgeText({ text: 'RUN', tabId });
      chrome.action.setBadgeBackgroundColor({ color: '#ff0000', tabId });
      break;
      
    case 'EXECUTION_END':
      // Execution complete - return to ON state
      chrome.action.setBadgeText({ text: 'ON', tabId });
      chrome.action.setBadgeBackgroundColor({ color: '#00ff00', tabId });
      break;
  }
});

// Clear badge when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  tabStates.delete(tabId);
});

// Initialize badge as empty on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({ text: '' });
});
