# Architecture & Security Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Security Model](#security-model)
3. [Ethical Design Principles](#ethical-design-principles)
4. [API Usage](#api-usage)
5. [Extension Lifecycle](#extension-lifecycle)

---

## Architecture Overview

### High-Level Design

```
┌─────────────────────────────────────────────────────────────┐
│                     Chrome Browser                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────┐         ┌──────────────────┐           │
│  │  Background   │◄────────┤  DevTools Panel  │           │
│  │  Service      │  Badge  │  (Terminal UI)   │           │
│  │  Worker       │  Updates│                  │           │
│  └───────────────┘         └──────────────────┘           │
│                                      │                     │
│                                      │ chrome.devtools     │
│                                      │ .inspectedWindow    │
│                                      │ .eval               │
│                                      ▼                     │
│                            ┌──────────────────┐            │
│                            │  Inspected Page  │            │
│                            │  (Target Tab)    │            │
│                            └──────────────────┘            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Component Breakdown

#### 1. Manifest (manifest.json)
**Purpose:** Extension configuration and permissions
**Key Decisions:**
- Uses Manifest V3 (latest standard)
- Minimal permissions (activeTab, scripting)
- Declares devtools_page for panel integration
- Host permissions for scraping functionality

#### 2. DevTools Entry (devtools.html + devtools.js)
**Purpose:** Register custom DevTools panel
**Key Decisions:**
- Minimal HTML wrapper
- Panel registration on DevTools open
- Lifecycle event tracking (onShown/onHidden)
- Communication with background worker for badge updates

**Code Flow:**
```javascript
DevTools Opens
    ↓
devtools.html loads
    ↓
devtools.js executes
    ↓
chrome.devtools.panels.create()
    ↓
panel.html loads in new panel
```

#### 3. Background Service Worker (background.js)
**Purpose:** Manage extension badge and cross-component messaging
**Key Decisions:**
- Badge-only functionality (no page injection)
- State management per tab
- Real-time status updates
- Automatic cleanup on tab close

**Badge States:**
- **Empty** - Panel closed, no activity
- **"ON" (Green)** - Panel open, ready
- **"RUN" (Red)** - Operation executing

#### 4. Panel Interface (panel.html + panel.css + panel.js)
**Purpose:** Main user interface and command execution
**Key Decisions:**
- Terminal-style UI for technical users
- Clear visual hierarchy
- Status indicators always visible
- Command history built-in
- No external dependencies (vanilla JS)

---

## Security Model

### Threat Model

**What We Protect Against:**
1. Unauthorized code execution
2. Silent or hidden operations
3. Data exfiltration
4. Persistent malicious changes
5. Cross-origin attacks
6. Credential theft

**How We Protect:**
1. User must explicitly open DevTools
2. Every action requires user command
3. Visual indicators show all activity
4. No persistence across sessions
5. Same-origin policy enforced by Chrome
6. No credential storage or transmission

### Permission Model

```
Extension Permissions:
├── activeTab
│   └── Required for: Current tab access when DevTools open
├── scripting
│   └── Required for: Page evaluation via DevTools API
└── host_permissions
    ├── https://raw.githubusercontent.com/*
    │   └── Required for: GitHub public file fetching
    └── http://*/* & https://*/*
        └── Required for: Web scraping (user-validated URLs only)
```

**Key Security Properties:**

1. **No Content Script Injection**
   - Extension does NOT inject content scripts
   - Uses DevTools API exclusively
   - Cannot run without DevTools open

2. **Explicit Execution Context**
   - All code runs via `chrome.devtools.inspectedWindow.eval()`
   - Same security model as Chrome Console
   - Subject to page's Content Security Policy
   - Cannot access extension APIs from page context

3. **No Background Activity**
   - Background worker only manages badge
   - No page monitoring or event listeners
   - No data collection or storage

4. **Clear Capability Boundaries**
   - JavaScript execution: Limited to inspected page
   - DOM modification: Non-persistent, page-reload clears
   - Scraping: Public resources only, no authentication

### Code Injection Safety

**How We Execute Code:**
```javascript
// Inside panel.js
chrome.devtools.inspectedWindow.eval(
  userCode,
  (result, isException) => {
    // Handle result
  }
);
```

**Why This Is Safe:**
- Same mechanism as Chrome DevTools Console
- Cannot access chrome.* APIs
- Cannot access extension context
- Cannot break out of page sandbox
- Subject to page CSP
- Requires DevTools to be open

**What Cannot Be Done:**
- Access other tabs
- Access chrome:// pages
- Bypass same-origin policy
- Persist across page loads
- Run code in extension context

---

## Ethical Design Principles

### 1. Transparency

**Principle:** Users must always know when the tool is active

**Implementation:**
- Status bar with real-time indicators
- Chrome badge shows ON/RUN/OFF states
- All commands produce visible output
- No silent mode or hidden features

**Code Example:**
```javascript
setStatusIndicator(type, active) {
  // Update visual indicator
  const dot = element.querySelector('.indicator-dot');
  dot.classList.toggle('active', active);
  
  // Update extension badge
  chrome.runtime.sendMessage({
    type: active ? 'EXECUTION_START' : 'EXECUTION_END'
  });
}
```

### 2. Explicit Consent

**Principle:** Every action requires explicit user initiation

**Implementation:**
- No automatic execution
- No background scanning
- No event-driven actions
- User must type or click for every operation

**Code Example:**
```javascript
// Command only executes when user presses Enter
commandInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    this.executeCommand();  // Explicit action
  }
});
```

### 3. Minimal Persistence

**Principle:** No data should persist beyond user intent

**Implementation:**
- DOM changes clear on page reload
- No local storage
- No cookies set
- Command history in memory only
- No session persistence

**Code Example:**
```javascript
// DOM modification example
domSetText(selector, text) {
  // Changes are in-memory only
  // Page reload restores original state
  document.querySelectorAll(selector).forEach(el => {
    el.textContent = text;  // Non-persistent change
  });
}
```

### 4. Scope Limitation

**Principle:** Tool only operates within defined boundaries

**Implementation:**
- Only affects current tab
- Cannot access other tabs
- Cannot access incognito mode (unless explicitly allowed)
- Scraping requires URL validation
- No cross-origin requests (except public APIs)

**Code Example:**
```javascript
// Scraping requires validated URL
async handleScrapeCommand(args) {
  if (!this.validatedUrl) {
    this.appendOutput('ERROR: Validate Target URL first', 'error');
    return;  // Block execution
  }
  // ... proceed with validated URL
}
```

### 5. Reversibility

**Principle:** All actions should be reversible

**Implementation:**
- DOM changes: Reload page
- Command mistakes: Clear terminal
- Bad scrape target: Revalidate URL
- No destructive operations
- No data deletion

**User Documentation:**
```
All DOM modifications can be reversed:
1. Reload the page (F5 or Ctrl+R)
2. Changes are non-persistent
3. Original state is always recoverable
```

---

## API Usage

### Chrome DevTools API

#### inspectedWindow.eval()

**Purpose:** Execute JavaScript in page context

**Usage:**
```javascript
chrome.devtools.inspectedWindow.eval(
  expression,    // String of JavaScript code
  options,       // Optional execution options
  callback       // (result, exceptionInfo) => void
);
```

**Example:**
```javascript
chrome.devtools.inspectedWindow.eval(
  'document.title',
  (result, isException) => {
    if (isException) {
      console.error('Exception:', result);
    } else {
      console.log('Result:', result);
    }
  }
);
```

**Security Properties:**
- Runs in page context, not extension context
- Subject to page's Content Security Policy
- Cannot access chrome.* APIs
- Returns serializable values only
- Maximum return size: ~8MB

#### panels.create()

**Purpose:** Create custom DevTools panel

**Usage:**
```javascript
chrome.devtools.panels.create(
  title,        // Panel title
  iconPath,     // Path to icon
  pagePath,     // Path to panel HTML
  callback      // (panel) => void
);
```

**Example:**
```javascript
chrome.devtools.panels.create(
  "Security Research",
  "icons/icon-32.png",
  "panel.html",
  (panel) => {
    panel.onShown.addListener(() => {
      console.log('Panel shown');
    });
  }
);
```

### Runtime Messaging

**Purpose:** Communication between components

**Usage:**
```javascript
// Send message
chrome.runtime.sendMessage({
  type: 'PANEL_OPENED',
  data: { ... }
});

// Receive message
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PANEL_OPENED') {
    // Handle message
  }
});
```

### Fetch API

**Purpose:** Web scraping (GitHub, public sites)

**Usage:**
```javascript
const response = await fetch('https://raw.githubusercontent.com/...');
const content = await response.text();
```

**Limitations:**
- Subject to CORS
- No cookie sending
- No authentication headers
- Public resources only

---

## Extension Lifecycle

### Installation Flow

```
1. User loads unpacked extension
        ↓
2. Chrome reads manifest.json
        ↓
3. Background service worker registered
        ↓
4. Extension icon appears in toolbar
        ↓
5. Extension ready (badge empty)
```

### Runtime Flow

```
1. User opens webpage
        ↓
2. User opens DevTools (F12)
        ↓
3. devtools.html loads
        ↓
4. devtools.js creates panel
        ↓
5. panel.html loads terminal UI
        ↓
6. panel.js initializes terminal
        ↓
7. Badge updates to "ON"
        ↓
8. User enters commands
        ↓
9. Commands execute in page context
        ↓
10. Results display in terminal
```

### Command Execution Flow

```
User types command in input
        ↓
Presses Enter
        ↓
panel.js captures input
        ↓
parseCommand() routes to handler
        ↓
Status indicator activates
        ↓
Badge updates to "RUN"
        ↓
chrome.devtools.inspectedWindow.eval() executes
        ↓
Result captured
        ↓
Output displayed in terminal
        ↓
Status indicator deactivates
        ↓
Badge returns to "ON"
```

### Panel Close Flow

```
User closes DevTools
        ↓
panel.onHidden event fires
        ↓
Message sent to background worker
        ↓
Badge cleared
        ↓
Panel state discarded
        ↓
No persistence
```

---

## Performance Considerations

### Memory Management

**Terminal Output:**
- Unbounded output can consume memory
- Consider implementing output line limits
- Clear command available for manual cleanup

**Command History:**
- Stored in array (in memory only)
- Consider limiting history size (e.g., last 100 commands)

**DOM Modifications:**
- Direct DOM manipulation is fast
- No performance overhead from persistence

### Network Considerations

**Scraping:**
- Fetch requests are async (non-blocking)
- Consider rate limiting for bulk operations
- GitHub API has rate limits (60 req/hour unauthenticated)

**Best Practices:**
- Limit output display (5000 chars shown in example)
- Truncate large responses
- Show loading indicators for long operations

---

## Future Enhancement Considerations

### Security Enhancements
1. Command allowlist/blocklist
2. Execution timeout limits
3. Output size limits
4. Rate limiting on commands

### Feature Enhancements
1. Command autocomplete
2. Syntax highlighting
3. Export terminal session
4. Save/load command scripts
5. GitHub API token support (optional)

### UX Enhancements
1. Split-panel output
2. Tabbed output views
3. Search in terminal output
4. Customizable color schemes
5. Font size adjustment

---

## Testing Guidelines

### Manual Testing

**Extension Installation:**
- [ ] Loads without errors
- [ ] Icon appears in toolbar
- [ ] Badge is empty initially

**Panel Opening:**
- [ ] Panel appears in DevTools
- [ ] UI renders correctly
- [ ] Badge updates to "ON"

**JavaScript Execution:**
- [ ] Simple expressions work
- [ ] Complex code executes
- [ ] Errors are caught and displayed
- [ ] Return values displayed correctly

**DOM Modification:**
- [ ] Elements can be selected
- [ ] Text changes apply
- [ ] HTML changes apply
- [ ] Attributes update
- [ ] Page reload clears changes

**Scraping:**
- [ ] URL validation works
- [ ] GitHub README fetches
- [ ] Page text extracts
- [ ] Links extract correctly
- [ ] Errors handled gracefully

**Status Indicators:**
- [ ] Indicators activate during operations
- [ ] Indicators deactivate after completion
- [ ] Badge updates in sync
- [ ] Multiple operations tracked correctly

### Security Testing

**Permission Boundary:**
- [ ] Cannot access chrome:// pages
- [ ] Cannot access other tabs
- [ ] Cannot bypass CSP
- [ ] Cannot access extension context

**Data Safety:**
- [ ] No data stored in localStorage
- [ ] No cookies set
- [ ] No network requests to unauthorized domains
- [ ] No credential exposure

**Error Handling:**
- [ ] Invalid commands handled gracefully
- [ ] Network errors caught
- [ ] Page errors don't crash extension
- [ ] CSP violations reported clearly

---

## Maintenance Notes

### Code Style
- Use clear, descriptive variable names
- Add comments for security-critical sections
- Document ethical design decisions
- Keep functions focused and testable

### Documentation
- Update README for new features
- Document security implications
- Maintain architecture diagrams
- Keep examples current

### Version Control
- Semantic versioning (MAJOR.MINOR.PATCH)
- Changelog for each release
- Tag security fixes clearly
- Document breaking changes

---

**Last Updated:** 2024
**Version:** 1.0.0
**Security Review:** Required before public release
