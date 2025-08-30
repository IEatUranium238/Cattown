import config from "./cattownConfig.json";

// Flag to determine if custom styling classes should be applied
const applyCustomStyle = config.useCustomTheme;

/**
 * Converts tokens generated from the markdown tokenizer into HTML strings.
 *
 * @param {Array} tokens - Array of parsed token objects.
 * @returns {string} - Resulting HTML string.
 */
function convertTokensToHTML(tokens) {

  /**
   * Converts an array of inline tokens to HTML, escaping content and applying styles.
   *
   * @param {Array} inlineTokens - Array of inline token objects.
   * @returns {string} - HTML string representing inline content.
   */
  function inlineTokensToHTML(inlineTokens) {
    return inlineTokens
      .map((token) => {
        switch (token.type) {
          case "text":
            return escapeHTML(token.content);

          case "boldItalic":
            return `<strong ${applyCustomStyle ? `class="ct-parsed bold"` : ""}><em ${applyCustomStyle ? `class="ct-parsed italic"` : ""}>${escapeHTML(token.content)}</em></strong>`;

          case "bold":
            return `<strong ${applyCustomStyle ? `class="ct-parsed bold"` : ""}>${escapeHTML(token.content)}</strong>`;

          case "italic":
            return `<em ${applyCustomStyle ? `class="ct-parsed italic"` : ""}>${escapeHTML(token.content)}</em>`;

          case "strikethrough":
            return `<del ${applyCustomStyle ? `class="ct-parsed strikethrough"` : ""}>${escapeHTML(token.content)}</del>`;

          case "link":
            return `<a href="${escapeAttribute(token.href)}" ${applyCustomStyle ? `class="ct-parsed link"` : ""}>${escapeHTML(token.content)}</a>`;

          case "image":
            return `<img src="${escapeAttribute(token.src)}" alt="${escapeAttribute(token.alt)}" ${applyCustomStyle ? `class="ct-parsed image"` : ""} />`;

          case "code":
            return `<code ${applyCustomStyle ? `class="ct-parsed code"` : ""}>${escapeHTML(token.content)}</code>`;

          default:
            // Fallback for unrecognized tokens
            return escapeHTML(token.content || "");
        }
      })
      .join("");
  }

  /**
   * Escapes special HTML characters to their entity equivalents,
   * preventing HTML injection issues.
   *
   * @param {string} str - The string to escape.
   * @returns {string} Escaped string safe for HTML.
   */
  function escapeHTML(str) {
    return str.replace(/[&<>"']/g, (char) => {
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
   * Escapes quotes in attribute values to prevent breaking HTML attributes.
   *
   * @param {string} str - The attribute string to escape.
   * @returns {string} Escaped string safe for HTML attributes.
   */
  function escapeAttribute(str) {
    return String(str).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // Main conversion loop for block-level tokens
  return tokens
    .map((token) => {
      switch (token.megaType) {
        case "heading": {
          // Clamp heading level between 1 and 6 for valid HTML
          const level = Math.min(Math.max(token.level, 1), 6);
          return `<h${level} ${applyCustomStyle ? `class="ct-parsed heading heading-${level}"` : ""}>${inlineTokensToHTML(token.content)}</h${level}>`;
        }
        case "paragraph":
          return `<p ${applyCustomStyle ? `class="ct-parsed paragraph"` : ""}>${inlineTokensToHTML(token.content)}</p>`;

        case "blockquote":
          // Blockquote content is recursive tokens — call convertTokensToHTML recursively
          return `<blockquote ${applyCustomStyle ? `class="ct-parsed blockquote"` : ""}>${convertTokensToHTML(token.content)}</blockquote>`;

        case "list":
          // Unordered list with items rendered as inline tokens inside <li>
          return `<ul ${applyCustomStyle ? `class="ct-parsed list"` : ""}>\n${token.items
            .map(
              (item) =>
                `<li ${applyCustomStyle ? `class="ct-parsed list-item"` : ""}>${inlineTokensToHTML(item)}</li>`
            )
            .join("\n")}\n</ul>`;

        case "olist":
          // Ordered list with items rendered similarly to unordered lists
          return `<ol ${applyCustomStyle ? `class="ct-parsed olist"` : ""}>\n${token.items
            .map(
              (item) =>
                `<li ${applyCustomStyle ? `class="ct-parsed olist-item"` : ""}>${inlineTokensToHTML(item)}</li>`
            )
            .join("\n")}\n</ol>`;

        case "hr":
          return `<hr ${applyCustomStyle ? `class="ct-parsed hr"` : ""} />`;

        default:
          // Unknown or unsupported tokens render as empty string
          return "";
      }
    })
    .join("\n");
}

export default convertTokensToHTML;
