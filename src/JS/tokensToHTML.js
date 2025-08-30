import config from "./../cattownConfig.json";

const applyCustomStyle = config.useCustomTheme;

function convertTokensToHTML(tokens) {
  function inlineTokensToHTML(inlineTokens) {
    return inlineTokens
      .map((token) => {
        switch (token.type) {
          case "text":
            return escapeHTML(token.content);
          case "boldItalic":
            return `<strong ${
              applyCustomStyle ? `class="ct-parsed bold"` : ""
            }><em ${
              applyCustomStyle ? `class="ct-parsed italic"` : ""
            }>${escapeHTML(token.content)}</em></strong>`;
          case "bold":
            return `<strong ${
              applyCustomStyle ? `class="ct-parsed bold"` : ""
            }>${escapeHTML(token.content)}</strong>`;
          case "italic":
            return `<em ${
              applyCustomStyle ? `class="ct-parsed italic"` : ""
            }>${escapeHTML(token.content)}</em>`;
          case "strikethrough":
            return `<del ${
              applyCustomStyle ? `class="ct-parsed strikethrough"` : ""
            }>${escapeHTML(token.content)}</del>`;
          case "link":
            return `<a href="${escapeAttribute(token.href)}" ${
              applyCustomStyle ? `class="ct-parsed link"` : ""
            }>${escapeHTML(token.content)}</a>`;
          case "image":
            return `<img src="${escapeAttribute(
              token.src
            )}" alt="${escapeAttribute(token.alt)}" ${
              applyCustomStyle ? `class="ct-parsed image"` : ""
            } />`;
          default:
            return escapeHTML(token.content || "");
        }
      })
      .join("");
  }

  function escapeHTML(str) {
    return str.replace(/[&<>"']/g, function (m) {
      switch (m) {
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
          return m;
      }
    });
  }

  function escapeAttribute(str) {
    return String(str).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  return tokens
    .map((token) => {
      if (token.megaType === "heading") {
        const level = Math.min(Math.max(token.level, 1), 6);
        return `<h${level} ${
          applyCustomStyle ? `class="ct-parsed heading heading-${level}"` : ""
        }>${inlineTokensToHTML(token.content)}</h${level}>`;
      } else if (token.megaType === "paragraph") {
        return `<p ${
          applyCustomStyle ? `class="ct-parsed paragraph"` : ""
        }>${inlineTokensToHTML(token.content)}</p>`;
      } else if (token.megaType === "blockquote") {
        return `<blockquote ${
          applyCustomStyle ? `class="ct-parsed blockquote"` : ""
        }>${inlineTokensToHTML(token.content)}</blockquote>`;
      } else if (token.megaType === "list") {
        return `<ul ${
          applyCustomStyle ? `class="ct-parsed list"` : ""
        }>\n${token.items
          .map(
            (item) =>
              `<li ${
                applyCustomStyle ? `class="ct-parsed list-item"` : ""
              }>${inlineTokensToHTML(item)}</li>`
          )
          .join("\n")}\n</ul>`;
      } else if (token.megaType === "olist") {
        return `<ol ${
          applyCustomStyle ? `class="ct-parsed olist"` : ""
        }>\n${token.items
          .map(
            (item) =>
              `<li ${
                applyCustomStyle ? `class="ct-parsed olist-item"` : ""
              }>${inlineTokensToHTML(item)}</li>`
          )
          .join("\n")}\n</ol>`;
      } else if (token.megaType === "hr") {
        return `<hr ${
          applyCustomStyle ? `class="ct-parsed hr"` : ""
        } />`;
      } else {
        return "";
      }
    })
    .join("\n");
}

export default convertTokensToHTML;
