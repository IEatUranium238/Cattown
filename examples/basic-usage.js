// Basic usage example for Cattown
import { returnHTML, insertIntoElement, setSettings, setDOMPurify } from 'cattown';

// Example 1: Basic markdown to HTML conversion
const markdown = `
# Welcome to Cattown!

This is a **bold** and *italic* text example.

## Features
- Pure JavaScript
- HTML sanitization
- Customizable styling

> This is a blockquote with some important information.

\`inline code\` and code blocks:

\`\`\`javascript
function greet(name) {
    return \`Hello, \${name}!\`;
}
\`\`\`
`;

// Convert markdown to HTML
const html = returnHTML(markdown);
console.log('Generated HTML:', html);

// Example 2: DOM manipulation (browser only)
if (typeof document !== 'undefined') {
    const element = document.getElementById('content');
    if (element) {
        insertIntoElement(markdown, element);
    }
}

// Example 3: Configuration
setSettings('debugMode', true);
setSettings('enableSanitization', true);
setSettings('useCustomTheme', true);

// Example 4: Setting up DOMPurify (browser only)
if (typeof window !== 'undefined') {
    // In a real application, you would import DOMPurify
    // import DOMPurify from 'dompurify';
    // setDOMPurify(DOMPurify);
    
    console.log('DOMPurify setup would go here in browser environment');
}
