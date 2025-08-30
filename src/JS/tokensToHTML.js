function convertTokensToHTML(tokens) {
  function inlineTokensToHTML(inlineTokens) {
    return inlineTokens
      .map((token) => {
        switch (token.type) {
          case "text":
            return escapeHTML(token.content);
          case "boldItalic":
            return `<strong><em>${escapeHTML(token.content)}</em></strong>`;
          case "bold":
            return `<strong>${escapeHTML(token.content)}</strong>`;
          case "italic":
            return `<em>${escapeHTML(token.content)}</em>`;
          case "link":
            return `<a href="${escapeAttribute(token.href)}">${escapeHTML(
              token.content
            )}</a>`;
          case "image":
            return `<img src="${escapeAttribute(
              token.src
            )}" alt="${escapeAttribute(token.alt)}" />`;
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
        return `<h${level}>${inlineTokensToHTML(token.content)}</h${level}>`;
      } else if (token.megaType === "paragraph") {
        return `<p>${inlineTokensToHTML(token.content)}</p>`;
      } else {
        return "";
      }
    })
    .join("\n");
}

export default convertTokensToHTML;
