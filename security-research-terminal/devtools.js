/**
 * DevTools Panel Registration
 * 
 * This script runs when DevTools is opened and registers our custom panel.
 * The panel is where all security research capabilities will be accessed.
 * 
 * SECURITY NOTE: By using DevTools panels, we ensure the tool is only
 * accessible to developers who explicitly open DevTools, not to end users.
 */

// Register the Security Research Terminal panel
chrome.devtools.panels.create(
  "Security Research",  // Panel title
  "icons/icon-32.png",  // Icon path
  "panel.html",         // Panel HTML page
  function(panel) {
    console.log("Security Research Terminal panel created");
    
    // Track panel visibility for badge management
    panel.onShown.addListener(function(window) {
      // Notify background script that panel is active
      chrome.runtime.sendMessage({ type: 'PANEL_OPENED' });
    });
    
    panel.onHidden.addListener(function() {
      // Notify background script that panel is closed
      chrome.runtime.sendMessage({ type: 'PANEL_CLOSED' });
    });
  }
);
