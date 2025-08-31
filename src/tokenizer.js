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

    // Regex patterns for different inline markdown elements
    const patterns = [
      { type: "boldItalic", regex: /(\*\*\*|___)/g },
      { type: "bold", regex: /(\*\*|__)/g },
      { type: "italic", regex: /(\*|_)/g },
      { type: "strikethrough", regex: /(~{1,2})/g },
      { type: "link", regex: /\[([^\]]+)\]\(([^)]+)\)/g },
      { type: "image", regex: /!\[([^\]]*)\]\(([^)]+)\)/g },
      { type: "code", regex: /`([^`]+)`/g },
    ];

    // Find earliest match for link, image, and code patterns (last three items)
    let earliestMatch = null;
    let earliestIndex = text.length;
    const simplePatterns = patterns.slice(-3);

    for (const { type, regex } of simplePatterns) {
      regex.lastIndex = 0;
      const match = regex.exec(text);
      if (match && match.index < earliestIndex) {
        earliestIndex = match.index;
        earliestMatch = { type, match, regex, index: match.index };
      }
    }

    // If no simple pattern match found, try complex markers (boldItalic, bold, italic, strikethrough)
    if (!earliestMatch) {
      // Order matters here for correct precedence in parsing
      const markers = [
        { type: "boldItalic", marker: "***" },
        { type: "boldItalic", marker: "___" },
        { type: "bold", marker: "**" },
        { type: "bold", marker: "__" },
        { type: "italic", marker: "*" },
        { type: "italic", marker: "_" },
        { type: "strikethrough", marker: "~~" },
        { type: "strikethrough", marker: "~" },
      ];

      earliestIndex = text.length;
      for (const { type, marker } of markers) {
        const startIndex = text.indexOf(marker);
        if (startIndex !== -1 && startIndex < earliestIndex) {
          const endIndex = text.indexOf(marker, startIndex + marker.length);
          if (endIndex !== -1) {
            earliestIndex = startIndex;
            earliestMatch = { type, marker, startIndex, endIndex };
          }
        }
      }
    }

    // If no markdown formatting found, treat entire text as plain text
    if (!earliestMatch) {
      inlineTokens.push({ type: "text", content: text });
      return inlineTokens;
    }

    // Add preceding text before the matched markdown syntax as plain text
    if (earliestIndex > 0) {
      inlineTokens.push({
        type: "text",
        content: text.slice(0, earliestIndex),
      });
    }

    // Process matched token accordingly
    switch (earliestMatch.type) {
      case "link":
        inlineTokens.push({
          type: "link",
          content: earliestMatch.match[1], // link text
          href: earliestMatch.match[2],    // link url
        });
        inlineTokens.push(
          ...tokenizeInline(text.slice(earliestMatch.index + earliestMatch.match[0].length))
        );
        break;
      case "image":
        inlineTokens.push({
          type: "image",
          alt: earliestMatch.match[1], // alt text
          src: earliestMatch.match[2], // image source
        });
        inlineTokens.push(
          ...tokenizeInline(text.slice(earliestMatch.index + earliestMatch.match[0].length))
        );
        break;
      case "code":
        inlineTokens.push({
          type: "code",
          content: earliestMatch.match[1],
        });
        inlineTokens.push(
          ...tokenizeInline(text.slice(earliestMatch.index + earliestMatch.match[0].length))
        );
        break;
      // For text styles (boldItalic, bold, italic, strikethrough), recursively tokenize inside
      case "boldItalic":
      case "bold":
      case "italic":
      case "strikethrough": {
        const innerText = text.slice(
          earliestMatch.startIndex + earliestMatch.marker.length,
          earliestMatch.endIndex
        );
        inlineTokens.push({
          type: earliestMatch.type,
          content: tokenizeInline(innerText),
        });
        inlineTokens.push(
          ...tokenizeInline(text.slice(earliestMatch.endIndex + earliestMatch.marker.length))
        );
        break;
      }
      default:
        // fallback: treat as plain text
        inlineTokens.push({ type: "text", content: text });
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
    const processedLines = blockquoteLines.map(line => line.replace(/^>\s?/, ""));

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
