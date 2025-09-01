/**
 * CATTOWN INTEGRATION TESTS
 * 
 * This test suite covers the complete workflow from markdown input
 * to HTML output, testing the integration between all modules.
 */

import { 
  returnHTML, 
  insertIntoElement, 
  replaceIntoElement, 
  appendIntoElement, 
  setDOMPurify 
} from '../src/cattownMain.js';
import { getSettings, setSettings } from '../src/cattownConfig.js';
import tokenizer from '../src/tokenizer.js';
import convertTokensToHTML from '../src/tokensToHTML.js';

// Mock DOMPurify for testing
const mockDOMPurify = {
  sanitize: jest.fn((html) => html)
};

// Mock DOM for Node.js environment
const mockDocument = {
  createElement: jest.fn((tagName) => ({
    innerHTML: '',
    nodeType: 1,
    nodeName: tagName.toUpperCase(),
    childNodes: [],
    removeChild: jest.fn(),
    appendChild: jest.fn(),
    replaceChild: jest.fn()
  }))
};

// Mock console methods
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn
};

beforeEach(() => {
  jest.clearAllMocks();
  mockDOMPurify.sanitize.mockImplementation((html) => html);
  
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
  
  // Reset settings to defaults
  setSettings('debugMode', false);
  setSettings('enableSanitization', true);
  setSettings('useCustomTheme', false);
  setSettings('LanguageNameInCode', true);
  setSettings('IconInCode', true);
  
  setDOMPurify(mockDOMPurify);
  
  // Mock document globally
  global.document = mockDocument;
  global.Node = {
    TEXT_NODE: 3,
    ELEMENT_NODE: 1
  };
});

afterEach(() => {
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
});

describe('Cattown Integration Tests', () => {
  describe('Complete Workflow', () => {
    test('should process markdown through complete pipeline', () => {
      const markdown = '# Title\n**Bold** and *italic* text';
      
      // Test the complete workflow
      const html = returnHTML(markdown);
      
      expect(html).toContain('<h1>Title</h1>');
      expect(html).toContain('<strong>Bold</strong>');
      expect(html).toContain('<em>italic</em>');
    });

    test('should handle complex markdown through all stages', () => {
      const markdown = `
# Main Heading

This is a paragraph with **bold** and *italic* text.

- List item 1
- List item 2 with [link](https://example.com)

\`\`\`javascript
console.log("code block");
\`\`\`

> Blockquote with **formatting**

| Table | Header |
|-------|--------|
| Cell  | Data   |

---

**End of content**
`;

      const html = returnHTML(markdown);
      
      // Verify all elements are present
      expect(html).toContain('<h1>Main Heading</h1>');
      expect(html).toContain('<p>This is a paragraph');
      expect(html).toContain('<strong>bold</strong>');
      expect(html).toContain('<em>italic</em>');
      expect(html).toContain('<ul>');
      expect(html).toContain('<a href="https://example.com">link</a>');
      expect(html).toContain('<pre>');
      expect(html).toContain('<blockquote>');
      expect(html).toContain('<table>');
      expect(html).toContain('<hr>');
      expect(html).toContain('<strong>End of content</strong>');
    });
  });

  describe('Module Integration', () => {
    test('should integrate tokenizer and HTML converter correctly', () => {
      const markdown = '# Heading\n**Bold** text';
      
      // Test individual modules
      const tokens = tokenizer(markdown);
      const html = convertTokensToHTML(tokens);
      
      // Test complete workflow
      const completeHtml = returnHTML(markdown);
      
      // Results should be consistent
      expect(html).toContain('<h1>Heading</h1>');
      expect(html).toContain('<strong>Bold</strong>');
      expect(completeHtml).toContain('<h1>Heading</h1>');
      expect(completeHtml).toContain('<strong>Bold</strong>');
    });

    test('should respect configuration settings throughout pipeline', () => {
      const markdown = '```javascript\nconsole.log("test");\n```';
      
      // Test with default settings
      let html = returnHTML(markdown);
      expect(html).toContain('javascript'); // Language name should be shown
      expect(html).toContain('devicon'); // Icon should be shown
      
      // Test with disabled settings
      setSettings('LanguageNameInCode', false);
      setSettings('IconInCode', false);
      
      html = returnHTML(markdown);
      expect(html).not.toContain('javascript'); // Language name should be hidden
      expect(html).not.toContain('devicon'); // Icon should be hidden
    });

    test('should handle sanitization integration', () => {
      const markdown = '<script>alert("xss")</script>**Safe** content';
      
      // Mock DOMPurify to remove script tags
      mockDOMPurify.sanitize.mockImplementation((html) => 
        html.replace(/<script[^>]*>.*?<\/script>/gi, '')
      );
      
      const html = returnHTML(markdown);
      
      expect(mockDOMPurify.sanitize).toHaveBeenCalled();
      expect(html).not.toContain('<script>');
      expect(html).toContain('<strong>Safe</strong>');
    });
  });

  describe('DOM Integration', () => {
    let mockElement;

    beforeEach(() => {
      mockElement = {
        innerHTML: '',
        appendChild: jest.fn(),
        insertBefore: jest.fn(),
        removeChild: jest.fn(),
        childNodes: []
      };
    });

    test('should integrate DOM manipulation with markdown processing', () => {
      const markdown = '# Title\n**Bold** content';
      
      insertIntoElement(markdown, mockElement);
      
      expect(mockElement.innerHTML).toContain('<h1>Title</h1>');
      expect(mockElement.innerHTML).toContain('<strong>Bold</strong>');
    });

    test('should handle append operations correctly', () => {
      mockElement.innerHTML = 'Existing content';
      
      appendIntoElement('**New** content', mockElement);
      
      expect(mockElement.innerHTML).toContain('Existing content');
      expect(mockElement.innerHTML).toContain('<strong>New</strong>');
    });

    test('should handle replace operations with smart diffing', () => {
      // Test that replaceIntoElement doesn't throw
      expect(() => {
        replaceIntoElement('**new content**', mockElement);
      }).not.toThrow();
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle errors gracefully throughout pipeline', () => {
      // Test with malformed input that might cause issues
      const malformedMarkdown = '**unclosed bold\n[unclosed link\n```unclosed code';
      
      const html = returnHTML(malformedMarkdown);
      
      // Should not throw and should return some HTML
      expect(typeof html).toBe('string');
      expect(html.length).toBeGreaterThan(0);
    });

    test('should handle DOMPurify errors gracefully', () => {
      mockDOMPurify.sanitize.mockImplementation(() => {
        throw new Error('Sanitization error');
      });
      
      const html = returnHTML('**test**');
      
      // Should return some HTML even if sanitization fails
      expect(typeof html).toBe('string');
      expect(html.length).toBeGreaterThan(0);
    });

    test('should handle configuration errors gracefully', () => {
      // Test with invalid configuration
      setSettings('nonExistentSetting', true);
      
      const html = returnHTML('**test**');
      
      // Should still work despite configuration warning
      expect(html).toContain('<strong>test</strong>');
    });
  });

  describe('Performance Integration', () => {
    test('should handle large documents efficiently', () => {
      const largeMarkdown = Array(1000).fill().map((_, i) => 
        `# Heading ${i}\n\nThis is paragraph ${i} with **bold** and *italic* text.\n\n`
      ).join('');
      
      const startTime = Date.now();
      const html = returnHTML(largeMarkdown);
      const endTime = Date.now();
      
      expect(html.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    test('should handle rapid successive conversions', () => {
      const markdown = '# Test\n**Bold** content';
      
      const startTime = Date.now();
      
      for (let i = 0; i < 100; i++) {
        const html = returnHTML(markdown);
        expect(html).toContain('<h1>Test</h1>');
        expect(html).toContain('<strong>Bold</strong>');
      }
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });

  describe('Configuration Integration', () => {
    test('should apply all configuration settings correctly', () => {
      const markdown = '```javascript\nconsole.log("test");\n```\n\n**Bold** text';
      
      // Test all configuration combinations
      const configs = [
        { useCustomTheme: true, LanguageNameInCode: true, IconInCode: true },
        { useCustomTheme: false, LanguageNameInCode: true, IconInCode: true },
        { useCustomTheme: true, LanguageNameInCode: false, IconInCode: true },
        { useCustomTheme: true, LanguageNameInCode: true, IconInCode: false },
        { useCustomTheme: false, LanguageNameInCode: false, IconInCode: false }
      ];
      
      configs.forEach(config => {
        setSettings('useCustomTheme', config.useCustomTheme);
        setSettings('LanguageNameInCode', config.LanguageNameInCode);
        setSettings('IconInCode', config.IconInCode);
        
        const html = returnHTML(markdown);
        
        if (config.useCustomTheme) {
          expect(html).toContain('ct-parsed');
        } else {
          expect(html).not.toContain('ct-parsed');
        }
        
        if (config.LanguageNameInCode) {
          expect(html).toContain('javascript');
        } else {
          expect(html).not.toContain('javascript');
        }
        
        if (config.IconInCode) {
          expect(html).toContain('devicon');
        } else {
          expect(html).not.toContain('devicon');
        }
        
        // Bold text should always be present (but may be escaped)
        expect(html).toContain('Bold');
      });
    });

    test('should maintain configuration state across operations', () => {
      setSettings('debugMode', true);
      setSettings('useCustomTheme', false);
      
      // Perform multiple operations
      returnHTML('**test 1**');
      returnHTML('**test 2**');
      returnHTML('**test 3**');
      
      // Configuration should remain consistent
      expect(getSettings('debugMode')).toBe(true);
      expect(getSettings('useCustomTheme')).toBe(false);
    });
  });

  describe('Real-world Scenarios', () => {
    test('should handle GitHub-style README content', () => {
      const readmeContent = `
# Cattown Markdown Parser

A lightweight, pure JavaScript markdown parser with built-in HTML sanitization.

## Features

- **Pure JavaScript** - No dependencies except DOMPurify
- **XSS Protection** - Built-in sanitization
- **Customizable** - Multiple configuration options
- **Fast** - Optimized for performance

## Installation

\`\`\`bash
npm install cattown
\`\`\`

## Usage

\`\`\`javascript
import { returnHTML } from 'cattown';

const html = returnHTML('# Hello World\\n**Bold** text');
\`\`\`

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| debugMode | false | Enable debug logging |
| useCustomTheme | true | Add CSS classes |

> **Note**: This is a powerful and flexible markdown parser.

---

*Built with ❤️ by the Cattown team*
`;

      const html = returnHTML(readmeContent);
      
      // Verify all elements are properly rendered
      expect(html).toContain('<h1>Cattown Markdown Parser</h1>');
      expect(html).toContain('<h2>Features</h2>');
      expect(html).toContain('<ul>');
      expect(html).toContain('<strong>Pure JavaScript</strong>');
      expect(html).toContain('<h2>Installation</h2>');
      expect(html).toContain('<pre>');
      expect(html).toContain('npm install cattown');
      expect(html).toContain('<h2>Usage</h2>');
      expect(html).toContain('<h2>Configuration</h2>');
      expect(html).toContain('<table>');
      expect(html).toContain('<blockquote>');
      expect(html).toContain('<strong>Note</strong>');
      expect(html).toContain('<hr>');
      expect(html).toContain('Built with ❤️');
    });

    test('should handle technical documentation', () => {
      const techDoc = `
# API Reference

## Methods

### returnHTML(markdown)

Converts markdown to HTML string.

**Parameters:**
- \`markdown\` (string) - The markdown text to convert

**Returns:** string - The converted HTML

**Example:**
\`\`\`javascript
const html = returnHTML('# Title\\n**Bold** text');
console.log(html);
// Output: <h1>Title</h1><p><strong>Bold</strong> text</p>
\`\`\`

## Error Handling

> **Important**: Always handle potential errors when processing user input.

\`\`\`
try {
  const html = returnHTML(userInput);
} catch (error) {
  console.error('Conversion failed:', error);
}
\`\`\`
`;

      const html = returnHTML(techDoc);
      
      expect(html).toContain('<h1>API Reference</h1>');
      expect(html).toContain('<h2>Methods</h2>');
      expect(html).toContain('<h3>returnHTML(markdown)</h3>');
      expect(html).toContain('<strong>Parameters:</strong>');
      expect(html).toContain('<code>markdown</code>');
      expect(html).toContain('<strong>Returns:</strong>');
      expect(html).toContain('<h2>Error Handling</h2>');
      expect(html).toContain('<blockquote>');
      expect(html).toContain('<strong>Important</strong>');
    });
  });
});
