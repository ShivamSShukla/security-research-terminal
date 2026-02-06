# Security Research Terminal - Chrome DevTools Extension

A professional Chrome DevTools extension designed for ethical security research, bug bounty hunting, and developer debugging. This tool provides a terminal-style interface for JavaScript execution, DOM manipulation, and controlled web scraping.

## 🎯 Features

### Core Capabilities

1. **JavaScript Snippet Execution**
   - Execute JavaScript directly in the page context
   - Capture return values, console output, and exceptions
   - Identical behavior to Chrome Console

2. **Inline DOM Modification**
   - Modify text content, HTML, and attributes
   - Target elements via CSS selectors
   - Find and replace text across the page
   - Non-persistent changes (revert with page reload)

3. **Controlled Web Scraping**
   - GitHub repository scraping (public repos only)
   - Webpage content extraction (text, links, meta tags)
   - Explicit URL validation required
   - No authentication bypass or private content access

4. **Clear Status Indicators**
   - Real-time visual indicators for all active capabilities
   - Chrome extension badge shows ACTIVE/RUN status
   - Status bar inside terminal shows operation states
   - Complete transparency of tool activity

## 🔒 Security & Ethics

This extension follows strict ethical guidelines:

✅ **Allowed:**
- Operating on tabs you explicitly opened
- Scraping public repositories and websites
- Authorized bug bounty research
- Developer debugging and testing

❌ **Prohibited:**
- Authentication bypass attempts
- Private content access without authorization
- Automated crawling or rate limit abuse
- Data exfiltration
- Malicious code injection

### Security Architecture

- Uses `chrome.devtools.inspectedWindow.eval` (same as Chrome Console)
- No background injection or hidden behavior
- All actions require explicit user initiation
- No persistence across sessions
- No remote code loading
- Only operates in DevTools panel context

## 📦 Installation

### From Source

1. **Download the Extension**
   ```bash
   # Download or clone the extension folder
   ```

2. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select the `security-research-terminal` folder

3. **Verify Installation**
   - You should see "Security Research Terminal" in your extensions
   - The extension icon will appear in your toolbar

## 🚀 Usage

### Opening the Terminal

1. Navigate to any webpage
2. Open Chrome DevTools (F12 or Ctrl+Shift+I / Cmd+Option+I)
3. Click the "Security Research" tab in DevTools
4. The terminal interface will load

### Terminal Interface

```
╔═══════════════════════════════════════════════════════════════╗
║  Security Research Terminal v1.0                              ║
║  Ethical Bug Bounty & Developer Debugging Tool                ║
╚═══════════════════════════════════════════════════════════════╝

researcher@browser:~$ 
```

### Status Indicators

The status bar shows three indicators:
- 🟢 **SNIPPET EXECUTION** - Active during JavaScript execution
- 🟢 **DOM EDIT MODE** - Active during DOM modifications
- 🟢 **SCRAPING** - Active during web scraping operations

The Chrome extension badge shows:
- **ON** (green) - DevTools panel is open
- **RUN** (red) - Operation is executing
- **OFF** (no badge) - Panel is closed

## 📝 Command Reference

### JavaScript Execution

Execute any JavaScript code directly:

```bash
# Direct execution
document.title
window.location.href
Array.from(document.links).map(l => l.href)

# Explicit evaluation
eval document.querySelector('h1').textContent
run console.log('Hello from terminal')
```

### DOM Modification

Modify page elements in real-time:

```bash
# Set text content
dom set h1 "New Heading Text"
dom set .price "$99.99"

# Set HTML content
dom html #content "<p>New paragraph</p>"
dom html .alert "<strong>Important!</strong>"

# Set attributes
dom attr .button disabled true
dom attr img src "new-image.jpg"
dom attr #link href "https://example.com"

# Replace text
dom replace "old text" "new text"
dom replace "Error" "Success"
```

### Web Scraping

First, validate your target URL:

```bash
# Enter URL in the "Target Source URL" field
# Click "Validate" or press Enter
```

Then use scraping commands:

#### GitHub Scraping
```bash
# Fetch README
scrape github readme

# Show repository structure
scrape github tree

# Fetch specific files
scrape github file package.json
scrape github file SECURITY.md
scrape github file src/index.js
```

#### Webpage Scraping
```bash
# Extract visible text
scrape page text

# Extract all links
scrape page links

# Extract meta tags
scrape page meta
```

### Utility Commands

```bash
# Show help
help

# Clear terminal
clear
```

### Command History

- **Up Arrow** - Navigate to previous commands
- **Down Arrow** - Navigate to next commands
- **Enter** - Execute command

## 🎨 Terminal Appearance

The terminal uses a classic hacker aesthetic:
- **Background:** Pure black (#000000)
- **Primary Text:** Bright green (#00ff00)
- **Errors:** Red (#ff0000)
- **Warnings:** Orange (#ffaa00)
- **Info:** Cyan (#00ffff)
- **Font:** JetBrains Mono (monospace)

## 🔧 Architecture

### File Structure

```
security-research-terminal/
├── manifest.json           # Extension manifest (MV3)
├── devtools.html          # DevTools entry point
├── devtools.js            # Panel registration
├── background.js          # Service worker for badge management
├── panel.html             # Main terminal UI
├── panel.css              # Terminal styling
├── panel.js               # Command logic and execution
├── icons/                 # Extension icons
│   ├── icon-16.png
│   ├── icon-32.png
│   ├── icon-48.png
│   └── icon-128.png
└── README.md              # This file
```

### Key Technologies

- **Chrome DevTools API** - Panel integration and page evaluation
- **Manifest V3** - Latest extension standard
- **Service Workers** - Background badge management
- **inspectedWindow.eval** - Safe page context execution

### Data Flow

1. User enters command in terminal
2. Command parser routes to appropriate handler
3. Status indicator activates
4. Chrome extension badge updates
5. Code executes via `chrome.devtools.inspectedWindow.eval`
6. Results are captured and displayed
7. Status indicator deactivates
8. Badge returns to idle state

## 🛡️ Best Practices

### For Bug Bounty Researchers

1. **Always get authorization** before testing on any domain
2. **Respect scope** - only test authorized targets
3. **Follow disclosure policies** of the bug bounty program
4. **Document your findings** properly
5. **Never access or exfiltrate user data**

### For Developers

1. **Test on development/staging** environments first
2. **Use DOM modifications** for UI prototyping
3. **Leverage scraping** for competitive analysis (public data only)
4. **Keep terminal output** for debugging logs
5. **Clear terminal** regularly to manage output

### General Guidelines

- Only operate on tabs you control
- Respect robots.txt and terms of service
- No automated scanning or brute force
- No credential stuffing or account takeover
- No DoS attacks or resource exhaustion
- Report vulnerabilities responsibly

## 🐛 Troubleshooting

### Extension Not Loading

**Problem:** Extension doesn't appear in DevTools
**Solution:** 
- Reload the extension in `chrome://extensions/`
- Refresh the webpage
- Close and reopen DevTools

### Commands Not Executing

**Problem:** Commands don't produce output
**Solution:**
- Check if DevTools is focused on the correct tab
- Verify the page has fully loaded
- Check browser console for errors
- Ensure Content Security Policy allows execution

### Scraping Not Working

**Problem:** Scraping commands fail
**Solution:**
- Validate the Target URL first
- Ensure URL is publicly accessible
- Check network connectivity
- Verify you're using correct GitHub repository format

### Status Indicators Stuck

**Problem:** Indicators remain active
**Solution:**
- Close and reopen the DevTools panel
- Reload the extension
- Refresh the page

## 📚 Additional Resources

- [Chrome DevTools Extension API](https://developer.chrome.com/docs/extensions/mv3/devtools/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [HackerOne Disclosure Guidelines](https://www.hackerone.com/disclosure-guidelines)
- [Bug Bounty Platforms](https://bugbountyforum.com/platforms/)

## ⚖️ Legal Disclaimer

This tool is provided for **authorized security research and development purposes only**. Users are solely responsible for ensuring they have proper authorization before testing any system. Unauthorized access to computer systems is illegal under laws including the Computer Fraud and Abuse Act (CFAA) and similar legislation worldwide.

The authors and contributors assume no liability for misuse of this tool.

## 🤝 Contributing

Contributions are welcome! Please ensure all contributions:
- Maintain ethical guidelines
- Include comprehensive comments
- Follow the existing code style
- Add appropriate documentation

## 📄 License

This extension is provided as-is for educational and authorized security research purposes.

## 🙏 Acknowledgments

Built with security and ethics in mind, inspired by:
- Chrome DevTools team for excellent APIs
- Security research community for ethical guidelines
- Bug bounty researchers for responsible disclosure practices

---

**Remember:** With great power comes great responsibility. Use this tool ethically and legally.
