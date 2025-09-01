/**
 * CATTOWN TOKENS TO HTML MODULE TESTS
 * 
 * This test suite covers the HTML generation functionality
 * including conversion of various token types to HTML.
 */

import convertTokensToHTML from '../src/tokensToHTML.js';
import { getSettings, setSettings } from '../src/cattownConfig.js';

// Mock console methods to avoid noise in tests
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn
};

beforeEach(() => {
  // Suppress console output during tests
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
  
  // Reset settings to defaults
  setSettings('useCustomTheme', false);
  setSettings('LanguageNameInCode', true);
  setSettings('IconInCode', true);
});

afterEach(() => {
  // Restore console methods
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
});

describe('Cattown Tokens to HTML Module', () => {
  describe('Basic Token Conversion', () => {
    test('should convert paragraph tokens to HTML', () => {
      const tokens = [{
        megaType: 'paragraph',
        content: 'Simple text content'
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('<p');
      expect(html).toContain('Simple text content');
      expect(html).toContain('</p>');
    });

    test('should convert heading tokens to HTML', () => {
      const tokens = [{
        megaType: 'heading',
        level: 1,
        content: 'Main Heading'
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('<h1');
      expect(html).toContain('Main Heading');
      expect(html).toContain('</h1>');
    });

    test('should handle multiple tokens', () => {
      const tokens = [
        { megaType: 'heading', level: 1, content: 'Title' },
        { megaType: 'paragraph', content: 'Content' }
      ];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('<h1>Title</h1>');
      expect(html).toContain('<p>Content</p>');
    });

    test('should handle empty token array', () => {
      const html = convertTokensToHTML([]);
      expect(html).toBe('');
    });
  });

  describe('Heading Conversion', () => {
    test('should convert all heading levels', () => {
      const tokens = [
        { megaType: 'heading', level: 1, content: 'H1' },
        { megaType: 'heading', level: 2, content: 'H2' },
        { megaType: 'heading', level: 3, content: 'H3' },
        { megaType: 'heading', level: 4, content: 'H4' },
        { megaType: 'heading', level: 5, content: 'H5' },
        { megaType: 'heading', level: 6, content: 'H6' }
      ];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('<h1>H1</h1>');
      expect(html).toContain('<h2>H2</h2>');
      expect(html).toContain('<h3>H3</h3>');
      expect(html).toContain('<h4>H4</h4>');
      expect(html).toContain('<h5>H5</h5>');
      expect(html).toContain('<h6>H6</h6>');
    });

    test('should add custom theme classes when enabled', () => {
      setSettings('useCustomTheme', true);
      
      const tokens = [{
        megaType: 'heading',
        level: 1,
        content: 'Heading'
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('class="ct-parsed heading heading-1"');
    });

    test('should not add custom theme classes when disabled', () => {
      setSettings('useCustomTheme', false);
      
      const tokens = [{
        megaType: 'heading',
        level: 1,
        content: 'Heading'
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).not.toContain('class="ct-parsed');
      expect(html).toContain('<h1>Heading</h1>');
    });
  });

  describe('List Conversion', () => {
    test('should convert unordered lists', () => {
      const tokens = [{
        megaType: 'list',
        ordered: false,
        items: [
          { content: 'Item 1' },
          { content: 'Item 2' }
        ]
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('<ul>');
      expect(html).toContain('<li>Item 1</li>');
      expect(html).toContain('<li>Item 2</li>');
      expect(html).toContain('</ul>');
    });

    test('should convert ordered lists', () => {
      const tokens = [{
        megaType: 'list',
        ordered: true,
        items: [
          { content: 'First' },
          { content: 'Second' }
        ]
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('<ol>');
      expect(html).toContain('<li>First</li>');
      expect(html).toContain('<li>Second</li>');
      expect(html).toContain('</ol>');
    });

    test('should handle nested lists', () => {
      const tokens = [{
        megaType: 'list',
        ordered: false,
        items: [
          { content: 'Parent', children: [
            { content: 'Child 1' },
            { content: 'Child 2' }
          ]}
        ]
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('<ul>');
      expect(html).toContain('<li>Parent');
      expect(html).toContain('<ul>');
      expect(html).toContain('<li>Child 1</li>');
      expect(html).toContain('<li>Child 2</li>');
    });

    test('should handle task lists', () => {
      const tokens = [{
        megaType: 'list',
        ordered: false,
        items: [
          { content: 'Task 1', checked: false },
          { content: 'Task 2', checked: true }
        ]
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('type="checkbox"');
      expect(html).toContain('checked');
    });
  });

  describe('Code Block Conversion', () => {
    test('should convert code blocks with language', () => {
      const tokens = [{
        megaType: 'codeBlock',
        language: 'javascript',
        content: 'console.log("test");'
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('<pre>');
      expect(html).toContain('<code>');
      expect(html).toContain('console.log(&quot;test&quot;);');
    });

    test('should show language name when enabled', () => {
      setSettings('LanguageNameInCode', true);
      
      const tokens = [{
        megaType: 'codeBlock',
        language: 'javascript',
        content: 'console.log("test");'
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('javascript');
    });

    test('should not show language name when disabled', () => {
      setSettings('LanguageNameInCode', false);
      
      const tokens = [{
        megaType: 'codeBlock',
        language: 'javascript',
        content: 'console.log("test");'
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).not.toContain('javascript');
    });

    test('should show language icon when enabled', () => {
      setSettings('IconInCode', true);
      
      const tokens = [{
        megaType: 'codeBlock',
        language: 'javascript',
        content: 'console.log("test");'
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('devicon');
    });

    test('should not show language icon when disabled', () => {
      setSettings('IconInCode', false);
      
      const tokens = [{
        megaType: 'codeBlock',
        language: 'javascript',
        content: 'console.log("test");'
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).not.toContain('devicon');
    });

    test('should include fallback icon when icon is enabled', () => {
      setSettings('IconInCode', true);
      setSettings('LanguageNameInCode', true);
      
      const tokens = [{
        megaType: 'codeBlock',
        language: 'javascript',
        content: 'console.log("test");'
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('💻');
      expect(html).toContain('onerror');
      expect(html).toContain('display:none');
    });

    test('should include fallback icon when only icon is enabled (no language name)', () => {
      setSettings('IconInCode', true);
      setSettings('LanguageNameInCode', false);
      
      const tokens = [{
        megaType: 'codeBlock',
        language: 'javascript',
        content: 'console.log("test");'
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('💻');
      expect(html).toContain('onerror');
      expect(html).toContain('display:none');
    });
  });

  describe('Table Conversion', () => {
    test('should convert simple tables', () => {
      const tokens = [{
        megaType: 'table',
        headers: ['Header 1', 'Header 2'],
        rows: [
          ['Cell 1', 'Cell 2'],
          ['Cell 3', 'Cell 4']
        ]
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('<table>');
      expect(html).toContain('<thead>');
      expect(html).toContain('<th>Header 1</th>');
      expect(html).toContain('<tbody>');
      expect(html).toContain('<td>Cell 1</td>');
    });

    test('should handle tables without headers', () => {
      const tokens = [{
        megaType: 'table',
        headers: [],
        rows: [
          ['Cell 1', 'Cell 2'],
          ['Cell 3', 'Cell 4']
        ]
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('<table>');
      expect(html).not.toContain('<thead>');
      expect(html).toContain('<tbody>');
    });
  });

  describe('Blockquote Conversion', () => {
    test('should convert blockquotes', () => {
      const tokens = [{
        megaType: 'blockquote',
        content: 'This is a quote'
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('<blockquote>');
      expect(html).toContain('This is a quote');
      expect(html).toContain('</blockquote>');
    });

    test('should handle nested blockquotes', () => {
      const tokens = [{
        megaType: 'blockquote',
        content: 'Outer quote',
        children: [{
          megaType: 'blockquote',
          content: 'Inner quote'
        }]
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('<blockquote>');
      expect(html).toContain('Outer quote');
      expect(html).toContain('Inner quote');
    });
  });

  describe('Horizontal Rule Conversion', () => {
    test('should convert horizontal rules', () => {
      const tokens = [{
        megaType: 'horizontalRule'
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('<hr>');
    });
  });

  describe('Inline Formatting', () => {
    test('should convert bold text', () => {
      const tokens = [{
        megaType: 'paragraph',
        content: [{
          type: 'bold',
          content: 'bold text'
        }]
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('<strong>bold text</strong>');
    });

    test('should convert italic text', () => {
      const tokens = [{
        megaType: 'paragraph',
        content: [{
          type: 'italic',
          content: 'italic text'
        }]
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('<em>italic text</em>');
    });

    test('should convert strikethrough text', () => {
      const tokens = [{
        megaType: 'paragraph',
        content: [{
          type: 'strikethrough',
          content: 'strikethrough text'
        }]
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('<del>strikethrough text</del>');
    });

    test('should convert inline code', () => {
      const tokens = [{
        megaType: 'paragraph',
        content: [{
          type: 'code',
          content: 'code text'
        }]
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('<code>code text</code>');
    });

    test('should convert bold italic text', () => {
      const tokens = [{
        megaType: 'paragraph',
        content: [{
          type: 'boldItalic',
          content: 'bold italic text'
        }]
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('<strong><em>bold italic text</em></strong>');
    });

    test('should convert subscript text', () => {
      const tokens = [{
        megaType: 'paragraph',
        content: [{
          type: 'subscript',
          content: 'subscript text'
        }]
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('<sub>subscript text</sub>');
    });

    test('should convert superscript text', () => {
      const tokens = [{
        megaType: 'paragraph',
        content: [{
          type: 'superscript',
          content: 'superscript text'
        }]
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('<sup>superscript text</sup>');
    });

    test('should convert highlight text', () => {
      const tokens = [{
        megaType: 'paragraph',
        content: [{
          type: 'highlight',
          content: 'highlighted text'
        }]
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('<mark>highlighted text</mark>');
    });

    test('should convert links', () => {
      const tokens = [{
        megaType: 'paragraph',
        content: [{
          type: 'link',
          text: 'Link text',
          url: 'https://example.com'
        }]
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('<a href="https://example.com">Link text</a>');
    });

    test('should convert links with href property', () => {
      const tokens = [{
        megaType: 'paragraph',
        content: [{
          type: 'link',
          content: 'Link text',
          href: 'https://example.com'
        }]
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('<a href="https://example.com">Link text</a>');
    });

    test('should add https:// to links without protocol', () => {
      const tokens = [{
        megaType: 'paragraph',
        content: [{
          type: 'link',
          text: 'Link text',
          url: 'example.com'
        }]
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('<a href="https://example.com">Link text</a>');
    });

    test('should handle links with both href and url properties', () => {
      const tokens = [{
        megaType: 'paragraph',
        content: [{
          type: 'link',
          text: 'Link text',
          href: 'https://href.com',
          url: 'https://url.com'
        }]
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('<a href="https://href.com">Link text</a>');
    });

    test('should convert images', () => {
      const tokens = [{
        megaType: 'paragraph',
        content: [{
          type: 'image',
          alt: 'Alt text',
          src: 'image.jpg'
        }]
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('<img src="image.jpg" alt="Alt text"');
    });

    test('should handle images with empty src and alt', () => {
      const tokens = [{
        megaType: 'paragraph',
        content: [{
          type: 'image',
          alt: '',
          src: ''
        }]
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('<img src="" alt=""');
    });

    test('should handle null/undefined tokens gracefully', () => {
      const tokens = [{
        megaType: 'paragraph',
        content: [null, undefined, { type: 'text', content: 'valid text' }]
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('valid text');
      expect(html).not.toContain('null');
      expect(html).not.toContain('undefined');
    });

    test('should handle non-object tokens gracefully', () => {
      const tokens = [{
        megaType: 'paragraph',
        content: ['string token', 123, { type: 'text', content: 'valid text' }]
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('valid text');
    });

    test('should handle default case for unknown token types', () => {
      const tokens = [{
        megaType: 'paragraph',
        content: [{
          type: 'unknownType',
          content: 'unknown content'
        }]
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('unknown content');
    });

    test('should handle default case with nested tokens', () => {
      const tokens = [{
        megaType: 'paragraph',
        content: [{
          type: 'unknownType',
          content: [{ type: 'text', content: 'nested content' }]
        }]
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('nested content');
    });
  });

  describe('Complex Content', () => {
    test('should handle nested lists with children property', () => {
      const tokens = [{
        megaType: 'list',
        ordered: false,
        items: [{
          content: 'Item 1',
          children: [{
            content: 'Nested item'
          }]
        }]
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('Nested item');
    });

    test('should handle lists with empty items array', () => {
      const tokens = [{
        megaType: 'list',
        ordered: false,
        items: []
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('<ul>');
      expect(html).toContain('</ul>');
    });

    test('should handle lists with undefined items', () => {
      const tokens = [{
        megaType: 'list',
        ordered: false
        // items is undefined
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('<ul>');
      expect(html).toContain('</ul>');
    });

    test('should handle tasklist with undefined items', () => {
      const tokens = [{
        megaType: 'tasklist'
        // items is undefined
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('<ul');
      expect(html).toContain('</ul>');
    });

    test('should handle code blocks without language', () => {
      const tokens = [{
        megaType: 'codeBlock',
        content: 'console.log("test");'
        // language is undefined
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('<pre>');
      expect(html).toContain('<code>');
      expect(html).toContain('console.log(&quot;test&quot;);');
    });

    test('should handle code blocks with empty language string', () => {
      const tokens = [{
        megaType: 'codeBlock',
        language: '',
        content: 'console.log("test");'
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('<pre>');
      expect(html).toContain('<code>');
      expect(html).not.toContain('💻');
      expect(html).not.toContain('onerror');
    });

    test('should handle code blocks with language but no icon or name', () => {
      setSettings('IconInCode', false);
      setSettings('LanguageNameInCode', false);
      
      const tokens = [{
        megaType: 'codeBlock',
        language: 'javascript',
        content: 'console.log("test");'
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('<pre>');
      expect(html).toContain('<code>');
      expect(html).not.toContain('💻');
      expect(html).not.toContain('onerror');
      expect(html).not.toContain('javascript');
    });

    test('should handle escapeHTML with unknown characters', () => {
      const tokens = [{
        megaType: 'paragraph',
        content: 'Text with @#$% characters'
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('Text with @#$% characters');
    });

    test('should handle escapeHTML with mixed special and regular characters', () => {
      const tokens = [{
        megaType: 'paragraph',
        content: 'Text with <script>&"\'@#$% characters'
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('&lt;script&gt;');
      expect(html).toContain('&amp;');
      expect(html).toContain('&quot;');
      expect(html).toContain('&#39;');
      expect(html).toContain('@#$%');
    });

    test('should handle escapeHTML with only regular characters', () => {
      const tokens = [{
        megaType: 'paragraph',
        content: 'Text with @#$% characters only'
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('Text with @#$% characters only');
    });

    test('should handle escapeHTML with empty string', () => {
      const tokens = [{
        megaType: 'paragraph',
        content: ''
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toBe('<p></p>');
    });

    test('should handle escapeHTML with null content', () => {
      const tokens = [{
        megaType: 'paragraph',
        content: null
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toBe('<p></p>');
    });

    test('should handle nested inline formatting', () => {
      const tokens = [{
        megaType: 'paragraph',
        content: [{
          type: 'bold',
          content: [{
            type: 'italic',
            content: 'bold italic text'
          }]
        }]
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('<strong><em>bold italic text</em></strong>');
    });

    test('should handle mixed content types', () => {
      const tokens = [
        { megaType: 'heading', level: 1, content: 'Title' },
        { megaType: 'paragraph', content: 'Text with **bold**' },
        { megaType: 'list', ordered: false, items: [{ content: 'Item' }] },
        { megaType: 'codeBlock', language: 'javascript', content: 'console.log();' },
        { megaType: 'blockquote', content: 'Quote' },
        { megaType: 'table', headers: ['H'], rows: [['C']] },
        { megaType: 'horizontalRule' }
      ];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('<h1>Title</h1>');
      expect(html).toContain('<p>Text with');
      expect(html).toContain('<ul>');
      expect(html).toContain('<pre>');
      expect(html).toContain('<blockquote>');
      expect(html).toContain('<table>');
      expect(html).toContain('<hr>');
    });
  });

  describe('Error Handling', () => {
    test('should handle null/undefined input gracefully', () => {
      expect(convertTokensToHTML(null)).toBe('');
      expect(convertTokensToHTML(undefined)).toBe('');
    });

    test('should handle empty array input gracefully', () => {
      expect(convertTokensToHTML([])).toBe('');
    });

    test('should handle non-array input gracefully', () => {
      expect(convertTokensToHTML('string')).toBe('');
      expect(convertTokensToHTML(123)).toBe('');
      expect(convertTokensToHTML({})).toBe('');
    });

    test('should handle tokens with null/undefined content gracefully', () => {
      const tokens = [
        { megaType: 'paragraph', content: null },
        { megaType: 'paragraph', content: undefined },
        { megaType: 'paragraph', content: 'valid content' }
      ];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('valid content');
    });

    test('should handle tokens with empty content gracefully', () => {
      const tokens = [
        { megaType: 'paragraph', content: '' },
        { megaType: 'paragraph', content: 'valid content' }
      ];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('valid content');
    });

    test('should handle tokens with numeric content gracefully', () => {
      const tokens = [
        { megaType: 'paragraph', content: 123 },
        { megaType: 'paragraph', content: 'valid content' }
      ];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('valid content');
    });

    test('should handle null/undefined tokens in main function', () => {
      const tokens = [
        null,
        undefined,
        { megaType: 'paragraph', content: 'valid content' }
      ];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('valid content');
    });

    test('should handle non-object tokens in main function', () => {
      const tokens = [
        'string token',
        123,
        { megaType: 'paragraph', content: 'valid content' }
      ];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('valid content');
    });

    test('should handle unknown token types gracefully', () => {
      const tokens = [{
        megaType: 'unknownType',
        content: 'test'
      }];
      
      const html = convertTokensToHTML(tokens);
      // Should not throw and should return some HTML
      expect(typeof html).toBe('string');
    });

    test('should handle malformed tokens', () => {
      const tokens = [{
        megaType: 'paragraph',
        content: null
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(typeof html).toBe('string');
    });

    test('should handle missing properties', () => {
      const tokens = [{
        megaType: 'heading'
        // Missing level and content
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(typeof html).toBe('string');
    });
  });

  describe('HTML Escaping', () => {
    test('should escape HTML special characters', () => {
      const tokens = [{
        megaType: 'paragraph',
        content: '<script>alert("xss")</script> & <strong>text</strong>'
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toContain('&lt;script&gt;');
      expect(html).toContain('&quot;xss&quot;');
      expect(html).toContain('&amp;');
      expect(html).toContain('&lt;strong&gt;');
    });

    test('should handle non-string content in escapeHTML', () => {
      const tokens = [{
        megaType: 'paragraph',
        content: [{
          type: 'text',
          content: null
        }]
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toBe('<p>null</p>');
    });

    test('should handle empty string content in escapeHTML', () => {
      const tokens = [{
        megaType: 'paragraph',
        content: [{
          type: 'text',
          content: ''
        }]
      }];
      
      const html = convertTokensToHTML(tokens);
      expect(html).toBe('<p></p>');
    });
  });

  describe('Performance', () => {
    test('should handle large token arrays efficiently', () => {
      const tokens = Array(1000).fill().map((_, i) => ({
        megaType: 'paragraph',
        content: `Paragraph ${i}`
      }));
      
      const startTime = Date.now();
      const html = convertTokensToHTML(tokens);
      const endTime = Date.now();
      
      expect(html.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should handle deep nesting efficiently', () => {
      let token = { megaType: 'paragraph', content: 'Deep content' };
      
      // Create deeply nested structure
      for (let i = 0; i < 100; i++) {
        token = { megaType: 'blockquote', content: token };
      }
      
      const startTime = Date.now();
      const html = convertTokensToHTML([token]);
      const endTime = Date.now();
      
      expect(html.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});

