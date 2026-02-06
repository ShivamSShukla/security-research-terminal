# Practical Usage Examples

This guide provides real-world examples of how to use the Security Research Terminal for ethical bug bounty research and development work.

## Table of Contents
1. [Bug Bounty Research Examples](#bug-bounty-research-examples)
2. [Developer Debugging Examples](#developer-debugging-examples)
3. [Web Scraping Examples](#web-scraping-examples)
4. [DOM Manipulation Examples](#dom-manipulation-examples)
5. [Advanced Techniques](#advanced-techniques)

---

## Bug Bounty Research Examples

### Example 1: Identifying Input Validation Issues

**Scenario:** Testing if form inputs properly validate data

```bash
# Find all input fields
document.querySelectorAll('input')

# Test with various payloads (authorized testing only)
dom set #email "test'@example.com"
dom set #phone "123-456-7890' OR '1'='1"

# Check if validation triggers
document.querySelector('#email').reportValidity()

# Inspect form submission behavior
document.querySelector('form').onsubmit
```

### Example 2: Testing XSS Protection

**Scenario:** Verify XSS filters are working (authorized testing only)

```bash
# Test if script tags are sanitized
dom html #comment "<script>alert('test')</script>"

# Check if innerHTML accepts dangerous content
eval document.querySelector('#content').innerHTML

# Test event handler injection
dom attr #button onclick "alert('xss')"
```

### Example 3: Checking CORS Configuration

**Scenario:** Test cross-origin resource sharing policies

```bash
# Check current origin
window.location.origin

# Attempt cross-origin fetch (will fail if CORS properly configured)
fetch('https://api.example.com/data').then(r => r.json()).catch(e => console.log('CORS blocked:', e))

# Check headers
fetch('https://api.example.com/data').then(r => r.headers.forEach((v, k) => console.log(k, v)))
```

### Example 4: Enumerating API Endpoints

**Scenario:** Discover accessible API endpoints

```bash
# Check for exposed API documentation
scrape page links

# Look for API endpoints in JavaScript
Array.from(document.querySelectorAll('script')).map(s => s.src).filter(src => src.includes('api'))

# Check global objects for API references
Object.keys(window).filter(k => k.toLowerCase().includes('api'))
```

---

## Developer Debugging Examples

### Example 1: Rapid UI Prototyping

**Scenario:** Test different UI copy without modifying code

```bash
# Change button text
dom set .primary-button "Get Started Now"

# Update heading
dom set h1 "Welcome to Our Platform"

# Change placeholder text
dom attr input[type="email"] placeholder "your@email.com"

# Update call-to-action
dom html .cta "<h2>Special Offer</h2><p>Sign up today!</p>"
```

### Example 2: Debugging JavaScript State

**Scenario:** Inspect application state during runtime

```bash
# Check React state (if app uses React)
document.querySelector('[data-reactroot]').__reactInternalInstance$

# Check Vue state (if app uses Vue)
document.querySelector('#app').__vue__.$data

# Check global app state
window.APP_STATE

# Inspect local storage
JSON.parse(localStorage.getItem('user'))
```

### Example 3: Testing Responsive Behavior

**Scenario:** See how content adapts at different sizes

```bash
# Check current viewport
window.innerWidth + 'x' + window.innerHeight

# Find media queries in stylesheets
Array.from(document.styleSheets).flatMap(sheet => 
  Array.from(sheet.cssRules).filter(rule => rule.media)
)

# Test mobile view classes
dom attr body class "mobile-view"
```

### Example 4: Performance Debugging

**Scenario:** Identify slow-loading resources

```bash
# Get performance timing
performance.getEntriesByType('resource').sort((a,b) => b.duration - a.duration).slice(0, 10)

# Check largest contentful paint
performance.getEntriesByType('largest-contentful-paint')

# Find slow scripts
performance.getEntriesByType('resource').filter(r => r.initiatorType === 'script' && r.duration > 100)
```

---

## Web Scraping Examples

### Example 1: Competitive Analysis

**Scenario:** Analyze competitor's public GitHub repository

```bash
# Set target (competitor's public repo)
Target URL: https://github.com/competitor/product

# Validate URL
[Click Validate]

# Fetch their README
scrape github readme

# Check what files they have
scrape github tree

# Look at their package dependencies
scrape github file package.json

# Check their security policy
scrape github file SECURITY.md
```

### Example 2: Public API Documentation

**Scenario:** Extract API documentation from public site

```bash
# Set target
Target URL: https://docs.api-provider.com

# Validate URL
[Click Validate]

# Extract all documentation links
scrape page links

# Get meta information
scrape page meta

# Extract code examples
document.querySelectorAll('pre code').forEach(block => console.log(block.textContent))
```

### Example 3: Price Monitoring

**Scenario:** Extract pricing information for comparison

```bash
# Extract all prices on page
Array.from(document.querySelectorAll('.price, [class*="price"], [class*="cost"]')).map(el => ({
  element: el.className,
  price: el.textContent
}))

# Find pricing tables
document.querySelectorAll('table').forEach(t => {
  if (t.textContent.toLowerCase().includes('price')) {
    console.log(t.outerHTML);
  }
})
```

### Example 4: Open Source Research

**Scenario:** Researching security tools on GitHub

```bash
# Target: https://github.com/security-org/security-tool

# Check README for setup instructions
scrape github readme

# Look at configuration file
scrape github file config.json

# Check for security advisories
scrape github file SECURITY.md
```

---

## DOM Manipulation Examples

### Example 1: Content Testing

**Scenario:** A/B test different headlines

```bash
# Version A
dom set h1 "Transform Your Business Today"

# Version B
dom set h1 "Grow Your Revenue by 300%"

# Version C
dom set h1 "Join 10,000+ Happy Customers"

# Test with images
dom attr .hero-image src "version-b-hero.jpg"
```

### Example 2: Form Field Population

**Scenario:** Quickly fill forms for testing

```bash
# Fill contact form
dom set input[name="name"] "John Doe"
dom set input[name="email"] "john@example.com"
dom set input[name="phone"] "555-0123"
dom set textarea[name="message"] "This is a test message"

# Set dropdowns
dom attr select[name="country"] value "US"

# Check checkboxes
dom attr input[type="checkbox"] checked true
```

### Example 3: Visual Accessibility Testing

**Scenario:** Test how content looks with different text

```bash
# Test with longer text
dom set .card-title "This is a much longer title to see how the layout handles overflow"

# Test with special characters
dom set .description "Testing émojis 🎉 and spëcial çharacters"

# Test with empty state
dom set .content ""

# Test with maximum length
dom set .bio "Lorem ipsum dolor sit amet...".repeat(10)
```

### Example 4: Dynamic Content Modification

**Scenario:** Replace all occurrences of specific terms

```bash
# Replace brand name across page
dom replace "OldBrand" "NewBrand"

# Update currency symbols
dom replace "$" "€"

# Change terminology
dom replace "users" "members"

# Update dates
dom replace "2023" "2024"
```

---

## Advanced Techniques

### Example 1: Chaining Commands

**Scenario:** Execute multiple operations in sequence

```bash
# Step 1: Extract data
eval data = Array.from(document.querySelectorAll('.product')).map(p => ({
  name: p.querySelector('.name').textContent,
  price: p.querySelector('.price').textContent
}))

# Step 2: Process data
eval sorted = data.sort((a,b) => parseFloat(a.price) - parseFloat(b.price))

# Step 3: Display results
eval sorted.slice(0, 5)
```

### Example 2: Creating Utility Functions

**Scenario:** Define reusable functions for research

```bash
# Define utility function
eval window.findByText = (text) => {
  return Array.from(document.querySelectorAll('*')).find(el => 
    el.textContent.includes(text) && el.children.length === 0
  );
}

# Use the function
eval findByText('Submit')

# Define extraction function
eval window.extractEmails = () => {
  const emailRegex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+/gi;
  return document.body.textContent.match(emailRegex) || [];
}

# Use it
eval extractEmails()
```

### Example 3: Monitoring Network Requests

**Scenario:** Track API calls being made

```bash
# Override fetch to log requests
eval originalFetch = window.fetch; window.fetch = function(...args) {
  console.log('Fetch:', args[0]);
  return originalFetch.apply(this, args);
}

# Trigger actions and see logged requests in console

# Restore original fetch
eval window.fetch = originalFetch
```

### Example 4: Element Inspection Workflow

**Scenario:** Deep inspection of page structure

```bash
# Count elements by tag
eval tags = {}; document.querySelectorAll('*').forEach(el => {
  tags[el.tagName] = (tags[el.tagName] || 0) + 1;
}); tags

# Find elements with inline styles
eval Array.from(document.querySelectorAll('[style]')).map(el => ({
  tag: el.tagName,
  id: el.id,
  style: el.getAttribute('style')
}))

# Find hidden elements
eval Array.from(document.querySelectorAll('*')).filter(el => 
  getComputedStyle(el).display === 'none'
).length

# Find elements with event listeners (approximate)
eval Array.from(document.querySelectorAll('[onclick], [onchange], [onsubmit]')).map(el => ({
  tag: el.tagName,
  id: el.id,
  events: Array.from(el.attributes).filter(a => a.name.startsWith('on'))
}))
```

### Example 5: Security Header Analysis

**Scenario:** Check security headers on resources

```bash
# Get headers from main document (need to check network tab, but can test with fetch)
eval fetch(window.location.href).then(r => {
  console.log('Security Headers:');
  console.log('CSP:', r.headers.get('content-security-policy'));
  console.log('X-Frame-Options:', r.headers.get('x-frame-options'));
  console.log('X-Content-Type-Options:', r.headers.get('x-content-type-options'));
  console.log('Strict-Transport-Security:', r.headers.get('strict-transport-security'));
})
```

---

## Best Practices

### Command Organization

**Use Clear Commands:**
```bash
# Good - clear intent
dom set .error-message "Invalid input"

# Bad - unclear
dom set div "text"
```

**Break Complex Operations:**
```bash
# Instead of one long command:
# eval Array.from(document.querySelectorAll('...')).map(...).filter(...).reduce(...)

# Break it into steps:
eval elements = Array.from(document.querySelectorAll('.item'))
eval mapped = elements.map(e => e.textContent)
eval filtered = mapped.filter(t => t.length > 0)
eval result = filtered.reduce((a, b) => a + b)
```

### Error Handling

**Validate Before Operating:**
```bash
# Check if element exists
eval element = document.querySelector('#target'); element ? 'Found' : 'Not found'

# Then operate if found
dom set #target "New content"
```

**Use Try-Catch for Risky Operations:**
```bash
eval try {
  const data = JSON.parse(document.querySelector('#data').textContent);
  console.log('Parsed:', data);
} catch(e) {
  console.log('Parse failed:', e.message);
}
```

### Documentation

**Document Your Research:**
```bash
# Add comments to terminal
eval console.log('=== Testing Form Validation ===')
# Run tests...
eval console.log('=== Results ===')
# Display results...
```

### Safety Checks

**Always Verify Authorization:**
- ✅ Testing your own site
- ✅ Authorized bug bounty program
- ✅ Explicit written permission
- ❌ Unauthorized testing
- ❌ Live production systems without permission
- ❌ Other people's accounts

**Respect Rate Limits:**
```bash
# Don't do this:
for (let i = 0; i < 1000; i++) {
  fetch('/api/endpoint');
}

# Instead, test responsibly:
fetch('/api/endpoint').then(r => console.log('Response:', r.status))
```

---

## Troubleshooting Examples

### Issue: CSP Blocking Execution

**Problem:** Content Security Policy blocks inline scripts

**Solution:**
```bash
# Check CSP
eval document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content

# or check in console/network tab
# CSP will prevent certain operations - this is expected and correct security behavior
```

### Issue: Cannot Find Elements

**Problem:** Selector returns no elements

**Solution:**
```bash
# Verify element exists
eval document.querySelector('#my-element')

# Try more general selector
eval document.querySelectorAll('[id*="my"]')

# Check in different frame
eval frames[0].document.querySelector('#my-element')
```

### Issue: Command History Lost

**Problem:** Need to repeat complex command

**Solution:**
- Use Up Arrow to navigate history
- Save complex commands in external text file
- Create utility functions for repeated operations

---

**Remember:** This tool is powerful. Always:
1. Get proper authorization
2. Test in appropriate environments
3. Document your findings
4. Report vulnerabilities responsibly
5. Respect privacy and data protection laws
