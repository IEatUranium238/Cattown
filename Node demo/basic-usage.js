// Basic usage example for Cattown in Node.js like environment
import { returnHTML, insertIntoElement, setSettings, setDOMPurify } from 'cattown';

// Example : Basic markdown to HTML conversion
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
let html = returnHTML(markdown);
console.log('Generated HTML:', html);

// Example : Configurated
setSettings('debugMode', true);
setSettings('enableSanitization', true);
setSettings('useCustomTheme', true);

html = returnHTML(markdown);
console.log('Generated HTML:', html);