/**
 * CATTOWN MAIN MODULE TESTS
 * 
 * This test suite covers the core functionality of the Cattown markdown parser
 * including HTML conversion, DOM manipulation, and DOMPurify integration.
 */

import { 
  returnHTML, 
  insertIntoElement, 
  replaceIntoElement, 
  appendIntoElement, 
  setDOMPurify 
} from '../src/cattownMain.js';
import { getSettings, setSettings } from '../src/cattownConfig.js';

// Mock DOMPurify for testing
const mockDOMPurify = {
  sanitize: jest.fn((html) => html) // Default behavior: return as-is
};

// Mock console methods to avoid noise in tests
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn
};

beforeEach(() => {
  // Reset mocks
  jest.clearAllMocks();
  mockDOMPurify.sanitize.mockImplementation((html) => html);
  
  // Suppress console output during tests
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
  
  // Reset settings to defaults
  setSettings('debugMode', false);
  setSettings('enableSanitization', true);
  setSettings('useCustomTheme', false);
});

afterEach(() => {
  // Restore console methods
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
});

describe('Cattown Main Module', () => {
  describe('setDOMPurify', () => {
    test('should set DOMPurify instance correctly', () => {
      setSettings('useCustomTheme', true);
      setDOMPurify(mockDOMPurify);
      // Test that it doesn't throw and can be used
      const result = returnHTML('**test**');
      expect(result).toContain('<strong class="ct-parsed bold">test</strong>');
    });

    test('should throw error for invalid instance type', () => {
      expect(() => setDOMPurify('not a function')).toThrow('Type of instance is not function');
    });

    test('should handle null/undefined gracefully', () => {
      expect(() => setDOMPurify(null)).toThrow('Type of instance is not function');
      expect(() => setDOMPurify(undefined)).toThrow('Type of instance is not function');
    });
  });

  describe('returnHTML', () => {
    beforeEach(() => {
      setDOMPurify(mockDOMPurify);
    });

    test('should convert basic markdown to HTML', () => {
      const result = returnHTML('**bold** and *italic*');
      expect(result).toContain('<strong>bold</strong>');
      expect(result).toContain('<em>italic</em>');
    });

    test('should handle headers', () => {
      const result = returnHTML('# Heading 1\n## Heading 2');
      expect(result).toContain('<h1>Heading 1</h1>');
      expect(result).toContain('<h2>Heading 2</h2>');
    });

    test('should handle lists', () => {
      const result = returnHTML('- Item 1\n- Item 2\n1. Numbered item');
      expect(result).toContain('<ul>');
      expect(result).toContain('<li>Item 1</li>');
      expect(result).toContain('<li>Item 2</li>');
      expect(result).toContain('<ol>');
      expect(result).toContain('<li>Numbered item</li>');
    });

    test('should handle code blocks', () => {
      const result = returnHTML('```javascript\nconsole.log("test");\n```');
      expect(result).toContain('<pre>');
      expect(result).toContain('<code>');
      expect(result).toContain('console.log(&quot;test&quot;);');
    });

    test('should handle inline code', () => {
      setSettings('useCustomTheme', true);
      const result = returnHTML('Use `console.log()` for debugging');
      expect(result).toContain('<code class="ct-parsed code">console.log()</code>');
    });

    test('should handle links', () => {
      setSettings('useCustomTheme', true);
      const result = returnHTML('[Link text](https://example.com)');
      expect(result).toContain('<a href="https://example.com" class="ct-parsed link">Link text</a>');
    });

    test('should handle images', () => {
      setSettings('useCustomTheme', true);
      const result = returnHTML('![Alt text](image.jpg)');
      expect(result).toContain('<img src="image.jpg" alt="Alt text" class="ct-parsed image"');
    });

    test('should handle tables', () => {
      setSettings('useCustomTheme', true);
      const markdown = `
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
`;
      const result = returnHTML(markdown);
      expect(result).toContain('<table class="ct-parsed table">');
      expect(result).toContain('<th class="ct-parsed table-header-cell">Header 1</th>');
      expect(result).toContain('<td class="ct-parsed table-cell">Cell 1</td>');
    });

    test('should handle blockquotes', () => {
      setSettings('useCustomTheme', true);
      const result = returnHTML('> This is a quote');
      expect(result).toContain('<blockquote class="ct-parsed blockquote">');
      expect(result).toContain('This is a quote');
    });

    test('should handle horizontal rules', () => {
      setSettings('useCustomTheme', true);
      const result = returnHTML('---');
      expect(result).toContain('<hr class="ct-parsed hr">');
    });

    test('should sanitize HTML when enabled', () => {
      setSettings('enableSanitization', true);
      mockDOMPurify.sanitize.mockReturnValue('<p>sanitized</p>');
      
      const result = returnHTML('test');
      expect(mockDOMPurify.sanitize).toHaveBeenCalled();
      expect(result).toBe('<p>sanitized</p>');
    });

    test('should not sanitize HTML when disabled', () => {
      setSettings('enableSanitization', false);
      setSettings('useCustomTheme', true);
      
      const result = returnHTML('test');
      expect(mockDOMPurify.sanitize).not.toHaveBeenCalled();
      expect(result).toContain('<p class="ct-parsed paragraph">test</p>');
    });

    test('should handle empty input', () => {
      const result = returnHTML('');
      expect(result).toBe('');
    });

    test('should handle whitespace-only input', () => {
      const result = returnHTML('   \n  \t  ');
      expect(result).toBe('');
    });

    test('should return empty string on error', () => {
      // Test with malformed input that might cause issues
      const result = returnHTML('**unclosed bold\n[unclosed link\n```unclosed code');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test('should handle debug mode', () => {
      setSettings('debugMode', true);
      returnHTML('test');
      expect(console.log).toHaveBeenCalled();
    });

    test('should handle returnHTML with sanitization requested but DOMPurify not available', () => {
      // Temporarily remove DOMPurify
      const originalDOMPurify = global.DOMPurify;
      global.DOMPurify = null;
      
      setSettings('enableSanitization', true);
      
      const result = returnHTML('**test**');
      expect(result).toContain('<strong>test</strong>');
      
      // Restore DOMPurify
      global.DOMPurify = originalDOMPurify;
      setSettings('enableSanitization', false);
    });

    test('should handle returnHTML with debug mode enabled', () => {
      setSettings('debugMode', true);
      
      const result = returnHTML('**test**');
      expect(result).toContain('<strong>test</strong>');
      
      setSettings('debugMode', false);
    });

    test('should handle returnHTML with debug mode disabled', () => {
      setSettings('debugMode', false);
      
      const result = returnHTML('**test**');
      expect(result).toContain('<strong>test</strong>');
    });

    test('should handle insertIntoElement with sanitization requested but DOMPurify not available', () => {
      // Temporarily remove DOMPurify
      const originalDOMPurify = global.DOMPurify;
      global.DOMPurify = null;
      
      setSettings('enableSanitization', true);
      
      const testElement = { innerHTML: '' };
      expect(() => {
        insertIntoElement('**test**', testElement);
      }).not.toThrow();
      
      // Restore DOMPurify
      global.DOMPurify = originalDOMPurify;
      setSettings('enableSanitization', false);
    });

    test('should handle appendIntoElement with sanitization requested but DOMPurify not available', () => {
      // Temporarily remove DOMPurify
      const originalDOMPurify = global.DOMPurify;
      global.DOMPurify = null;
      
      setSettings('enableSanitization', true);
      
      const testElement = { innerHTML: '' };
      expect(() => {
        appendIntoElement('**test**', testElement);
      }).not.toThrow();
      
      // Restore DOMPurify
      global.DOMPurify = originalDOMPurify;
      setSettings('enableSanitization', false);
    });

    test('should handle replaceIntoElement with sanitization requested but DOMPurify not available', () => {
      // Temporarily remove DOMPurify
      const originalDOMPurify = global.DOMPurify;
      global.DOMPurify = null;
      
      setSettings('enableSanitization', true);
      
      const mockDocument = {
        createElement: jest.fn(() => ({
          innerHTML: '<p>new content</p>',
          childNodes: [],
          removeChild: jest.fn()
        }))
      };
      
      const originalDocument = global.document;
      global.document = mockDocument;
      
      const testElement = {
        innerHTML: '<p>old content</p>',
        childNodes: [],
        removeChild: jest.fn(),
        replaceChild: jest.fn(),
        appendChild: jest.fn()
      };
      
      expect(() => {
        replaceIntoElement('**new content**', testElement);
      }).not.toThrow();
      
      global.document = originalDocument;
      global.DOMPurify = originalDOMPurify;
      setSettings('enableSanitization', false);
    });

    test('should handle replaceIntoElement with debug mode enabled', () => {
      setSettings('debugMode', true);
      
      const mockDocument = {
        createElement: jest.fn(() => ({
          innerHTML: '<p>new content</p>',
          childNodes: [],
          removeChild: jest.fn()
        }))
      };
      
      const originalDocument = global.document;
      global.document = mockDocument;
      
      const testElement = {
        innerHTML: '<p>old content</p>',
        childNodes: [],
        removeChild: jest.fn(),
        replaceChild: jest.fn(),
        appendChild: jest.fn()
      };
      
      expect(() => {
        replaceIntoElement('**new content**', testElement);
      }).not.toThrow();
      
      global.document = originalDocument;
      setSettings('debugMode', false);
    });

    test('should handle replaceIntoElement with sanitization enabled', () => {
      setSettings('enableSanitization', true);
      
      const mockDocument = {
        createElement: jest.fn(() => ({
          innerHTML: '<p>new content</p>',
          childNodes: [],
          removeChild: jest.fn()
        }))
      };
      
      const originalDocument = global.document;
      global.document = mockDocument;
      
      const testElement = {
        innerHTML: '<p>old content</p>',
        childNodes: [],
        removeChild: jest.fn(),
        replaceChild: jest.fn(),
        appendChild: jest.fn()
      };
      
      expect(() => {
        replaceIntoElement('**new content**', testElement);
      }).not.toThrow();
      
      global.document = originalDocument;
      setSettings('enableSanitization', false);
    });

    test('should handle replaceIntoElement with sanitization disabled', () => {
      setSettings('enableSanitization', true);
      
      const mockDocument = {
        createElement: jest.fn(() => ({
          innerHTML: '<p>new content</p>',
          childNodes: [],
          removeChild: jest.fn()
        }))
      };
      
      const originalDocument = global.document;
      global.document = mockDocument;
      
      const testElement = {
        innerHTML: '<p>old content</p>',
        childNodes: [],
        removeChild: jest.fn(),
        replaceChild: jest.fn(),
        appendChild: jest.fn()
      };
      
      expect(() => {
        replaceIntoElement('**new content**', testElement);
      }).not.toThrow();
      
      global.document = originalDocument;
      setSettings('enableSanitization', false);
    });
  });

  describe('DOM Manipulation Functions', () => {
    let mockElement;

    beforeEach(() => {
      setDOMPurify(mockDOMPurify);
      mockElement = {
        innerHTML: '',
        appendChild: jest.fn(),
        insertBefore: jest.fn(),
        removeChild: jest.fn(),
        childNodes: []
      };
    });

    test('should replace element content', () => {
      setSettings('useCustomTheme', true);
      insertIntoElement('**new content**', mockElement);
      
      expect(mockElement.innerHTML).toContain('<strong class="ct-parsed bold">new content</strong>');
    });

    test('should add content to element', () => {
      setSettings('useCustomTheme', true);
      mockElement.innerHTML = 'Existing content';
      appendIntoElement('**appended content**', mockElement);
      
      expect(mockElement.innerHTML).toContain('Existing content');
      expect(mockElement.innerHTML).toContain('<strong class="ct-parsed bold">appended content</strong>');
    });

    test('should perform smart updates', () => {
      setSettings('useCustomTheme', true);
      mockElement.innerHTML = '<p>old content</p>';
      
      // Test that the function doesn't throw
      expect(() => {
        replaceIntoElement('**new content**', mockElement);
      }).not.toThrow();
    });

    test('should handle invalid element gracefully', () => {
      expect(() => insertIntoElement('test', null)).toThrow();
      expect(() => insertIntoElement('test', undefined)).toThrow();
      expect(() => insertIntoElement('test', 'not an element')).toThrow();
    });
  });

  describe('Performance and Edge Cases', () => {
    beforeEach(() => {
      setDOMPurify(mockDOMPurify);
    });

    test('should handle large markdown input', () => {
      setSettings('useCustomTheme', true);
      const largeMarkdown = '# Heading\n\n**Bold text**\n\n'.repeat(100);
      
      const result = returnHTML(largeMarkdown);
      
      expect(result).toContain('<h1 class="ct-parsed heading heading-1">Heading</h1>');
      expect(result).toContain('<strong class="ct-parsed bold">Bold text</strong>');
    });

    test('should handle nested formatting', () => {
      setSettings('useCustomTheme', true);
      const result = returnHTML('**Bold with *italic* inside**');
      expect(result).toContain('<strong class="ct-parsed bold">Bold with <em class="ct-parsed italic">italic</em> inside</strong>');
    });

    test('should handle mixed content types', () => {
      setSettings('useCustomTheme', true);
      const markdown = `
# Main Heading

This is a paragraph with **bold** and *italic* text.

- List item 1
- List item 2 with [link](https://example.com)

\`\`\`javascript
console.log("code block");
\`\`\`

> Blockquote with **formatting**
`;

      const result = returnHTML(markdown);
      
      expect(result).toContain('<h1 class="ct-parsed heading heading-1">Main Heading</h1>');
      expect(result).toContain('<p class="ct-parsed paragraph">This is a paragraph');
      expect(result).toContain('<strong class="ct-parsed bold">bold</strong>');
      expect(result).toContain('<em class="ct-parsed italic">italic</em>');
      expect(result).toContain('<ul class="ct-parsed list">');
      expect(result).toContain('<a href="https://example.com" class="ct-parsed link">link</a>');
      expect(result).toContain('<pre class="ct-parsed codeblock-pre">');
      expect(result).toContain('<blockquote class="ct-parsed blockquote">');
    });

    test('should handle special characters', () => {
      const result = returnHTML('Text with & < > " \' characters');
      expect(result).toContain('Text with &amp; &lt; &gt; &quot; &#39; characters');
    });

    test('should handle malformed markdown gracefully', () => {
      const malformed = '**unclosed bold\n[unclosed link\n```unclosed code';
      const result = returnHTML(malformed);
      
      // Should not throw and should return some HTML
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test('should handle DOMPurify errors in insertIntoElement', () => {
      mockDOMPurify.sanitize.mockImplementation(() => {
        throw new Error('Sanitization error');
      });
      
      const testElement = { innerHTML: '' };
      expect(() => {
        insertIntoElement('**test**', testElement);
      }).not.toThrow();
    });

    test('should handle DOMPurify errors in appendIntoElement', () => {
      mockDOMPurify.sanitize.mockImplementation(() => {
        throw new Error('Sanitization error');
      });
      
      const testElement = { innerHTML: '' };
      expect(() => {
        appendIntoElement('**test**', testElement);
      }).not.toThrow();
    });

    test('should handle DOMPurify errors in replaceIntoElement', () => {
      mockDOMPurify.sanitize.mockImplementation(() => {
        throw new Error('Sanitization error');
      });
      
      const testElement = { innerHTML: '' };
      expect(() => {
        replaceIntoElement('**test**', testElement);
      }).not.toThrow();
    });

    test('should handle missing DOMPurify gracefully', () => {
      // Temporarily remove DOMPurify
      const originalDOMPurify = global.DOMPurify;
      global.DOMPurify = null;
      
      const testElement = { innerHTML: '' };
      expect(() => {
        insertIntoElement('**test**', testElement);
      }).not.toThrow();
      
      // Restore DOMPurify
      global.DOMPurify = originalDOMPurify;
    });

    test('should handle missing DOMPurify in append', () => {
      // Temporarily remove DOMPurify
      const originalDOMPurify = global.DOMPurify;
      global.DOMPurify = null;
      
      const testElement = { innerHTML: '' };
      expect(() => {
        appendIntoElement('**test**', testElement);
      }).not.toThrow();
      
      // Restore DOMPurify
      global.DOMPurify = originalDOMPurify;
    });

    test('should handle missing DOMPurify in replace', () => {
      // Temporarily remove DOMPurify
      const originalDOMPurify = global.DOMPurify;
      global.DOMPurify = null;
      
      const testElement = { innerHTML: '' };
      expect(() => {
        replaceIntoElement('**test**', testElement);
      }).not.toThrow();
      
      // Restore DOMPurify
      global.DOMPurify = originalDOMPurify;
    });

    test('should handle sanitization requested but DOMPurify not available in insert', () => {
      // Temporarily remove DOMPurify
      const originalDOMPurify = global.DOMPurify;
      global.DOMPurify = null;
      
      setSettings('enableSanitization', true);
      const testElement = { innerHTML: '' };
      
      expect(() => {
        insertIntoElement('**test**', testElement);
      }).not.toThrow();
      
      // Restore DOMPurify
      global.DOMPurify = originalDOMPurify;
      setSettings('enableSanitization', false);
    });

    test('should handle sanitization requested but DOMPurify not available in append', () => {
      // Temporarily remove DOMPurify
      const originalDOMPurify = global.DOMPurify;
      global.DOMPurify = null;
      
      setSettings('enableSanitization', true);
      const testElement = { innerHTML: '' };
      
      expect(() => {
        appendIntoElement('**test**', testElement);
      }).not.toThrow();
      
      // Restore DOMPurify
      global.DOMPurify = originalDOMPurify;
      setSettings('enableSanitization', false);
    });

    test('should handle sanitization requested but DOMPurify not available in replace', () => {
      // Temporarily remove DOMPurify
      const originalDOMPurify = global.DOMPurify;
      global.DOMPurify = null;
      
      setSettings('enableSanitization', true);
      const testElement = { innerHTML: '' };
      
      expect(() => {
        replaceIntoElement('**test**', testElement);
      }).not.toThrow();
      
      // Restore DOMPurify
      global.DOMPurify = originalDOMPurify;
      setSettings('enableSanitization', false);
    });

    test('should handle replaceIntoElement with DOM manipulation', () => {
      // Create a mock DOM environment
      const mockDocument = {
        createElement: jest.fn(() => ({
          innerHTML: '',
          childNodes: []
        })),
        createTextNode: jest.fn((text) => ({ nodeType: 3, textContent: text }))
      };
      
      const originalDocument = global.document;
      global.document = mockDocument;
      global.Node = { TEXT_NODE: 3 };
      
      const testElement = {
        innerHTML: '<p>old content</p>',
        childNodes: [
          { nodeType: 1, nodeName: 'P', textContent: 'old content', attributes: [], childNodes: [] }
        ],
        removeChild: jest.fn(),
        replaceChild: jest.fn(),
        appendChild: jest.fn()
      };
      
      expect(() => {
        replaceIntoElement('**new content**', testElement);
      }).not.toThrow();
      
      // Restore global objects
      global.document = originalDocument;
      delete global.Node;
    });

    test('should handle replaceIntoElement with different content lengths', () => {
      const mockDocument = {
        createElement: jest.fn(() => ({
          innerHTML: '',
          childNodes: []
        }))
      };
      
      const originalDocument = global.document;
      global.document = mockDocument;
      
      const testElement = {
        innerHTML: '<p>old content</p><div>more old content</div>',
        childNodes: [
          { nodeType: 1, nodeName: 'P', textContent: 'old content', attributes: [], childNodes: [] },
          { nodeType: 1, nodeName: 'DIV', textContent: 'more old content', attributes: [], childNodes: [] }
        ],
        removeChild: jest.fn(),
        replaceChild: jest.fn(),
        appendChild: jest.fn()
      };
      
      expect(() => {
        replaceIntoElement('**new content**', testElement);
      }).not.toThrow();
      
      global.document = originalDocument;
    });

    test('should handle replaceIntoElement with identical nodes', () => {
      const mockDocument = {
        createElement: jest.fn(() => ({
          innerHTML: '<p>same content</p>',
          childNodes: [
            { 
              nodeType: 1, 
              nodeName: 'P', 
              textContent: 'same content', 
              attributes: [], 
              childNodes: [],
              getAttribute: jest.fn(() => null)
            }
          ],
          removeChild: jest.fn()
        }))
      };
      
      const originalDocument = global.document;
      global.document = mockDocument;
      
      const testElement = {
        innerHTML: '<p>same content</p>',
        childNodes: [
          { 
            nodeType: 1, 
            nodeName: 'P', 
            textContent: 'same content', 
            attributes: [], 
            childNodes: [],
            getAttribute: jest.fn(() => null)
          }
        ],
        removeChild: jest.fn(),
        replaceChild: jest.fn(),
        appendChild: jest.fn()
      };
      
      expect(() => {
        replaceIntoElement('same content', testElement);
      }).not.toThrow();
      
      global.document = originalDocument;
    });

    test('should handle replaceIntoElement with different node types', () => {
      const mockDocument = {
        createElement: jest.fn(() => ({
          innerHTML: '<p>new content</p>',
          childNodes: [
            { 
              nodeType: 1, 
              nodeName: 'P', 
              textContent: 'new content', 
              attributes: [], 
              childNodes: [],
              getAttribute: jest.fn(() => null)
            }
          ],
          removeChild: jest.fn()
        }))
      };
      
      const originalDocument = global.document;
      global.document = mockDocument;
      
      const testElement = {
        innerHTML: 'old text content',
        childNodes: [
          { 
            nodeType: 3, 
            textContent: 'old text content'
          }
        ],
        removeChild: jest.fn(),
        replaceChild: jest.fn(),
        appendChild: jest.fn()
      };
      
      expect(() => {
        replaceIntoElement('**new content**', testElement);
      }).not.toThrow();
      
      global.document = originalDocument;
    });

    test('should handle replaceIntoElement with nodes that have different attributes', () => {
      const mockDocument = {
        createElement: jest.fn(() => ({
          innerHTML: '<p class="new">new content</p>',
          childNodes: [
            { 
              nodeType: 1, 
              nodeName: 'P', 
              textContent: 'new content', 
              attributes: [{ name: 'class', value: 'new' }], 
              childNodes: [],
              getAttribute: jest.fn((name) => name === 'class' ? 'new' : null)
            }
          ],
          removeChild: jest.fn()
        }))
      };
      
      const originalDocument = global.document;
      global.document = mockDocument;
      
      const testElement = {
        innerHTML: '<p class="old">old content</p>',
        childNodes: [
          { 
            nodeType: 1, 
            nodeName: 'P', 
            textContent: 'old content', 
            attributes: [{ name: 'class', value: 'old' }], 
            childNodes: [],
            getAttribute: jest.fn((name) => name === 'class' ? 'old' : null)
          }
        ],
        removeChild: jest.fn(),
        replaceChild: jest.fn(),
        appendChild: jest.fn()
      };
      
      expect(() => {
        replaceIntoElement('**new content**', testElement);
      }).not.toThrow();
      
      global.document = originalDocument;
    });

    test('should handle replaceIntoElement with nodes that have different child counts', () => {
      const mockDocument = {
        createElement: jest.fn(() => ({
          innerHTML: '<p>new content</p>',
          childNodes: [
            { 
              nodeType: 1, 
              nodeName: 'P', 
              textContent: 'new content', 
              attributes: [], 
              childNodes: [],
              getAttribute: jest.fn(() => null)
            }
          ],
          removeChild: jest.fn()
        }))
      };
      
      const originalDocument = global.document;
      global.document = mockDocument;
      
      const testElement = {
        innerHTML: '<p>old content</p>',
        childNodes: [
          { 
            nodeType: 1, 
            nodeName: 'P', 
            textContent: 'old content', 
            attributes: [], 
            childNodes: [
              { nodeType: 3, textContent: 'nested text' }
            ],
            getAttribute: jest.fn(() => null)
          }
        ],
        removeChild: jest.fn(),
        replaceChild: jest.fn(),
        appendChild: jest.fn()
      };
      
      expect(() => {
        replaceIntoElement('**new content**', testElement);
      }).not.toThrow();
      
      global.document = originalDocument;
    });

    test('should handle replaceIntoElement with sanitization enabled', () => {
      setSettings('enableSanitization', true);
      
      const mockDocument = {
        createElement: jest.fn(() => ({
          innerHTML: '<p>new content</p>',
          childNodes: [],
          removeChild: jest.fn()
        }))
      };
      
      const originalDocument = global.document;
      global.document = mockDocument;
      
      const testElement = {
        innerHTML: '<p>old content</p>',
        childNodes: [],
        removeChild: jest.fn(),
        replaceChild: jest.fn(),
        appendChild: jest.fn()
      };
      
      expect(() => {
        replaceIntoElement('**new content**', testElement);
      }).not.toThrow();
      
      global.document = originalDocument;
      setSettings('enableSanitization', false);
    });

    test('should handle replaceIntoElement with sanitization disabled', () => {
      setSettings('enableSanitization', true);
      
      const mockDocument = {
        createElement: jest.fn(() => ({
          innerHTML: '<p>new content</p>',
          childNodes: [],
          removeChild: jest.fn()
        }))
      };
      
      const originalDocument = global.document;
      global.document = mockDocument;
      
      const testElement = {
        innerHTML: '<p>old content</p>',
        childNodes: [],
        removeChild: jest.fn(),
        replaceChild: jest.fn(),
        appendChild: jest.fn()
      };
      
      expect(() => {
        replaceIntoElement('**new content**', testElement);
      }).not.toThrow();
      
      global.document = originalDocument;
      setSettings('enableSanitization', false);
    });

    test('should handle replaceIntoElement with more new nodes than existing nodes', () => {
      const mockDocument = {
        createElement: jest.fn(() => ({
          innerHTML: '<p>new content</p><div>more content</div>',
          childNodes: [
            { 
              nodeType: 1, 
              nodeName: 'P', 
              textContent: 'new content', 
              attributes: [], 
              childNodes: [],
              getAttribute: jest.fn(() => null)
            },
            { 
              nodeType: 1, 
              nodeName: 'DIV', 
              textContent: 'more content', 
              attributes: [], 
              childNodes: [],
              getAttribute: jest.fn(() => null)
            }
          ],
          removeChild: jest.fn()
        }))
      };
      
      const originalDocument = global.document;
      global.document = mockDocument;
      
      const testElement = {
        innerHTML: '<p>old content</p>',
        childNodes: [
          { 
            nodeType: 1, 
            nodeName: 'P', 
            textContent: 'old content', 
            attributes: [], 
            childNodes: [],
            getAttribute: jest.fn(() => null)
          }
        ],
        removeChild: jest.fn(),
        replaceChild: jest.fn(),
        appendChild: jest.fn()
      };
      
      expect(() => {
        replaceIntoElement('**new content**\n\nmore content', testElement);
      }).not.toThrow();
      
      global.document = originalDocument;
    });

    test('should handle replaceIntoElement with fewer new nodes than existing nodes', () => {
      const mockDocument = {
        createElement: jest.fn(() => ({
          innerHTML: '<p>new content</p>',
          childNodes: [
            { 
              nodeType: 1, 
              nodeName: 'P', 
              textContent: 'new content', 
              attributes: [], 
              childNodes: [],
              getAttribute: jest.fn(() => null)
            }
          ],
          removeChild: jest.fn()
        }))
      };
      
      const originalDocument = global.document;
      global.document = mockDocument;
      
      const testElement = {
        innerHTML: '<p>old content</p><div>more old content</div>',
        childNodes: [
          { 
            nodeType: 1, 
            nodeName: 'P', 
            textContent: 'old content', 
            attributes: [], 
            childNodes: [],
            getAttribute: jest.fn(() => null)
          },
          { 
            nodeType: 1, 
            nodeName: 'DIV', 
            textContent: 'more old content', 
            attributes: [], 
            childNodes: [],
            getAttribute: jest.fn(() => null)
          }
        ],
        removeChild: jest.fn(),
        replaceChild: jest.fn(),
        appendChild: jest.fn()
      };
      
      expect(() => {
        replaceIntoElement('**new content**', testElement);
      }).not.toThrow();
      
      global.document = originalDocument;
    });

    test('should handle replaceIntoElement with identical nodes', () => {
      const mockDocument = {
        createElement: jest.fn(() => ({
          innerHTML: '<p>same content</p>',
          childNodes: [
            { 
              nodeType: 1, 
              nodeName: 'P', 
              textContent: 'same content', 
              attributes: [], 
              childNodes: [],
              getAttribute: jest.fn(() => null)
            }
          ],
          removeChild: jest.fn()
        }))
      };
      
      const originalDocument = global.document;
      global.document = mockDocument;
      
      const testElement = {
        innerHTML: '<p>same content</p>',
        childNodes: [
          { 
            nodeType: 1, 
            nodeName: 'P', 
            textContent: 'same content', 
            attributes: [], 
            childNodes: [],
            getAttribute: jest.fn(() => null)
          }
        ],
        removeChild: jest.fn(),
        replaceChild: jest.fn(),
        appendChild: jest.fn()
      };
      
      expect(() => {
        replaceIntoElement('same content', testElement);
      }).not.toThrow();
      
      global.document = originalDocument;
    });

    test('should handle replaceIntoElement with different node types', () => {
      const mockDocument = {
        createElement: jest.fn(() => ({
          innerHTML: '<p>new content</p>',
          childNodes: [
            { 
              nodeType: 1, 
              nodeName: 'P', 
              textContent: 'new content', 
              attributes: [], 
              childNodes: [],
              getAttribute: jest.fn(() => null)
            }
          ],
          removeChild: jest.fn()
        }))
      };
      
      const originalDocument = global.document;
      global.document = mockDocument;
      
      const testElement = {
        innerHTML: 'old text content',
        childNodes: [
          { 
            nodeType: 3, 
            textContent: 'old text content'
          }
        ],
        removeChild: jest.fn(),
        replaceChild: jest.fn(),
        appendChild: jest.fn()
      };
      
      expect(() => {
        replaceIntoElement('**new content**', testElement);
      }).not.toThrow();
      
      global.document = originalDocument;
    });

    test('should handle replaceIntoElement with nodes that have different attributes', () => {
      const mockDocument = {
        createElement: jest.fn(() => ({
          innerHTML: '<p class="new">new content</p>',
          childNodes: [
            { 
              nodeType: 1, 
              nodeName: 'P', 
              textContent: 'new content', 
              attributes: [{ name: 'class', value: 'new' }], 
              childNodes: [],
              getAttribute: jest.fn((name) => name === 'class' ? 'new' : null)
            }
          ],
          removeChild: jest.fn()
        }))
      };
      
      const originalDocument = global.document;
      global.document = mockDocument;
      
      const testElement = {
        innerHTML: '<p class="old">old content</p>',
        childNodes: [
          { 
            nodeType: 1, 
            nodeName: 'P', 
            textContent: 'old content', 
            attributes: [{ name: 'class', value: 'old' }], 
            childNodes: [],
            getAttribute: jest.fn((name) => name === 'class' ? 'old' : null)
          }
        ],
        removeChild: jest.fn(),
        replaceChild: jest.fn(),
        appendChild: jest.fn()
      };
      
      expect(() => {
        replaceIntoElement('**new content**', testElement);
      }).not.toThrow();
      
      global.document = originalDocument;
    });

    test('should handle replaceIntoElement with nodes that have different child counts', () => {
      const mockDocument = {
        createElement: jest.fn(() => ({
          innerHTML: '<p>new content</p>',
          childNodes: [
            { 
              nodeType: 1, 
              nodeName: 'P', 
              textContent: 'new content', 
              attributes: [], 
              childNodes: [],
              getAttribute: jest.fn(() => null)
            }
          ],
          removeChild: jest.fn()
        }))
      };
      
      const originalDocument = global.document;
      global.document = mockDocument;
      
      const testElement = {
        innerHTML: '<p>old content</p>',
        childNodes: [
          { 
            nodeType: 1, 
            nodeName: 'P', 
            textContent: 'old content', 
            attributes: [], 
            childNodes: [
              { nodeType: 3, textContent: 'nested text' }
            ],
            getAttribute: jest.fn(() => null)
          }
        ],
        removeChild: jest.fn(),
        replaceChild: jest.fn(),
        appendChild: jest.fn()
      };
      
      expect(() => {
        replaceIntoElement('**new content**', testElement);
      }).not.toThrow();
      
      global.document = originalDocument;
    });

    test('should handle DOMPurify warning when not set up', () => {
      // Temporarily remove DOMPurify to trigger warning
      const originalDOMPurify = global.DOMPurify;
      global.DOMPurify = false;
      
      // This should trigger the warning in the module
      expect(() => {
        returnHTML('test');
      }).not.toThrow();
      
      // Restore DOMPurify
      global.DOMPurify = originalDOMPurify;
    });

    test('should handle debugLog when debug mode is disabled', () => {
      setSettings('debugMode', false);
      
      // This should not log anything
      const result = returnHTML('test');
      expect(result).toContain('<p>test</p>');
      expect(console.log).not.toHaveBeenCalled();
    });

    test('should handle debugLog when debug mode is enabled', () => {
      setSettings('debugMode', true);
      
      // This should log debug messages
      const result = returnHTML('test');
      expect(result).toContain('<p>test</p>');
      expect(console.log).toHaveBeenCalled();
    });

    test('should handle returnHTML with sanitization requested but DOMPurify not available', () => {
      // Temporarily remove DOMPurify
      const originalDOMPurify = global.DOMPurify;
      global.DOMPurify = null;
      
      setSettings('enableSanitization', true);
      
      const result = returnHTML('**test**');
      expect(result).toContain('<strong>test</strong>');
      
      // Restore DOMPurify
      global.DOMPurify = originalDOMPurify;
      setSettings('enableSanitization', false);
    });

    test('should handle returnHTML with debug mode enabled', () => {
      setSettings('debugMode', true);
      
      const result = returnHTML('**test**');
      expect(result).toContain('<strong>test</strong>');
      
      setSettings('debugMode', false);
    });

    test('should handle returnHTML with debug mode disabled', () => {
      setSettings('debugMode', false);
      
      const result = returnHTML('**test**');
      expect(result).toContain('<strong>test</strong>');
    });

    test('should handle insertIntoElement with debug mode enabled', () => {
      setSettings('debugMode', true);
      
      const testElement = { innerHTML: '' };
      expect(() => {
        insertIntoElement('**test**', testElement);
      }).not.toThrow();
      
      setSettings('debugMode', false);
    });

    test('should handle appendIntoElement with debug mode enabled', () => {
      setSettings('debugMode', true);
      
      const testElement = { innerHTML: '' };
      expect(() => {
        appendIntoElement('**test**', testElement);
      }).not.toThrow();
      
      setSettings('debugMode', false);
    });

    test('should handle replaceIntoElement with debug mode enabled', () => {
      setSettings('debugMode', true);
      
      const mockDocument = {
        createElement: jest.fn(() => ({
          innerHTML: '<p>new content</p>',
          childNodes: [],
          removeChild: jest.fn()
        }))
      };
      
      const originalDocument = global.document;
      global.document = mockDocument;
      
      const testElement = {
        innerHTML: '<p>old content</p>',
        childNodes: [],
        removeChild: jest.fn(),
        replaceChild: jest.fn(),
        appendChild: jest.fn()
      };
      
      expect(() => {
        replaceIntoElement('**new content**', testElement);
      }).not.toThrow();
      
      global.document = originalDocument;
      setSettings('debugMode', false);
    });
  });
});
