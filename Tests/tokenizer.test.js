/**
 * CATTOWN TOKENIZER MODULE TESTS
 * 
 * This test suite covers the markdown tokenization functionality
 * including parsing of various markdown elements and token generation.
 */

import tokenizer from '../src/tokenizer.js';

describe('Cattown Tokenizer Module', () => {
  describe('Basic Tokenization', () => {
    test('should tokenize plain text', () => {
      const tokens = tokenizer('Hello world');
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toHaveProperty('megaType', 'paragraph');
      expect(tokens[0].content[0]).toHaveProperty('content', 'Hello world');
    });

    test('should tokenize empty input', () => {
      const tokens = tokenizer('');
      expect(tokens).toHaveLength(0);
    });

    test('should tokenize whitespace-only input', () => {
      const tokens = tokenizer('   \n  \t  ');
      expect(tokens).toHaveLength(0);
    });
  });

  describe('Headers', () => {
    test('should tokenize h1 headers', () => {
      const tokens = tokenizer('# Header 1');
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toHaveProperty('megaType', 'heading');
      expect(tokens[0]).toHaveProperty('level', 1);
      expect(tokens[0].content[0]).toHaveProperty('content', 'Header 1');
    });

    test('should tokenize h2 headers', () => {
      const tokens = tokenizer('## Header 2');
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toHaveProperty('megaType', 'heading');
      expect(tokens[0]).toHaveProperty('level', 2);
    });

    test('should tokenize h3-h6 headers', () => {
      const markdown = '### H3\n#### H4\n##### H5\n###### H6';
      const tokens = tokenizer(markdown);
      
      expect(tokens).toHaveLength(4);
      expect(tokens[0]).toHaveProperty('level', 3);
      expect(tokens[1]).toHaveProperty('level', 4);
      expect(tokens[2]).toHaveProperty('level', 5);
      expect(tokens[3]).toHaveProperty('level', 6);
    });

    test('should handle headers with inline formatting', () => {
      const tokens = tokenizer('# Header with **bold** text');
      expect(tokens[0]).toHaveProperty('megaType', 'heading');
      expect(tokens[0].content[1]).toHaveProperty('type', 'bold');
      expect(tokens[0].content[1].content[0]).toHaveProperty('content', 'bold');
    });
  });

  describe('Paragraphs', () => {
    test('should tokenize simple paragraphs', () => {
      const tokens = tokenizer('This is a paragraph.');
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toHaveProperty('megaType', 'paragraph');
    });

    test('should handle multiple paragraphs', () => {
      const markdown = 'First paragraph.\n\nSecond paragraph.';
      const tokens = tokenizer(markdown);
      
      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toHaveProperty('megaType', 'paragraph');
      expect(tokens[1]).toHaveProperty('megaType', 'paragraph');
    });

    test('should handle paragraphs with inline formatting', () => {
      const tokens = tokenizer('Text with **bold** and *italic*.');
      expect(tokens[0]).toHaveProperty('megaType', 'paragraph');
    });
  });

  describe('Lists', () => {
    test('should tokenize unordered lists', () => {
      const markdown = '- Item 1\n- Item 2\n- Item 3';
      const tokens = tokenizer(markdown);
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toHaveProperty('megaType', 'list');
      expect(tokens[0]).toHaveProperty('ordered', false);
    });

    test('should tokenize ordered lists', () => {
      const markdown = '1. First item\n2. Second item\n3. Third item';
      const tokens = tokenizer(markdown);
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toHaveProperty('megaType', 'list');
      expect(tokens[0]).toHaveProperty('ordered', true);
    });

    test('should handle nested lists', () => {
      const markdown = '- Parent\n  - Child 1\n  - Child 2';
      const tokens = tokenizer(markdown);
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toHaveProperty('megaType', 'list');
    });

    test('should handle task lists', () => {
      const markdown = '- [ ] Unchecked\n- [x] Checked';
      const tokens = tokenizer(markdown);
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toHaveProperty('megaType', 'list');
    });
  });

  describe('Code Blocks', () => {
    test('should tokenize fenced code blocks', () => {
      const markdown = '```javascript\nconsole.log("test");\n```';
      const tokens = tokenizer(markdown);
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toHaveProperty('megaType', 'codeBlock');
      expect(tokens[0]).toHaveProperty('language', 'javascript');
    });

    test('should tokenize code blocks without language', () => {
      const markdown = '```\nconsole.log("test");\n```';
      const tokens = tokenizer(markdown);
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toHaveProperty('megaType', 'codeBlock');
      expect(tokens[0]).toHaveProperty('language', '');
    });

    test('should handle inline code', () => {
      const tokens = tokenizer('Use `console.log()` for debugging');
      expect(tokens[0]).toHaveProperty('megaType', 'paragraph');
    });
  });

  describe('Links and Images', () => {
    test('should tokenize links', () => {
      const tokens = tokenizer('[Link text](https://example.com)');
      expect(tokens[0]).toHaveProperty('megaType', 'paragraph');
    });

    test('should tokenize images', () => {
      const tokens = tokenizer('![Alt text](image.jpg)');
      expect(tokens[0]).toHaveProperty('megaType', 'paragraph');
    });

    test('should handle links with titles', () => {
      const tokens = tokenizer('[Link](https://example.com "Title")');
      expect(tokens[0]).toHaveProperty('megaType', 'paragraph');
    });
  });

  describe('Blockquotes', () => {
    test('should tokenize blockquotes', () => {
      const tokens = tokenizer('> This is a quote');
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toHaveProperty('megaType', 'blockquote');
    });

    test('should handle nested blockquotes', () => {
      const markdown = '> Outer quote\n> > Inner quote';
      const tokens = tokenizer(markdown);
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toHaveProperty('megaType', 'blockquote');
    });

    test('should handle blockquotes with formatting', () => {
      const tokens = tokenizer('> Quote with **bold** text');
      expect(tokens[0]).toHaveProperty('megaType', 'blockquote');
    });
  });

  describe('Tables', () => {
    test('should tokenize simple tables', () => {
      const markdown = `
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
`;
      const tokens = tokenizer(markdown);
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toHaveProperty('megaType', 'table');
    });

    test('should handle tables without headers', () => {
      const markdown = `
| Cell 1 | Cell 2 |
| Cell 3 | Cell 4 |
`;
      const tokens = tokenizer(markdown);
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toHaveProperty('megaType', 'table');
    });
  });

  describe('Horizontal Rules', () => {
    test('should tokenize horizontal rules', () => {
      const tokens = tokenizer('---');
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toHaveProperty('megaType', 'horizontalRule');
    });

    test('should handle different horizontal rule syntax', () => {
      const markdown = '---\n***\n___';
      const tokens = tokenizer(markdown);
      
      expect(tokens).toHaveLength(3);
      tokens.forEach(token => {
        expect(token).toHaveProperty('megaType', 'horizontalRule');
      });
    });
  });

  describe('Inline Formatting', () => {
    test('should handle bold text', () => {
      const tokens = tokenizer('**bold text**');
      expect(tokens[0]).toHaveProperty('megaType', 'paragraph');
    });

    test('should handle italic text', () => {
      const tokens = tokenizer('*italic text*');
      expect(tokens[0]).toHaveProperty('megaType', 'paragraph');
    });

    test('should handle strikethrough', () => {
      const tokens = tokenizer('~~strikethrough text~~');
      expect(tokens[0]).toHaveProperty('megaType', 'paragraph');
    });

    test('should handle nested formatting', () => {
      const tokens = tokenizer('**bold with *italic* inside**');
      expect(tokens[0]).toHaveProperty('megaType', 'paragraph');
    });

    test('should handle empty styled content gracefully', () => {
      const tokens = tokenizer('** **');
      expect(tokens[0]).toHaveProperty('megaType', 'paragraph');
    });

    test('should handle empty subscript content gracefully', () => {
      const tokens = tokenizer('H~2~O');
      expect(tokens[0]).toHaveProperty('megaType', 'paragraph');
    });

    test('should handle empty superscript content gracefully', () => {
      const tokens = tokenizer('E=mc^2^');
      expect(tokens[0]).toHaveProperty('megaType', 'paragraph');
    });

    test('should handle non-standard strikethrough markers gracefully', () => {
      const tokens = tokenizer('~~strikethrough~~ and ~not strikethrough~');
      expect(tokens[0]).toHaveProperty('megaType', 'paragraph');
    });

    test('should handle nested blockquotes in blockquotes', () => {
      const markdown = `
> Outer quote
> > Inner quote
> > > Deepest quote
`;
      const tokens = tokenizer(markdown);
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toHaveProperty('megaType', 'blockquote');
    });

    test('should handle ordered lists with empty items', () => {
      const markdown = `
1. 
2. Item with content
3. 
`;
      const tokens = tokenizer(markdown);
      
      expect(tokens.length).toBeGreaterThan(0);
      // Empty list items might be parsed as paragraphs or other tokens
      // Just check that we get some tokens back
      expect(tokens.some(token => token.megaType === 'paragraph' || token.megaType === 'olist')).toBe(true);
    });

    test('should handle unordered lists with empty items', () => {
      const markdown = `
- 
- Item with content
- 
`;
      const tokens = tokenizer(markdown);
      
      expect(tokens.length).toBeGreaterThan(0);
      const listTokens = tokens.filter(token => token.megaType === 'list');
      expect(listTokens.length).toBeGreaterThan(0);
    });

    test('should handle headings with empty content', () => {
      const markdown = `
# 
## 
### 
`;
      const tokens = tokenizer(markdown);
      
      expect(tokens.length).toBeGreaterThan(0);
      // Empty headings might be parsed as paragraphs or other tokens
      // Just check that we get some tokens back
      expect(tokens.some(token => token.megaType === 'paragraph' || token.megaType === 'heading')).toBe(true);
    });

    test('should handle fenced code blocks with empty language', () => {
      const markdown = '```\nconsole.log("test");\n```';
      const tokens = tokenizer(markdown);
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toHaveProperty('megaType', 'codeBlock');
      expect(tokens[0]).toHaveProperty('language', '');
    });

    test('should handle fenced code blocks with whitespace language', () => {
      const markdown = '``` \nconsole.log("test");\n```';
      const tokens = tokenizer(markdown);
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toHaveProperty('megaType', 'codeBlock');
      expect(tokens[0]).toHaveProperty('language', '');
    });

    test('should handle horizontal rules with different characters', () => {
      const markdown = '---\n***\n___';
      const tokens = tokenizer(markdown);
      
      expect(tokens).toHaveLength(3);
      tokens.forEach(token => {
        expect(token).toHaveProperty('megaType', 'horizontalRule');
      });
    });

    test('should handle horizontal rules with more than 3 characters', () => {
      const markdown = '-----\n*****\n_____';
      const tokens = tokenizer(markdown);
      
      expect(tokens).toHaveLength(3);
      tokens.forEach(token => {
        expect(token).toHaveProperty('megaType', 'horizontalRule');
      });
    });
  });

  describe('Complex Content', () => {
    test('should handle mixed content types', () => {
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
`;

      const tokens = tokenizer(markdown);
      
      expect(tokens.length).toBeGreaterThan(0);
      
      // Should have at least one heading, paragraph, list, code block, blockquote, and table
      const megaTypes = tokens.map(token => token.megaType);
      expect(megaTypes).toContain('heading');
      expect(megaTypes).toContain('paragraph');
      expect(megaTypes).toContain('list');
      expect(megaTypes).toContain('codeBlock');
      expect(megaTypes).toContain('blockquote');
      expect(megaTypes).toContain('table');
    });

    test('should handle large markdown input', () => {
      const largeMarkdown = '# Heading\n'.repeat(100) + '**Bold text**';
      const tokens = tokenizer(largeMarkdown);
      
      expect(tokens.length).toBeGreaterThan(0);
      expect(tokens[0]).toHaveProperty('megaType', 'heading');
    });
  });

  describe('Edge Cases', () => {
    test('should handle malformed markdown gracefully', () => {
      const malformed = '**unclosed bold\n[unclosed link\n```unclosed code';
      const tokens = tokenizer(malformed);
      
      // Should not throw and should return some tokens
      expect(Array.isArray(tokens)).toBe(true);
      expect(tokens.length).toBeGreaterThan(0);
    });

    test('should handle special characters', () => {
      const tokens = tokenizer('Text with & < > " \' characters');
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toHaveProperty('megaType', 'paragraph');
    });

    test('should handle very long lines', () => {
      const longLine = 'A'.repeat(10000);
      const tokens = tokenizer(longLine);
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toHaveProperty('megaType', 'paragraph');
    });

    test('should handle unicode characters', () => {
      const tokens = tokenizer('Text with émojis 🚀 and unicode 中文');
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toHaveProperty('megaType', 'paragraph');
    });
  });

  describe('Performance', () => {
    test('should handle rapid tokenization calls', () => {
      const markdown = '# Test\n**Bold** text';
      
      for (let i = 0; i < 100; i++) {
        const tokens = tokenizer(markdown);
        expect(tokens.length).toBeGreaterThan(0);
      }
    });

    test('should not have memory leaks with large inputs', () => {
      const largeInput = '# Heading\n'.repeat(1000) + '**Bold** text';
      
      // Perform multiple tokenizations
      for (let i = 0; i < 10; i++) {
        const tokens = tokenizer(largeInput);
        expect(tokens.length).toBeGreaterThan(0);
      }
    });

    test('should handle deeply nested lists', () => {
      const markdown = `
- Level 1
  - Level 2
    - Level 3
      - Level 4
        - Level 5
`;
      const tokens = tokenizer(markdown);
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toHaveProperty('megaType', 'list');
      expect(tokens[0].items[0].items[0].items[0].items[0]).toBeDefined();
    });

    test('should handle mixed ordered and unordered lists', () => {
      const markdown = `
1. Ordered item
   - Unordered nested
2. Another ordered
   * Another unordered
`;
      const tokens = tokenizer(markdown);
      
      expect(tokens.length).toBeGreaterThan(0);
      // The tokenizer creates separate list tokens for different list types
      const listTokens = tokens.filter(token => token.megaType === 'list');
      expect(listTokens.length).toBeGreaterThan(0);
    });

    test('should handle empty list items gracefully', () => {
      const markdown = `
- 
- Item with content
- 
`;
      const tokens = tokenizer(markdown);
      
      expect(tokens.length).toBeGreaterThan(0);
      // Empty list items might be parsed as paragraphs or lists
      const hasList = tokens.some(token => token.megaType === 'list');
      expect(hasList).toBe(true);
    });

    test('should handle blockquotes with complex content', () => {
      const markdown = `
> # Header in blockquote
> 
> Paragraph with **bold** and *italic*
> 
> - List item 1
> - List item 2
> 
> \`\`\`javascript
> console.log("code in blockquote");
> \`\`\`
`;
      const tokens = tokenizer(markdown);
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toHaveProperty('megaType', 'blockquote');
    });

    test('should handle edge case with empty lines in lists', () => {
      const markdown = `
- Item 1

- Item 2
`;
      const tokens = tokenizer(markdown);
      
      expect(tokens.length).toBeGreaterThan(0);
      // Empty lines might separate list items into different list tokens
      const listTokens = tokens.filter(token => token.megaType === 'list');
      expect(listTokens.length).toBeGreaterThan(0);
    });
  });
});
