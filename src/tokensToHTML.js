import config from "./cattownConfig.json";

// Flag to determine if custom styling classes should be applied
const applyCustomStyle = config.useCustomTheme;

// Code snippet flags
const useCodeLangName = config.LanguageNameInCode;
const useCodeIcon = config.IconInCode;

/**
 * Converts tokens generated from the markdown tokenizer into HTML strings.
 *
 * @param {Array} tokens - Array of parsed token objects.
 * @returns {string} - Resulting HTML string.
 */
function convertTokensToHTML(tokens) {
  /**
   * Converts an array of inline tokens to HTML.
   * Recursively escapes content and applies styles/classes if enabled.
   *
   * @param {Array} inlineTokens - Array of inline token objects.
   * @returns {string} - HTML string representing the inline content.
   */
  function inlineTokensToHTML(inlineTokens) {
    return inlineTokens
      .map((token) => {
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
            let href = token.href;
            // Checks if link has https:// in front, if no adds it.
            if (!href.match(/^https?:\/\//)) {
              href = "https://" + href;
            }
            return (
              `<a href="${escapeAttribute(href)}"${
                applyCustomStyle ? ` class="ct-parsed link"` : ""
              }>` +
              inlineTokensToHTML(token.content) +
              `</a>`
            );

          case "image":
            return `<img src="${escapeAttribute(
              token.src
            )}" alt="${escapeAttribute(token.alt)}"${
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
   * Escapes special HTML characters to their entity equivalents to prevent injection.
   *
   * @param {string} str - The string to escape.
   * @returns {string} Escaped string safe for HTML content.
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
          return char;
      }
    });
  }

  /**
   * Escapes quote characters in attribute values to prevent HTML attribute-breaking.
   *
   * @param {string} str - The attribute string to escape.
   * @returns {string} Escaped string safe for use in HTML attributes.
   */
  function escapeAttribute(str) {
    return String(str).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // Convert block-level tokens to HTML, joining with newline for readability
  return tokens
    .map((token) => {
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
          return `<blockquote${
            applyCustomStyle ? ` class="ct-parsed blockquote"` : ""
          }>${convertTokensToHTML(token.content)}</blockquote>`;

        case "tasklist":
          // Task list: render checkbox input + inline content inside <li>
          return (
            `<ul${applyCustomStyle ? ` class="ct-parsed tasklist"` : ""}>\n` +
            token.items
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
          // Unordered list: Render each item inline tokens inside <li>
          return `<ul${
            applyCustomStyle ? ` class="ct-parsed list"` : ""
          }>\n${token.items
            .map(
              (item) =>
                `<li${
                  applyCustomStyle ? ` class="ct-parsed list-item"` : ""
                }>${inlineTokensToHTML(item)}</li>`
            )
            .join("\n")}\n</ul>`;

        case "olist":
          // Ordered list: similar to unordered list but using <ol> as main tag
          return `<ol${
            applyCustomStyle ? ` class="ct-parsed olist"` : ""
          }>\n${token.items
            .map(
              (item) =>
                `<li${
                  applyCustomStyle ? ` class="ct-parsed olist-item"` : ""
                }>${inlineTokensToHTML(item)}</li>`
            )
            .join("\n")}\n</ol>`;

        case "hr":
          // Horizontal rule
          return `<hr${applyCustomStyle ? ` class="ct-parsed hr"` : ""} />`;

        // Code block
        case "codeblock":
          const lang = token.language;
          let langLabel = "";

          if (lang) {
            let iconHTML = "";
            let nameHTML = "";

            if (useCodeIcon && useCodeLangName) {
              iconHTML = `<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${lang.toLowerCase()}/${lang.toLowerCase()}-original.svg"
        alt="${lang} icon"${
                applyCustomStyle ? ` class="ct-parsed codeblock-image"` : ""
              } />`;
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
          const headerHTML = token.header
            .map(
              (cellTokens) =>
                `<th${
                  applyCustomStyle ? ` class="ct-parsed table-header-cell"` : ""
                }>${inlineTokensToHTML(cellTokens)}</th>`
            )
            .join("");
          const rowsHTML = token.rows
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
          return `<div${applyCustomStyle ? ` class="ct-parsed table-container"` : ""}><table${applyCustomStyle ? ` class="ct-parsed table"` : ""}>
    <thead><tr>${headerHTML}</tr></thead>
    <tbody>${rowsHTML}</tbody>
  </table></div>`;
        }

        default:
          // For unknown/unsupported tokens, render empty string
          return "";
      }
    })
    .join("\n");
}

export default convertTokensToHTML;
