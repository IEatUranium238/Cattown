/**
 * Tokenizes a markdown user input string into an array of tokens representing blocks and inline formatting.
 * 
 * @param {string} input - The raw markdown-like string input.
 * @returns {Array} tokens - Array of token objects representing the parsed structure.
 */
function tokenizeUserInput(input) {
  const lines = input.split("\n"); // Split input into lines
  const tokens = [];

  /**
   * Tokenizes inline markdown elements within a single line of text.
   * Recognizes bold, italic, bolditalic, strikethrough, links, images, and inline code.
   * 
   * @param {string} text - The text line to tokenize inline syntax.
   * @returns {Array} inlineTokens - Array of inline token objects.
   */
  function tokenizeInline(text) {
    const inlineTokens = [];
    let pos = 0;

    // Regex patterns for various inline markdown syntaxes with capture groups
    const patterns = [
      { type: "boldItalic", regex: /(\*\*\*|___)(.+?)\1/g },           // ***text*** or ___text___
      { type: "bold", regex: /(\*\*|__)(.+?)\1/g },                   // **text** or __text__
      { type: "italic", regex: /(\*|_)(.+?)\1/g },                    // *text* or _text_
      { type: "strikethrough", regex: /~{1,2}(.+?)~{1,2}/g },         // ~text~ or ~~text~~
      { type: "link", regex: /\[([^\]]+)\]\(([^)]+)\)/g },            // [text](url)
      { type: "image", regex: /!\[([^\]]*)\]\(([^)]+)\)/g },          // ![alt](src)
      { type: "code", regex: /`([^`]+)`/g },                          // `code`
    ];

    while (pos < text.length) {
      let closestMatch = null;
      let closestIndex = text.length;

      // Find the earliest matching pattern from current position
      for (const { type, regex } of patterns) {
        regex.lastIndex = pos;
        const match = regex.exec(text);
        if (match && match.index < closestIndex) {
          closestMatch = { type, match };
          closestIndex = match.index;
        }
      }

      // If no more matches, push remaining text and break
      if (!closestMatch) {
        inlineTokens.push({ type: "text", content: text.slice(pos) });
        break;
      }

      // Push text before the matched token as plain text
      if (closestIndex > pos) {
        inlineTokens.push({
          type: "text",
          content: text.slice(pos, closestIndex),
        });
      }

      // Extract and push token based on type and matched groups
      const { type, match } = closestMatch;

      switch (type) {
        case "boldItalic":
          inlineTokens.push({ type: "boldItalic", content: match[2] });
          break;
        case "bold":
          inlineTokens.push({ type: "bold", content: match[2] });
          break;
        case "italic":
          inlineTokens.push({ type: "italic", content: match[2] });
          break;
        case "strikethrough":
          inlineTokens.push({ type: "strikethrough", content: match[1] });
          break;
        case "link":
          inlineTokens.push({
            type: "link",
            content: match[1],
            href: match[2],
          });
          break;
        case "image":
          inlineTokens.push({ type: "image", alt: match[1], src: match[2] });
          break;
        case "code":
          inlineTokens.push({ type: "code", content: match[1] });
          break;
      }

      // Move position cursor past the matched token
      pos = match.index + match[0].length;
    }

    return inlineTokens;
  }

  /**
   * Collects consecutive blockquote lines starting at startIndex and recursively tokenizes their content.
   * 
   * @param {number} startIndex - Line index to start processing blockquote.
   * @returns {object} - token content and index where blockquote ends.
   */
  function consumeBlockquote(startIndex) {
    const blockquoteLines = [];
    let i = startIndex;

    // Collect lines that begin with > or blank lines
    while (i < lines.length) {
      const line = lines[i];
      if (/^>/.test(line.trim())) {
        blockquoteLines.push(line);
        i++;
      } else if (line.trim() === "") {
        blockquoteLines.push(line);
        i++;
      } else {
        break;
      }
    }

    // Remove the blockquote '>' prefix and optional space from each line
    const processedLines = blockquoteLines.map((line) => line.replace(/^>\s?/, ""));

    // Join lines into a string, then recursively tokenize
    const blockquoteContent = processedLines.join("\n");
    const content = tokenizeUserInput(blockquoteContent);

    return { content, endIndex: i };
  }

  /**
   * Collects consecutive unordered list items starting at startIndex.
   * 
   * @param {number} startIndex - Line index to start processing list.
   * @returns {object} - item tokens and index where list ends.
   */
  function consumeUnorderedList(startIndex) {
    const items = [];
    let i = startIndex;

    // Match lines starting with '-' or '*'
    while (i < lines.length) {
      const line = lines[i].trim();
      const match = line.match(/^([-*])\s+(.*)$/);
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
   * @returns {object} - item tokens and index where list ends.
   */
  function consumeOrderedList(startIndex) {
    const items = [];
    let i = startIndex;

    // Match lines starting with a number and a dot (e.g., 1. item)
    while (i < lines.length) {
      const line = lines[i].trim();
      const match = line.match(/^(\d+)\.\s+(.*)$/);
      if (!match) break;
      items.push(tokenizeInline(match[2]));
      i++;
    }

    return { items, endIndex: i };
  }

  // Process each line sequentially
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let trimmed = line.trim();

    if (trimmed.length === 0) continue; // Skip empty lines

    // Horizontal rule detection: lines with three or more repeated '*', '-', or '_'
    if (/^([*\-_])\1{2,}$/.test(trimmed)) {
      tokens.push({
        megaType: "hr",
      });
      continue;
    }

    // Blockquote detection
    if (/^>\s?/.test(trimmed)) {
      const { content, endIndex } = consumeBlockquote(i);
      tokens.push({
        megaType: "blockquote",
        content,
      });
      i = endIndex - 1; // Continue from the line after blockquote
      continue;
    }

    // Ordered list detection (e.g., "1. item")
    if (/^\d+\.\s+/.test(trimmed)) {
      const { items, endIndex } = consumeOrderedList(i);
      tokens.push({
        megaType: "olist",
        items,
      });
      i = endIndex - 1;
      continue;
    }

    // Unordered list detection (e.g., "- item" or "* item")
    if (/^[-*]\s+/.test(trimmed)) {
      const { items, endIndex } = consumeUnorderedList(i);
      tokens.push({
        megaType: "list",
        items,
      });
      i = endIndex - 1;
      continue;
    }

    // Heading detection (levels 1-6)
    let headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = headingMatch[2];
      tokens.push({
        megaType: "heading",
        level,
        content: tokenizeInline(content),
      });
    } else {
      // Otherwise, treat as a paragraph with inline tokens
      tokens.push({
        megaType: "paragraph",
        content: tokenizeInline(trimmed),
      });
    }
  }

  return tokens;
}

export default tokenizeUserInput;
