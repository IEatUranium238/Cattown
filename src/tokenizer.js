/**
 * Tokenizes a markdown user input string into an array of tokens representing blocks and inline formatting.
 *
 * @param {string} input - The raw markdown-like string input.
 * @returns {Array} tokens - Array of token objects representing the parsed structure.
 */
function tokenizeUserInput(input) {
  const lines = input.split("\n");
  const tokens = [];

  /**
   * Tokenizes inline markdown elements within a single line of text.
   * Supports boldItalic, bold, italic, strikethrough, links, images, and inline code.
   *
   * @param {string} text - The text line to tokenize inline syntax.
   * @returns {Array} inlineTokens - Array of inline token objects.
   */
  function tokenizeInline(text) {
    const inlineTokens = [];
    if (!text) return inlineTokens;

    // Patterns for atomic tokens (link, image, code) prioritized first
    const atomicPatterns = [
      { type: "image", regex: /!\[([^\]]*)\]\(([^)]+)\)/g },
      { type: "link", regex: /\[([^\]]+)\]\(([^)]+)\)/g },
      { type: "code", regex: /`([^`]+)`/g },
    ];

    // Markers for styled tokens boldItalic, bold, italic, strikethrough
    // Order matters: boldItalic first, then bold, then italic, then strikethrough
    const styledMarkers = [
      { type: "boldItalic", markers: ["***", "___"] },
      { type: "bold", markers: ["**", "__"] },
      { type: "italic", markers: ["*", "_"] },
      { type: "strikethrough", markers: ["~~", "~"] },
    ];

    // Helper function to find earliest match among patterns with regex global flag
    function findEarliestMatch(patterns, str) {
      let earliest = null;
      for (const { type, regex } of patterns) {
        regex.lastIndex = 0;
        const match = regex.exec(str);
        if (match) {
          if (earliest === null || match.index < earliest.index) {
            earliest = { type, match, index: match.index };
          }
        }
      }
      return earliest;
    }

    // Helper to find earliest styled marker pair
    function findEarliestStyledMarker(str) {
      let earliest = null;
      for (const { type, markers } of styledMarkers) {
        for (const marker of markers) {
          const startIndex = str.indexOf(marker);
          if (startIndex !== -1) {
            const endIndex = str.indexOf(marker, startIndex + marker.length);
            if (endIndex !== -1) {
              if (earliest === null || startIndex < earliest.startIndex) {
                earliest = { type, marker, startIndex, endIndex };
              }
            }
          }
        }
      }
      return earliest;
    }

    // Main parsing loop for current text
    while (text.length > 0) {
      // 1. Look for earliest atomic token (image, link, code)
      const atomicMatch = findEarliestMatch(atomicPatterns, text);

      // 2. Look for earliest styled marker
      const styledMatch = findEarliestStyledMarker(text);

      // Determine which comes first
      let earliestMatch = null;
      if (atomicMatch && styledMatch) {
        earliestMatch =
          atomicMatch.index <= styledMatch.startIndex
            ? atomicMatch
            : styledMatch;
      } else {
        earliestMatch = atomicMatch || styledMatch;
      }

      if (!earliestMatch) {
        // No more markdown tokens found; push rest as plain text
        inlineTokens.push({ type: "text", content: text });
        break;
      }

      // Add text before match as plain text if any
      const preText =
        earliestMatch.type === "link" ||
        earliestMatch.type === "image" ||
        earliestMatch.type === "code"
          ? text.slice(0, earliestMatch.index)
          : text.slice(0, earliestMatch.startIndex);
      if (preText) {
        inlineTokens.push({ type: "text", content: preText });
      }

      if (earliestMatch.type === "image") {
        // Image token
        inlineTokens.push({
          type: "image",
          alt: earliestMatch.match[1],
          src: earliestMatch.match[2],
        });
        text = text.slice(earliestMatch.index + earliestMatch.match[0].length);
      } else if (earliestMatch.type === "link") {
        // Link token
        // Tokenize the link text itself in case it has styles (recursive)
        const linkTextTokens = tokenizeInline(earliestMatch.match[1]);
        inlineTokens.push({
          type: "link",
          content: linkTextTokens,
          href: earliestMatch.match[2],
        });
        text = text.slice(earliestMatch.index + earliestMatch.match[0].length);
      } else if (earliestMatch.type === "code") {
        // Code token, just take content as is
        inlineTokens.push({
          type: "code",
          content: earliestMatch.match[1],
        });
        text = text.slice(earliestMatch.index + earliestMatch.match[0].length);
      } else if (
        earliestMatch.type === "boldItalic" ||
        earliestMatch.type === "bold" ||
        earliestMatch.type === "italic" ||
        earliestMatch.type === "strikethrough"
      ) {
        const { marker, startIndex, endIndex, type } = earliestMatch;
        const innerText = text.slice(startIndex + marker.length, endIndex);
        // Recursively tokenize inside the styled segment
        const innerTokens = tokenizeInline(innerText);
        inlineTokens.push({
          type,
          content: innerTokens,
        });
        text = text.slice(endIndex + marker.length);
      } else {
        // Fallback (should not happen)
        inlineTokens.push({ type: "text", content: text });
        break;
      }
    }

    return inlineTokens;
  }

  /**
   * Collects consecutive blockquote lines starting at startIndex and recursively tokenizes their content.
   *
   * @param {number} startIndex - Line index to start processing blockquote.
   * @returns {object} - Tokenized content and the index where blockquote ends.
   */
  function consumeBlockquote(startIndex) {
    const blockquoteLines = [];
    let i = startIndex;

    // Collect lines that begin with '>' or blank lines (inside blockquotes)
    while (i < lines.length) {
      const line = lines[i];
      if (/^>/.test(line.trim())) {
        blockquoteLines.push(line);
        i++;
      } else if (line.trim() === "") {
        // Allow blank lines inside blockquotes for paragraph breaks
        blockquoteLines.push(line);
        i++;
      } else {
        break;
      }
    }

    // Remove blockquote markers '>' and optional space from each line
    const processedLines = blockquoteLines.map((line) =>
      line.replace(/^>\s?/, "")
    );

    // Join and tokenize blockquote content recursively
    const blockquoteContent = processedLines.join("\n");
    const content = tokenizeUserInput(blockquoteContent);

    return { content, endIndex: i };
  }

  /**
   * Collects consecutive unordered list items starting at startIndex.
   *
   * @param {number} startIndex - Line index to start processing unordered list.
   * @returns {object} - Array of list item tokens and index where list ends.
   */
  function consumeUnorderedList(startIndex) {
    const items = [];
    let i = startIndex;

    while (i < lines.length) {
      const line = lines[i].trim();
      const match = line.match(/^([-*])\s+(.*)$/); // match lines starting with '-' or '*'
      if (!match) break;
      items.push(tokenizeInline(match[2]));
      i++;
    }

    return { items, endIndex: i };
  }

  /**
   * Collects consecutive ordered list items starting at startIndex.
   *
   * @param {number} startIndex - Line index to start processing ordered list.
   * @returns {object} - Array of list item tokens and index where list ends.
   */
  function consumeOrderedList(startIndex) {
    const items = [];
    let i = startIndex;

    while (i < lines.length) {
      const line = lines[i].trim();
      const match = line.match(/^(\d+)\.\s+(.*)$/); // match lines starting with number + '.'
      if (!match) break;
      items.push(tokenizeInline(match[2]));
      i++;
    }

    return { items, endIndex: i };
  }

  // Main parsing loop: Processes each input line sequentially
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.length === 0) continue; // skip empty lines

    // Detect horizontal rules - lines with 3+ repeated '*', '-', or '_'
    if (/^([*\-_])\1{2,}$/.test(trimmed)) {
      tokens.push({ megaType: "hr" });
      continue;
    }

    // Blockquote lines start with '>'
    if (/^>\s?/.test(trimmed)) {
      const { content, endIndex } = consumeBlockquote(i);
      tokens.push({ megaType: "blockquote", content });
      i = endIndex - 1; // move index to end of blockquote
      continue;
    }

    // Ordered list items start with number + '.'
    if (/^\d+\.\s+/.test(trimmed)) {
      const { items, endIndex } = consumeOrderedList(i);
      tokens.push({ megaType: "olist", items });
      i = endIndex - 1;
      continue;
    }

    // Unordered list items start with '-' or '*'
    if (/^[-*]\s+/.test(trimmed)) {
      const { items, endIndex } = consumeUnorderedList(i);
      tokens.push({ megaType: "list", items });
      i = endIndex - 1;
      continue;
    }

    // Headings (levels 1 to 6)
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = headingMatch[2];
      tokens.push({
        megaType: "heading",
        level,
        content: tokenizeInline(content),
      });
      continue;
    }

    // Otherwise, treat as a paragraph
    tokens.push({
      megaType: "paragraph",
      content: tokenizeInline(trimmed),
    });
  }

  return tokens;
}

export default tokenizeUserInput;
