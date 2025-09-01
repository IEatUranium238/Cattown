/**
 * CATTOWN TOKENS-TO-HTML CONVERTER
 *
 * This module converts the structured token objects produced by the tokenizer
 * into clean, semantic HTML. It handles both block-level elements (paragraphs,
 * headings, lists, tables, code blocks) and inline elements (bold, italic,
 * links, images, etc.).
 *
 * Features:
 * - Comprehensive HTML generation for all markdown elements
 * - Configurable CSS class application for custom styling
 * - Built-in HTML escaping for security
 * - Language icon support for code blocks
 * - Responsive table containers
 * - Semantic HTML structure
 *
 * The converter respects configuration settings to control:
 * - Whether custom CSS classes are applied
 * - Code block language display options
 * - Icon display in code blocks
 */

import getSettings from "./cattownConfig";

/**
 * Converts structured markdown tokens into clean, semantic HTML.
 *
 * This is the second stage of the markdown conversion pipeline (after tokenization).
 * It transforms the abstract syntax tree of tokens into actual HTML elements,
 * applying appropriate tags, attributes, and CSS classes based on configuration.
 *
 * The function handles:
 * - Block elements: headers, paragraphs, lists, tables, code blocks, blockquotes
 * - Inline elements: bold, italic, links, images, code spans, strikethrough
 * - Security: HTML escaping to prevent injection attacks
 * - Styling: Configurable CSS class application
 * - Accessibility: Semantic HTML structure and proper attributes
 *
 * @param {Array} tokens - Array of parsed token objects from the tokenizer.
 *   Each token has a 'megaType' (for blocks) or 'type' (for inline) property
 *   and associated content/configuration properties.
 *
 * @returns {string} Complete HTML string ready for insertion into DOM or
 *   sanitization. Returns empty string for invalid input.
 *
 * @example
 * const tokens = [
 *   { megaType: 'heading', level: 1, content: [...] },
 *   { megaType: 'paragraph', content: [...] }
 * ];
 * const html = convertTokensToHTML(tokens);
 * // Returns: "<h1>...</h1>\n<p>...</p>"
 */
function convertTokensToHTML(tokens) {
  // Handle null/undefined tokens gracefully
  if (!tokens || !Array.isArray(tokens)) {
    return '';
  }

  // Get configuration settings for HTML generation behavior
  const applyCustomStyle = getSettings("useCustomTheme");
  const useCodeLangName = getSettings("LanguageNameInCode");
  const useCodeIcon = getSettings("IconInCode");

  /**
   * Converts inline markdown tokens into HTML strings with proper escaping.
   *
   * This recursive function handles all inline markdown elements like bold,
   * italic, links, images, and code spans. It properly escapes content to
   * prevent HTML injection while preserving the intended formatting.
   *
   * Supported inline elements:
   * - text: Plain text (HTML escaped)
   * - bold/italic/boldItalic: Text formatting elements
   * - strikethrough: Crossed-out text
   * - subscript/superscript: Mathematical notation
   * - link: Hyperlinks with automatic HTTPS prefixing
   * - image: Images with alt text and proper attributes
   * - code: Inline code spans
   * - highlight: Highlighted/marked text
   *
   * @param {Array} inlineTokens - Array of inline token objects, each with:
   *   - type: The kind of inline element (text, bold, link, etc.)
   *   - content: Either string content or array of nested tokens
   *   - Additional properties for specific types (href for links, src/alt for images)
   *
   * @returns {string} HTML string with proper escaping and CSS classes applied
   *   based on configuration. Nested tokens are processed recursively.
   *
   * @example
   * // representation inside megatype
   * const tokens = [
   *   { type: 'text', content: 'Hello ' },
   *   { type: 'bold', content: [{ type: 'text', content: 'world' }] },
   *   { type: 'text', content: '!' }
   * ];
   * // Returns: "Hello <strong>world</strong>!"
   */
  function inlineTokensToHTML(inlineTokens) {
    // Handle null/undefined tokens gracefully
    if (!inlineTokens) {
      return '';
    }
    
    // If inlineTokens is a string, treat it as a single text token
    if (typeof inlineTokens === 'string') {
      return escapeHTML(inlineTokens);
    }
    
    // If inlineTokens is not an array, return empty string
    if (!Array.isArray(inlineTokens)) {
      return '';
    }
    
    return inlineTokens
      .map((token) => {
        // Handle null/undefined individual tokens
        if (!token || typeof token !== 'object') {
          return '';
        }
        
        switch (token.type) {
          case "text":
            return escapeHTML(token.content);

          case "boldItalic":
            // Bold and italic nested elements
            return (
              `<strong${applyCustomStyle ? ` class="ct-parsed bold"` : ""}>` +
              `<em${applyCustomStyle ? ` class="ct-parsed italic"` : ""}>` +
              inlineTokensToHTML(token.content) +
              `</em></strong>`
            );

          case "bold":
            return (
              `<strong${applyCustomStyle ? ` class="ct-parsed bold"` : ""}>` +
              inlineTokensToHTML(token.content) +
              `</strong>`
            );

          case "italic":
            return (
              `<em${applyCustomStyle ? ` class="ct-parsed italic"` : ""}>` +
              inlineTokensToHTML(token.content) +
              `</em>`
            );

          case "strikethrough":
            return (
              `<del${
                applyCustomStyle ? ` class="ct-parsed strikethrough"` : ""
              }>` +
              inlineTokensToHTML(token.content) +
              `</del>`
            );

          case "subscript":
            return (
              `<sub${applyCustomStyle ? ` class="ct-parsed subscript"` : ""}>` +
              inlineTokensToHTML(token.content) +
              `</sub>`
            );

          case "superscript":
            return (
              `<sup${
                applyCustomStyle ? ` class="ct-parsed superscript"` : ""
              }>` +
              inlineTokensToHTML(token.content) +
              `</sup>`
            );

          case "link":
            let href = token.href || token.url || '';
            let linkContent = token.content || token.text || '';
            // Checks if link has https:// in front, if no adds it.
            if (href && !href.match(/^https?:\/\//)) {
              href = "https://" + href;
            }
            return (
              `<a href="${escapeAttribute(href)}"${
                applyCustomStyle ? ` class="ct-parsed link"` : ""
              }>` +
              inlineTokensToHTML(linkContent) +
              `</a>`
            );

          case "image":
            let src = token.src || '';
            let alt = token.alt || '';
            return `<img src="${escapeAttribute(src)}" alt="${escapeAttribute(alt)}"${
              applyCustomStyle ? ` class="ct-parsed image"` : ""
            } />`;

          case "code":
            return (
              `<code${applyCustomStyle ? ` class="ct-parsed code"` : ""}>` +
              escapeHTML(token.content) +
              `</code>`
            );

          case "highlight":
            return (
              `<mark${
                applyCustomStyle ? ` class="ct-parsed highlight"` : ""
              }>` +
              inlineTokensToHTML(token.content) +
              `</mark>`
            );

          default:
            // If content is nested tokens, recurse; otherwise, escape
            if (Array.isArray(token.content)) {
              return inlineTokensToHTML(token.content);
            }
            return escapeHTML(token.content || "");
        }
      })
      .join("");
  }

  /**
   * Escapes HTML special characters to prevent XSS injection attacks.
   *
   * This security function converts potentially dangerous characters into
   * their HTML entity equivalents, making them safe for display in HTML
   * content without being interpreted as markup.
   *
   * Characters escaped:
   * - & → &amp; (ampersand - must be first to avoid double-escaping)
   * - < → &lt; (less than - prevents opening tags)
   * - > → &gt; (greater than - prevents closing tags)
   * - " → &quot; (double quote - prevents attribute breaking)
   * - ' → &#39; (single quote - prevents attribute breaking)
   *
   * @param {string} str - The potentially unsafe string to escape
   * @returns {string} HTML-safe string with special characters escaped
   *
   * @example
   * escapeHTML('<script>alert("xss")</script>');
   * // Returns: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
   *
   * escapeHTML('User input: "Hello & goodbye"');
   * // Returns: 'User input: &quot;Hello &amp; goodbye&quot;'
   */
  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, (char) => {
      switch (char) {
        case "&":
          return "&amp;";
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case '"':
          return "&quot;";
        case "'":
          return "&#39;";
        default:
          /* istanbul ignore next */
          return char;
      }
    });
  }

  /**
   * Render list items, supporting nested sublists.
   *
   * @param {Array} items - List items (each with `content` and optional nested `items`)
   * @param {boolean} ordered - True if ordered list (<ol>), false if unordered (<ul>)
   * @returns {string} HTML string for nested list
   */
  function renderListItems(items, ordered) {
    // Handle undefined or null items
    if (!items || !Array.isArray(items)) {
      return '';
    }
    
    return items
      .map((item) => {
        const inlineHTML = inlineTokensToHTML(item.content);

        let nestedListHTML = "";
        const nestedItems = item.items || item.children || [];
        if (nestedItems.length > 0) {
          nestedListHTML = ordered
            ? `<ol${
                applyCustomStyle ? ` class="ct-parsed olist nested-list"` : ""
              }>\n${renderListItems(nestedItems, true)}\n</ol>`
            : `<ul${
                applyCustomStyle ? ` class="ct-parsed list nested-list"` : ""
              }>\n${renderListItems(nestedItems, false)}\n</ul>`;
        }

        return `<li${
          applyCustomStyle ? ` class="ct-parsed list-item"` : ""
        }>${inlineHTML}${nestedListHTML}</li>`;
      })
      .join("\n");
  }

  /**
   * Escapes quote characters specifically for use in HTML attribute values.
   *
   * This function is specialized for cleaning up strings that will be used
   * as HTML attribute values (like href, src, alt). It focuses on quote
   * characters that could break out of attribute value boundaries.
   *
   * @param {string} str - The attribute value string to escape
   * @returns {string} String safe for use in HTML attribute values
   *
   * @example
   * const url = 'https://example.com/search?q="test"';
   * const html = `<a href="${escapeAttribute(url)}">Link</a>`;
   * // Safe: <a href="https://example.com/search?q=&quot;test&quot;">Link</a>
   *
   * const altText = "Image of user's profile";
   * const img = `<img alt="${escapeAttribute(altText)}" />`;
   * // Safe: <img alt="Image of user&#39;s profile" />
   */
  function escapeAttribute(str) {
    return String(str).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // Main conversion loop: Process each block-level token and convert to HTML
  // Block tokens include: heading, paragraph, list, table, codeblock, etc.
  // Results are joined with newlines for readable HTML output
  return tokens
    .map((token) => {
      // Handle null/undefined individual tokens
      if (!token || typeof token !== 'object') {
        return '';
      }
      
      switch (token.megaType) {
        case "heading": {
          // Clamp heading level between 1 and 6 for valid HTML tags
          const level = Math.min(Math.max(token.level, 1), 6);
          return `<h${level}${
            applyCustomStyle
              ? ` class="ct-parsed heading heading-${level}"`
              : ""
          }>${inlineTokensToHTML(token.content)}</h${level}>`;
        }

        case "paragraph":
          return `<p${
            applyCustomStyle ? ` class="ct-parsed paragraph"` : ""
          }>${inlineTokensToHTML(token.content)}</p>`;

        case "blockquote":
          let blockquoteContent = '';
          if (Array.isArray(token.content)) {
            blockquoteContent = convertTokensToHTML(token.content);
          } else if (typeof token.content === 'string') {
            blockquoteContent = escapeHTML(token.content);
          } else {
            blockquoteContent = '';
          }
          
          // Handle nested children (for nested blockquotes)
          if (token.children && Array.isArray(token.children)) {
            blockquoteContent += convertTokensToHTML(token.children);
          }
          
          return `<blockquote${
            applyCustomStyle ? ` class="ct-parsed blockquote"` : ""
          }>${blockquoteContent}</blockquote>`;

        case "tasklist":
          // Task list: render checkbox input + inline content inside <li>
          return (
            `<ul${applyCustomStyle ? ` class="ct-parsed tasklist"` : ""}>\n` +
            (token.items || [])
              .map(
                (item) =>
                  `<li${
                    applyCustomStyle ? ` class="ct-parsed tasklist-item"` : ""
                  }>` +
                  `<input type="checkbox" disabled${
                    item.checked ? " checked" : ""
                  } /> ` +
                  inlineTokensToHTML(item.content) +
                  `</li>`
              )
              .join("\n") +
            `\n</ul>`
          );

        case "list":
          // List: check if ordered or unordered based on the ordered property
          if (token.ordered) {
            // Ordered list: similar to unordered list but using <ol> as main tag
            return `<ol${
              applyCustomStyle ? ` class="ct-parsed olist"` : ""
            }>\n${renderListItems(token.items, true)}\n</ol>`;
          } else {
            // Check if this is a task list (items have checked property)
            const hasCheckedItems = token.items && token.items.some(item => 'checked' in item);
            if (hasCheckedItems) {
              // Task list: render checkbox input + inline content inside <li>
              return (
                `<ul${applyCustomStyle ? ` class="ct-parsed tasklist"` : ""}>\n` +
                (token.items || [])
                  .map(
                    (item) =>
                      `<li${
                        applyCustomStyle ? ` class="ct-parsed tasklist-item"` : ""
                      }>` +
                      `<input type="checkbox" disabled${
                        item.checked ? " checked" : ""
                      } /> ` +
                      inlineTokensToHTML(item.content) +
                      `</li>`
                  )
                  .join("\n") +
                `\n</ul>`
              );
            } else {
              // Unordered list: Render each item inline tokens inside <li>
              return `<ul${
                applyCustomStyle ? ` class="ct-parsed list"` : ""
              }>\n${renderListItems(token.items, false)}\n</ul>`;
            }
          }

        case "horizontalRule":
          // Horizontal rule
          return `<hr${applyCustomStyle ? ` class="ct-parsed hr"` : ""}>`;

        // Code block
        case "codeBlock":
          const lang = token.language;
          let langLabel = "";

          if (lang) {
            let iconHTML = "";
            let nameHTML = "";

            if (useCodeIcon && useCodeLangName) {
              iconHTML = `<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${lang.toLowerCase()}/${lang.toLowerCase()}-original.svg"
        alt="code icon"${
                applyCustomStyle ? ` class="ct-parsed codeblock-image"` : ""
              } onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';" />
              <span style="display:none; font-size: 1.2em; margin-right: 5px;"${
                applyCustomStyle ? ` class="ct-parsed codeblock-fallback-icon"` : ""
              }>💻</span>`;
            } else if (useCodeIcon) {
              // Use a generic code icon when language name is disabled
              iconHTML = `<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/code/code-plain.svg"
        alt="code icon"${
                applyCustomStyle ? ` class="ct-parsed codeblock-image"` : ""
              } onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';" />
              <span style="display:none; font-size: 1.2em; margin-right: 5px;"${
                applyCustomStyle ? ` class="ct-parsed codeblock-fallback-icon"` : ""
              }>💻</span>`;
            }

            if (useCodeLangName) {
              nameHTML = escapeHTML(lang);
            }

            if (iconHTML || nameHTML) {
              langLabel = `<div${
                applyCustomStyle
                  ? ` class="ct-parsed codeblock-lang-label"`
                  : ""
              }>${iconHTML}${nameHTML}</div>`;
            }
          }

          // Display code content inside <pre><code> block
          return (
            langLabel +
            `<pre${
              applyCustomStyle ? ` class="ct-parsed codeblock-pre"` : ""
            }>` +
            `<code${
              applyCustomStyle ? ` class="ct-parsed codeblock-code"` : ""
            }>` +
            escapeHTML(token.content) +
            "</code></pre>"
          );

        // Table
        case "table": {
          const headerData = token.header || token.headers || [];
          const rowsData = token.rows || [];
          
          const headerHTML = headerData
            .map(
              (cellTokens) =>
                `<th${
                  applyCustomStyle ? ` class="ct-parsed table-header-cell"` : ""
                }>${inlineTokensToHTML(cellTokens)}</th>`
            )
            .join("");
          const rowsHTML = rowsData
            .map(
              (row) =>
                `<tr${
                  applyCustomStyle ? ` class="ct-parsed table-row"` : ""
                }>` +
                row
                  .map(
                    (cellTokens) =>
                      `<td${
                        applyCustomStyle ? ` class="ct-parsed table-cell"` : ""
                      }>${inlineTokensToHTML(cellTokens)}</td>`
                  )
                  .join("") +
                `</tr>`
            )
            .join("\n");
          
          const tableHTML = `<table${applyCustomStyle ? ` class="ct-parsed table"` : ""}>`;
          const theadHTML = headerData.length > 0 ? `<thead><tr>${headerHTML}</tr></thead>` : '';
          const tbodyHTML = `<tbody>${rowsHTML}</tbody>`;
          
          return `<div${
            applyCustomStyle ? ` class="ct-parsed table-container"` : ""
          }>${tableHTML}${theadHTML}${tbodyHTML}</table></div>`;
        }

        default:
          // For unknown/unsupported tokens, render empty string
          return "";
      }
    })
    .join("\n");
}

export default convertTokensToHTML;
