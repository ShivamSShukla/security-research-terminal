/**
 * Security Research Terminal - Main Panel Logic
 * 
 * ARCHITECTURE:
 * - Uses chrome.devtools.inspectedWindow.eval for all JavaScript execution
 * - No silent execution - all actions are user-initiated via commands
 * - Clear status indicators for transparency
 * - Ethical scraping limited to public resources only
 * 
 * SECURITY PRINCIPLES:
 * 1. Explicit user action required for all operations
 * 2. No background injection or hidden behavior
 * 3. No data exfiltration
 * 4. No persistence across sessions
 * 5. Clear visual indicators of all active capabilities
 */

class SecurityResearchTerminal {
  constructor() {
    // DOM Elements
    this.output = document.getElementById('output');
    this.commandInput = document.getElementById('commandInput');
    this.targetUrl = document.getElementById('targetUrl');
    this.validateBtn = document.getElementById('validateUrl');
    
    // Status indicators
    this.snippetStatus = document.getElementById('snippetStatus');
    this.domStatus = document.getElementById('domStatus');
    this.scrapeStatus = document.getElementById('scrapeStatus');
    
    // State
    this.commandHistory = [];
    this.historyIndex = -1;
    this.validatedUrl = null;
    this.currentOperation = null;
    
    // Initialize
    this.init();
  }
  
  init() {
    // Command input handler
    this.commandInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
    
    // URL validation
    this.validateBtn.addEventListener('click', () => this.validateTargetUrl());
    this.targetUrl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.validateTargetUrl();
    });
    
    // Focus on command input
    this.commandInput.focus();
  }
  
  /**
   * Handle keyboard input in command line
   */
  handleKeyDown(e) {
    switch(e.key) {
      case 'Enter':
        e.preventDefault();
        this.executeCommand();
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        this.navigateHistory('up');
        break;
        
      case 'ArrowDown':
        e.preventDefault();
        this.navigateHistory('down');
        break;
    }
  }
  
  /**
   * Navigate through command history
   */
  navigateHistory(direction) {
    if (this.commandHistory.length === 0) return;
    
    if (direction === 'up') {
      if (this.historyIndex < this.commandHistory.length - 1) {
        this.historyIndex++;
        this.commandInput.value = this.commandHistory[this.historyIndex];
      }
    } else {
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.commandInput.value = this.commandHistory[this.historyIndex];
      } else if (this.historyIndex === 0) {
        this.historyIndex = -1;
        this.commandInput.value = '';
      }
    }
  }
  
  /**
   * Execute command from input
   */
  async executeCommand() {
    const command = this.commandInput.value.trim();
    
    if (!command) return;
    
    // Add to history
    this.commandHistory.unshift(command);
    this.historyIndex = -1;
    
    // Display command in output
    this.appendOutput(`researcher@browser:~$ ${command}`, 'command-line');
    
    // Clear input
    this.commandInput.value = '';
    
    // Parse and execute
    await this.parseCommand(command);
    
    // Scroll to bottom
    this.output.parentElement.scrollTop = this.output.parentElement.scrollHeight;
  }
  
  /**
   * Parse command and route to appropriate handler
   */
  async parseCommand(command) {
    const parts = command.split(/\s+/);
    const mainCommand = parts[0].toLowerCase();
    
    try {
      switch(mainCommand) {
        case 'help':
          this.showHelp();
          break;
          
        case 'clear':
          this.clearTerminal();
          break;
          
        case 'scrape':
          await this.handleScrapeCommand(parts.slice(1));
          break;
          
        case 'dom':
          await this.handleDomCommand(parts.slice(1));
          break;
          
        case 'eval':
        case 'exec':
        case 'run':
          await this.handleSnippetExecution(command.substring(mainCommand.length).trim());
          break;
          
        default:
          // Treat unrecognized commands as JavaScript snippets
          await this.handleSnippetExecution(command);
      }
    } catch (error) {
      this.appendOutput(`ERROR: ${error.message}`, 'error');
    }
  }
  
  /**
   * Display help information
   */
  showHelp() {
    const helpText = `
═══════════════════════════════════════════════════════════════
AVAILABLE COMMANDS
═══════════════════════════════════════════════════════════════

JAVASCRIPT SNIPPET EXECUTION:
  <javascript code>          Execute JavaScript in page context
  eval <code>                Explicitly evaluate JavaScript
  Examples:
    document.title
    Array.from(document.links).map(l => l.href)
    window.location.href

DOM MODIFICATION:
  dom set <selector> <value>     Set text content of elements
  dom html <selector> <html>     Set innerHTML of elements
  dom attr <selector> <attr> <value>  Set attribute
  dom replace <old> <new>        Replace text in page
  Examples:
    dom set h1 "New Heading"
    dom html #content "<p>Updated</p>"
    dom attr .button disabled true
    dom replace "old text" "new text"

SCRAPING (requires validated Target URL):
  scrape github readme           Fetch README.md
  scrape github tree             Show repository structure
  scrape github file <path>      Fetch specific file
  scrape page text               Extract visible text
  scrape page links              Extract all links
  scrape page meta               Extract meta tags

UTILITY:
  help                          Show this help
  clear                         Clear terminal output

═══════════════════════════════════════════════════════════════
ETHICAL USAGE GUIDELINES
═══════════════════════════════════════════════════════════════

✓ Only operate on tabs you explicitly opened
✓ Only scrape public repositories and websites
✓ Respect robots.txt and terms of service
✓ Use for authorized bug bounty research only
✓ No automated crawling or rate limit abuse

✗ No authentication bypass attempts
✗ No private content access
✗ No data exfiltration
✗ No malicious code injection

═══════════════════════════════════════════════════════════════
`;
    this.appendOutput(helpText, 'success');
  }
  
  /**
   * Clear terminal output
   */
  clearTerminal() {
    this.output.innerHTML = '';
    this.appendOutput('Terminal cleared.', 'success');
  }
  
  /**
   * Validate target URL for scraping
   */
  validateTargetUrl() {
    const url = this.targetUrl.value.trim();
    
    if (!url) {
      this.appendOutput('ERROR: Please enter a URL', 'error');
      return;
    }
    
    try {
      const parsedUrl = new URL(url);
      
      // Validate protocol
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Only HTTP and HTTPS protocols are supported');
      }
      
      this.validatedUrl = parsedUrl;
      this.targetUrl.style.borderColor = 'var(--text-primary)';
      this.appendOutput(`✓ Target URL validated: ${url}`, 'success');
      
    } catch (error) {
      this.validatedUrl = null;
      this.targetUrl.style.borderColor = 'var(--text-error)';
      this.appendOutput(`ERROR: Invalid URL - ${error.message}`, 'error');
    }
  }
  
  /**
   * Handle scraping commands
   */
  async handleScrapeCommand(args) {
    if (!this.validatedUrl) {
      this.appendOutput('ERROR: Please validate a Target URL first', 'error');
      return;
    }
    
    this.setStatusIndicator('scraping', true);
    
    try {
      const type = args[0]?.toLowerCase();
      
      switch(type) {
        case 'github':
          await this.scrapeGitHub(args.slice(1));
          break;
          
        case 'page':
          await this.scrapePage(args.slice(1));
          break;
          
        default:
          this.appendOutput('ERROR: Unknown scrape type. Use: github or page', 'error');
      }
    } finally {
      this.setStatusIndicator('scraping', false);
    }
  }
  
  /**
   * Scrape GitHub repository (public only)
   */
  async scrapeGitHub(args) {
    const action = args[0]?.toLowerCase();
    
    // Parse GitHub URL
    const url = this.validatedUrl;
    const pathParts = url.pathname.split('/').filter(p => p);
    
    if (!url.hostname.includes('github.com') || pathParts.length < 2) {
      this.appendOutput('ERROR: Invalid GitHub repository URL', 'error');
      return;
    }
    
    const owner = pathParts[0];
    const repo = pathParts[1];
    
    this.appendOutput(`Scraping GitHub: ${owner}/${repo}`, 'success');
    
    switch(action) {
      case 'readme':
        await this.fetchGitHubFile(owner, repo, 'README.md');
        break;
        
      case 'tree':
        await this.fetchGitHubTree(owner, repo);
        break;
        
      case 'file':
        const filePath = args.slice(1).join(' ');
        if (!filePath) {
          this.appendOutput('ERROR: Please specify a file path', 'error');
          return;
        }
        await this.fetchGitHubFile(owner, repo, filePath);
        break;
        
      default:
        this.appendOutput('ERROR: Unknown GitHub action. Use: readme, tree, or file <path>', 'error');
    }
  }
  
  /**
   * Fetch file from GitHub (public repos only)
   */
  async fetchGitHubFile(owner, repo, filePath) {
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${filePath}`;
    
    try {
      const response = await fetch(rawUrl);
      
      if (!response.ok) {
        // Try master branch if main fails
        const masterUrl = `https://raw.githubusercontent.com/${owner}/${repo}/master/${filePath}`;
        const masterResponse = await fetch(masterUrl);
        
        if (!masterResponse.ok) {
          throw new Error(`File not found: ${filePath}`);
        }
        
        const content = await masterResponse.text();
        this.displayFileContent(filePath, content);
        return;
      }
      
      const content = await response.text();
      this.displayFileContent(filePath, content);
      
    } catch (error) {
      this.appendOutput(`ERROR: ${error.message}`, 'error');
    }
  }
  
  /**
   * Fetch repository tree structure
   */
  async fetchGitHubTree(owner, repo) {
    // Note: This would require GitHub API token for full functionality
    // For demo purposes, we'll show a limited approach
    this.appendOutput('INFO: Tree view requires GitHub API access', 'warning');
    this.appendOutput('Attempting to fetch common files...', 'success');
    
    const commonFiles = [
      'README.md',
      'package.json',
      'manifest.json',
      'SECURITY.md',
      'LICENSE'
    ];
    
    for (const file of commonFiles) {
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${file}`;
      try {
        const response = await fetch(rawUrl);
        if (response.ok) {
          this.appendOutput(`  ✓ ${file}`, 'success');
        }
      } catch (e) {
        // Silently skip missing files
      }
    }
  }
  
  /**
   * Display file content in terminal
   */
  displayFileContent(fileName, content) {
    this.appendOutput(`\n─── ${fileName} ───`, 'success');
    
    // Limit display length for large files
    const maxLength = 5000;
    const displayContent = content.length > maxLength 
      ? content.substring(0, maxLength) + '\n\n[... truncated ...]'
      : content;
    
    this.appendOutput(displayContent, 'code');
    this.appendOutput(`─── End of ${fileName} ───\n`, 'success');
  }
  
  /**
   * Scrape webpage content
   */
  async scrapePage(args) {
    const action = args[0]?.toLowerCase();
    
    switch(action) {
      case 'text':
        await this.scrapePageText();
        break;
        
      case 'links':
        await this.scrapePageLinks();
        break;
        
      case 'meta':
        await this.scrapePageMeta();
        break;
        
      default:
        this.appendOutput('ERROR: Unknown page action. Use: text, links, or meta', 'error');
    }
  }
  
  /**
   * Scrape visible page text
   */
  async scrapePageText() {
    const code = `
      (() => {
        const body = document.body;
        const text = body.innerText || body.textContent;
        return { text: text.substring(0, 5000) }; // Limit output
      })()
    `;
    
    this.executeInPage(code, (result) => {
      if (result && result.text) {
        this.appendOutput('\n─── Page Text ───', 'success');
        this.appendOutput(result.text, 'success');
        this.appendOutput('─── End ───\n', 'success');
      }
    });
  }
  
  /**
   * Scrape page links
   */
  async scrapePageLinks() {
    const code = `
      (() => {
        const links = Array.from(document.querySelectorAll('a[href]'));
        return {
          count: links.length,
          links: links.slice(0, 100).map(a => ({
            text: a.textContent.trim().substring(0, 50),
            href: a.href
          }))
        };
      })()
    `;
    
    this.executeInPage(code, (result) => {
      if (result && result.links) {
        this.appendOutput(`\nFound ${result.count} links (showing first 100):`, 'success');
        result.links.forEach(link => {
          this.appendOutput(`  ${link.text} → ${link.href}`, 'success');
        });
      }
    });
  }
  
  /**
   * Scrape page meta tags
   */
  async scrapePageMeta() {
    const code = `
      (() => {
        const metas = Array.from(document.querySelectorAll('meta'));
        return {
          title: document.title,
          metas: metas.map(m => ({
            name: m.getAttribute('name') || m.getAttribute('property'),
            content: m.getAttribute('content')
          })).filter(m => m.name)
        };
      })()
    `;
    
    this.executeInPage(code, (result) => {
      if (result) {
        this.appendOutput(`\nTitle: ${result.title}`, 'success');
        this.appendOutput('\nMeta Tags:', 'success');
        result.metas.forEach(meta => {
          this.appendOutput(`  ${meta.name}: ${meta.content}`, 'success');
        });
      }
    });
  }
  
  /**
   * Handle DOM modification commands
   */
  async handleDomCommand(args) {
    this.setStatusIndicator('dom', true);
    
    try {
      const action = args[0]?.toLowerCase();
      
      switch(action) {
        case 'set':
          await this.domSetText(args.slice(1));
          break;
          
        case 'html':
          await this.domSetHtml(args.slice(1));
          break;
          
        case 'attr':
          await this.domSetAttribute(args.slice(1));
          break;
          
        case 'replace':
          await this.domReplaceText(args.slice(1));
          break;
          
        default:
          this.appendOutput('ERROR: Unknown DOM action. Use: set, html, attr, or replace', 'error');
      }
    } finally {
      this.setStatusIndicator('dom', false);
    }
  }
  
  /**
   * Set text content of elements
   */
  async domSetText(args) {
    if (args.length < 2) {
      this.appendOutput('ERROR: Usage: dom set <selector> <text>', 'error');
      return;
    }
    
    const selector = args[0];
    const text = args.slice(1).join(' ');
    
    const code = `
      (() => {
        const elements = document.querySelectorAll('${selector.replace(/'/g, "\\'")}');
        elements.forEach(el => el.textContent = '${text.replace(/'/g, "\\'")}');
        return { count: elements.length };
      })()
    `;
    
    this.executeInPage(code, (result) => {
      if (result && result.count > 0) {
        this.appendOutput(`✓ Updated ${result.count} element(s)`, 'success');
      } else {
        this.appendOutput('WARNING: No elements matched selector', 'warning');
      }
    });
  }
  
  /**
   * Set innerHTML of elements
   */
  async domSetHtml(args) {
    if (args.length < 2) {
      this.appendOutput('ERROR: Usage: dom html <selector> <html>', 'error');
      return;
    }
    
    const selector = args[0];
    const html = args.slice(1).join(' ');
    
    const code = `
      (() => {
        const elements = document.querySelectorAll('${selector.replace(/'/g, "\\'")}');
        elements.forEach(el => el.innerHTML = '${html.replace(/'/g, "\\'")}');
        return { count: elements.length };
      })()
    `;
    
    this.executeInPage(code, (result) => {
      if (result && result.count > 0) {
        this.appendOutput(`✓ Updated HTML of ${result.count} element(s)`, 'success');
      } else {
        this.appendOutput('WARNING: No elements matched selector', 'warning');
      }
    });
  }
  
  /**
   * Set attribute of elements
   */
  async domSetAttribute(args) {
    if (args.length < 3) {
      this.appendOutput('ERROR: Usage: dom attr <selector> <attribute> <value>', 'error');
      return;
    }
    
    const selector = args[0];
    const attr = args[1];
    const value = args.slice(2).join(' ');
    
    const code = `
      (() => {
        const elements = document.querySelectorAll('${selector.replace(/'/g, "\\'")}');
        elements.forEach(el => el.setAttribute('${attr.replace(/'/g, "\\'")}', '${value.replace(/'/g, "\\'")}'));
        return { count: elements.length };
      })()
    `;
    
    this.executeInPage(code, (result) => {
      if (result && result.count > 0) {
        this.appendOutput(`✓ Updated attribute of ${result.count} element(s)`, 'success');
      } else {
        this.appendOutput('WARNING: No elements matched selector', 'warning');
      }
    });
  }
  
  /**
   * Replace text in page
   */
  async domReplaceText(args) {
    if (args.length < 2) {
      this.appendOutput('ERROR: Usage: dom replace <old text> <new text>', 'error');
      return;
    }
    
    const oldText = args[0];
    const newText = args.slice(1).join(' ');
    
    const code = `
      (() => {
        let count = 0;
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );
        
        const nodesToReplace = [];
        while(walker.nextNode()) {
          const node = walker.currentNode;
          if (node.nodeValue && node.nodeValue.includes('${oldText.replace(/'/g, "\\'")}')) {
            nodesToReplace.push(node);
          }
        }
        
        nodesToReplace.forEach(node => {
          node.nodeValue = node.nodeValue.replace(
            new RegExp('${oldText.replace(/'/g, "\\'")}', 'g'),
            '${newText.replace(/'/g, "\\'")}'
          );
          count++;
        });
        
        return { count };
      })()
    `;
    
    this.executeInPage(code, (result) => {
      if (result && result.count > 0) {
        this.appendOutput(`✓ Replaced text in ${result.count} location(s)`, 'success');
      } else {
        this.appendOutput('WARNING: Text not found in page', 'warning');
      }
    });
  }
  
  /**
   * Handle JavaScript snippet execution
   */
  async handleSnippetExecution(code) {
    if (!code) {
      this.appendOutput('ERROR: No code provided', 'error');
      return;
    }
    
    this.setStatusIndicator('snippet', true);
    
    try {
      // Wrap code to capture return value
      const wrappedCode = `
        (() => {
          try {
            const result = ${code};
            return { success: true, result };
          } catch (error) {
            return { success: false, error: error.message };
          }
        })()
      `;
      
      this.executeInPage(wrappedCode, (result, isException) => {
        if (isException) {
          this.appendOutput(`EXCEPTION: ${result}`, 'error');
        } else if (result && !result.success) {
          this.appendOutput(`ERROR: ${result.error}`, 'error');
        } else if (result && result.result !== undefined) {
          this.appendOutput(JSON.stringify(result.result, null, 2), 'success');
        } else {
          this.appendOutput('undefined', 'success');
        }
      });
      
    } finally {
      this.setStatusIndicator('snippet', false);
    }
  }
  
  /**
   * Execute code in inspected page using DevTools API
   * 
   * SECURITY: This uses chrome.devtools.inspectedWindow.eval which:
   * - Only executes in the context of the currently inspected page
   * - Requires DevTools to be open
   * - Is the same mechanism used by Chrome Console
   * - Cannot access extension APIs or cross-origin data
   */
  executeInPage(code, callback) {
    chrome.runtime.sendMessage({ type: 'EXECUTION_START' });
    
    chrome.devtools.inspectedWindow.eval(
      code,
      (result, isException) => {
        chrome.runtime.sendMessage({ type: 'EXECUTION_END' });
        
        if (callback) {
          callback(result, isException);
        }
      }
    );
  }
  
  /**
   * Set status indicator state
   */
  setStatusIndicator(type, active) {
    let element;
    
    switch(type) {
      case 'snippet':
        element = this.snippetStatus;
        break;
      case 'dom':
        element = this.domStatus;
        break;
      case 'scraping':
        element = this.scrapeStatus;
        break;
    }
    
    if (element) {
      const dot = element.querySelector('.indicator-dot');
      
      if (active) {
        element.classList.add('active');
        dot.classList.remove('inactive');
        dot.classList.add('active');
      } else {
        element.classList.remove('active');
        dot.classList.add('inactive');
        dot.classList.remove('active');
      }
    }
  }
  
  /**
   * Append output to terminal
   */
  appendOutput(text, type = 'success') {
    const entry = document.createElement('div');
    entry.className = 'command-entry';
    
    const result = document.createElement('div');
    result.className = `command-result ${type}`;
    result.textContent = text;
    
    entry.appendChild(result);
    this.output.appendChild(entry);
  }
}

// Initialize terminal when panel loads
document.addEventListener('DOMContentLoaded', () => {
  window.terminal = new SecurityResearchTerminal();
});
