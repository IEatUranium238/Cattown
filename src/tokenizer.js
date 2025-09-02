/**
 * CATTOWN MARKDOWN TOKENIZER
 *
 * This module implements the first stage of markdown parsing: tokenization.
 * It converts raw markdown text into a structured array of token objects
 * representing both block-level elements (headers, paragraphs, lists) and
 * inline formatting (bold, italic, links, images).
 *
 * Key Features:
 * - Iterative parsing algorithm (no recursion) for better performance
 * - Comprehensive markdown syntax support
 * - Proper nesting of inline elements within block elements
 * - Special handling for atomic elements (links, images, code)
 * - Blockquote support with nested content
 * - Table parsing with header detection
 * - Task list support with checkbox states
 *
 * Algorithm Overview:
 * 1. Split input into lines for block-level parsing
 * 2. Process each line to identify block elements
 * 3. For each block, parse inline content iteratively
 * 4. Handle special cases like code blocks, tables, lists
 *
 * The tokenizer produces a hierarchical structure where:
 * - Block tokens have 'megaType' property (heading, paragraph, list, etc.)
 * - Inline tokens have 'type' property (text, bold, italic, link, etc.)
 * - Content can be either strings or arrays of nested tokens
 */

/**
 * Converts raw markdown text into structured token objects.
 *
 * This is the main entry point for the tokenization process. It analyzes
 * markdown syntax and produces an abstract syntax tree of tokens that
 * can be converted to HTML by the tokensToHTML module.
 *
 * The function handles the complete markdown specification including:
 * - Headers (# ## ### #### ##### ######)
 * - Paragraphs and line breaks
 * - Bold (**text** or __text__) and italic (*text* or _text_)
 * - Links [text](url) and images ![alt](src)
 * - Code blocks (```lang) and inline code (`code`)
 * - Lists (ordered and unordered) and task lists
 * - Tables with header rows
 * - Blockquotes (> text)
 * - Horizontal rules (--- *** ___)
 * - Strikethrough (~~text~~), highlight (==text==)
 * - Subscript (~text~) and superscript (^text^)
 *
 * @param {string} input - Raw markdown text to parse. Can contain any
 *   valid markdown syntax including multi-line content.
 *
 * @returns {Array} Array of token objects representing the parsed structure.
 *   Each token has either:
 *   - megaType: for block elements (heading, paragraph, list, table, etc.)
 *   - type: for inline elements (text, bold, italic, link, etc.)
 *   Plus additional properties for content, attributes, and metadata.
 *
 * @example
 * const tokens = tokenizeUserInput("# Hello\n**Bold** text");
 * // Returns: [
 * //   { megaType: 'heading', level: 1, content: [...] },
 * //   { megaType: 'paragraph', content: [...] }
 * // ]
 */
function tokenizeUserInput(input) {
  const lines = input.split("\n"); // Split input by lines for block-level parsing
  const tokens = [];

  /**
   * Parses inline markdown elements using an iterative stack-based algorithm.
   *
   * This is one of the most complex functions in Cattown. It handles nested
   * inline formatting while properly managing precedence and avoiding infinite
   * recursion. The algorithm uses a processing stack to handle nested elements
   * like bold text containing italic text containing links.
   *
   * Processing Strategy:
   * 1. Atomic elements (images, links, code) are parsed first and cannot be nested
   * 2. Styled elements (bold, italic) are parsed by precedence (longest markers first)
   * 3. Nested content is processed by pushing new frames onto the processing stack
   * 4. The stack ensures proper nesting without recursion
   *
   * Element Categories:
   * - Atomic (cannot contain other formatting):
   *   - Images: ![alt](src)
   *   - Links: [text](href)
   *   - Inline code: `code`
   *
   * - Styled (can be nested and contain other elements):
   *   - BoldItalic: ***text*** or ___text___ (highest precedence)
   *   - Bold: **text** or __text__
   *   - Italic: *text* or _text_
   *   - Strikethrough: ~~text~~
   *   - Highlight: ==text==
   *   - Subscript: ~text~
   *   - Superscript: ^text^
   *
   * Precedence Rules:
   * - Atomic elements always take precedence over styled elements
   * - Longer markers take precedence over shorter ones (*** before **)
   * - Earlier positions in text take precedence for same-length markers
   *
   * @param {string} text - Raw inline markdown text to parse. Can contain
   *   any combination of supported inline syntax.
   *
   * @returns {Array} Array of inline token objects. Each token has:
   *   - type: Element type (text, bold, italic, link, image, etc.)
   *   - content: Either string content or array of nested tokens
   *   - Additional properties for specific types (href, src, alt, etc.)
   *
   * @example
   * tokenizeInline("**Bold *italic* text** with [link](url)")
   * // Returns complex nested structure representing the formatting hierarchy
   */
  function tokenizeInline(text) {
    const inlineTokens = [];
    if (!text) return inlineTokens;

    const ESCAPE_CHAR = "\0"; // null char as unique safe placeholder
    const escapedChars = [];

    let processedText = "";
    for (let i = 0; i < text.length; i++) {
      if (text[i] === "\\") {
        // Next char escaped
        if (i + 1 < text.length) {
          escapedChars.push(text[i + 1]);
          processedText += ESCAPE_CHAR; // One placeholder per escaped char
          i++; // skip next char because escaped
        } else {
          // Trailing backslash, keep as is
          processedText += "\\";
        }
      } else {
        processedText += text[i];
      }
    }

    // Helper function: given a text segment possibly containing ESCAPE_CHAR(s)
    function splitEscapesToTokens(s) {
      const result = [];
      for (let i = 0; i < s.length; i++) {
        if (s[i] === ESCAPE_CHAR) {
          const ch = escapedChars.shift();
          result.push({ type: "text", content: ch });
        } else {
          // Accumulate consecutive normal chars to reduce tokens
          let start = i;
          while (i < s.length && s[i] !== ESCAPE_CHAR) i++;
          i--;
          const normalText = s.slice(start, i + 1);
          result.push({ type: "text", content: normalText });
        }
      }
      return result;
    }

    // Regex patterns for "atomic" inline elements that can't be nested inside others
    const atomicPatterns = [
      { type: "image", regex: /!\[([^\]]*)\]\(([^)]+)\)/g },
      { type: "link", regex: /\[([^\]]+)\]\(([^)]+)\)/g },
      { type: "code", regex: /`([^`]+)`/g },
    ];

    // Markers for styled inline elements, ordered by precedence (longest first)
    const styledMarkers = [
      { type: "boldItalic", markers: ["***", "___"] },
      { type: "bold", markers: ["**", "__"] },
      { type: "italic", markers: ["*", "_"] },
      { type: "strikethrough", markers: ["~~"] },
      { type: "highlight", markers: ["=="] },
      { type: "subscript", markers: ["~"] },
      { type: "superscript", markers: ["^"] },
    ];

    const stack = [{ remainingText: processedText, tokens: inlineTokens }];

    // Loop while there are frames to process on stack
    while (stack.length > 0) {
      const frame = stack.pop();
      let str = frame.remainingText;
      const tokensArr = frame.tokens;

      while (str.length > 0) {
        let earliestAtomic = null;

        // Find earliest atomic match (image, link, or code)
        for (const { type, regex } of atomicPatterns) {
          regex.lastIndex = 0;
          const match = regex.exec(str);
          if (match) {
            if (!earliestAtomic || match.index < earliestAtomic.index) {
              earliestAtomic = { type, match, index: match.index };
            }
          }
        }

        let earliestStyled = null;

        // Find earliest styled marker pair with matching start/end markers
        for (const { type, markers } of styledMarkers) {
          for (const marker of markers) {
            const startIndex = str.indexOf(marker);
            if (startIndex !== -1) {
              // Ensure closing marker exists and handle empty content for subscript/superscript
              const endIndex = str.indexOf(marker, startIndex + marker.length);
              if (endIndex !== -1) {
                if (type === "strikethrough" && marker !== "~~") continue;
                const innerLength = endIndex - (startIndex + marker.length);
                if (
                  (type === "subscript" || type === "superscript") &&
                  innerLength === 0
                )
                  continue;
                if (!earliestStyled || startIndex < earliestStyled.startIndex) {
                  earliestStyled = { type, marker, startIndex, endIndex };
                }
              }
            }
          }
        }

        // Determine which matched element comes first
        let earliestMatch = null;
        if (earliestAtomic && earliestStyled) {
          earliestMatch =
            earliestAtomic.index <= earliestStyled.startIndex
              ? earliestAtomic
              : earliestStyled;
        } else {
          earliestMatch = earliestAtomic || earliestStyled;
        }

        // No more markdown patterns found, push remaining text as plain text
        if (!earliestMatch) {
          if (str.length > 0) {
            // Instead of pushing one big text token, split escaped characters back
            const tokensWithEscapes = splitEscapesToTokens(str);
            tokensArr.push(...tokensWithEscapes);
          }
          break;
        }

        // Determine preText differently for atomic vs styled
        const preText =
          earliestMatch.type === "link" ||
          earliestMatch.type === "image" ||
          earliestMatch.type === "code"
            ? str.slice(0, earliestMatch.index)
            : str.slice(0, earliestMatch.startIndex);

        if (preText.length > 0) {
          const tokensWithEscapes = splitEscapesToTokens(preText);
          tokensArr.push(...tokensWithEscapes);
        }

        // Handle the earliest matched inline element by type
        if (earliestMatch.type === "image") {
          tokensArr.push({
            type: "image",
            alt: earliestMatch.match[1],
            src: earliestMatch.match[2],
          });
          // Remove parsed text from str and continue
          str = str.slice(earliestMatch.index + earliestMatch.match[0].length);
        } else if (earliestMatch.type === "link") {
          const linkText = earliestMatch.match[1];
          const href = earliestMatch.match[2];
          // Create a link token, parse its text content
          const linkToken = { type: "link", content: [], href };
          tokensArr.push(linkToken);
          str = str.slice(earliestMatch.index + earliestMatch.match[0].length);
          // Push current remaining str back to stack to continue parsing after the link
          stack.push({ remainingText: str, tokens: tokensArr });
          // Parse link text content next
          stack.push({ remainingText: linkText, tokens: linkToken.content });
          stack.push({ remainingText: linkText, tokens: linkToken.content });
        } else if (earliestMatch.type === "code") {
          tokensArr.push({
            type: "code",
            content: earliestMatch.match[1],
          });
          str = str.slice(earliestMatch.index + earliestMatch.match[0].length);
        } else {
          // styled inline formatting: bold, italic, strikethrough, subscript, superscript (with nested content)
          const { marker, startIndex, endIndex, type } = earliestMatch;
          const innerText = str.slice(startIndex + marker.length, endIndex);
          const styledToken = { type, content: [] };
          tokensArr.push(styledToken);
          // Remove processed styled token text from str
          str = str.slice(endIndex + marker.length);
          stack.push({ remainingText: str, tokens: tokensArr });
          // Parse inner styled content next
          stack.push({ remainingText: innerText, tokens: styledToken.content });
        }
      }
    }

    return inlineTokens;
  }

  /**
   * Parse consecutive list lines (ordered or unordered) including nested via indentation.
   *
   * @param {string[]} lines - Array of lines in input
   * @param {number} startIndex - Line to start parsing from
   * @param {boolean} ordered - whether we're parsing ordered list (true) or unordered (false)
   * @returns {Object} - { listToken, endIndex }
   */
  function parseNestedList(lines, startIndex, ordered) {
    const listToken = {
      megaType: "list",
      ordered: ordered,
      items: [],
    };

    // Stack to keep track of current list and indentation level
    // Each element: { indent, token } where token is a list token (olist/list)
    const stack = [];

    // Helper to determine indentation (count spaces before marker)
    const getIndent = (line) => {
      const match = line.match(/^(\s*)/);
      return match ? match[1].length : 0;
    };

    // Regex to parse list item line and get content
    const itemRegex = ordered
      ? /^(\s*)(\d+)\.\s+(.*)$/
      : /^(\s*)([-*+])\s+(.*)$/;

    let i = startIndex;

    while (i < lines.length) {
      const line = lines[i];
      if (!line.trim()) {
        // blank line ends list block
        break;
      }

      const m = line.match(itemRegex);
      if (!m) {
        break; // not a list item line
      }

      const indent = m[1].length;
      const content = m[3];

      // Create list item token with inline content
      const newItem = { content: tokenizeInline(content), items: [] };

      // Find position in stack for current indent
      while (stack.length > 0 && indent <= stack[stack.length - 1].indent) {
        stack.pop();
      }

      if (stack.length === 0) {
        // Top level item
        listToken.items.push(newItem);
        stack.push({ indent, token: newItem });
      } else {
        // Nested list item
        const parentItem = stack[stack.length - 1].token;
        if (!parentItem.items) {
          parentItem.items = [];
        }
        parentItem.items.push(newItem);
        stack.push({ indent, token: newItem });
      }

      i++;
    }

    // Clean up items without nested items property for simplicity
    function cleanItems(items) {
      for (const item of items) {
        if (item.items && item.items.length === 0) {
          delete item.items;
        } else if (item.items) {
          cleanItems(item.items);
        }
      }
    }
    cleanItems(listToken.items);

    return { listToken, endIndex: i - 1 };
  }

  /**
   * Processes blockquote content by cleaning markers and delegating to iterative parser.
   *
   * This function handles the common blockquote pattern where lines begin with '>'.
   * It performs the necessary cleanup and delegates to the iterative parser to
   * avoid recursion while still supporting nested markdown within blockquotes.
   *
   * Process:
   * 1. Remove '> ' prefix from each line
   * 2. Rejoin lines to reform multiline content
   * 3. Parse the cleaned content using iterative algorithm
   *
   * @param {Array<string>} blockquoteLines - Array of lines that start with '>'
   *   marker. May include empty lines and lines with various content.
   *
   * @returns {Array} Array of parsed token objects representing the blockquote
   *   content. Can include any block elements (headings, paragraphs, lists, etc.)
   *
   * @example
   * const lines = ['> # Header', '> Some text', '> - List item'];
   * tokenizeBlockquoteLines(lines);
   * // Returns tokens for header, paragraph, and list within blockquote
   */
  function tokenizeBlockquoteLines(blockquoteLines) {
    // Strip the blockquote marker '> ' from each line (with optional space)
    const blockquoteContent = blockquoteLines
      .map((line) => line.replace(/^>\s?/, ""))
      .join("\n");
    // Process the cleaned content using the iterative helper to avoid recursion
    return tokenizeUserInputIterative(blockquoteContent);
  }

  /**
   * Iterative parser for multiline markdown content without recursion.
   *
   * This function duplicates the main block parsing logic but avoids recursion
   * to prevent stack overflow when parsing nested blockquotes or complex content.
   * It's specifically designed for parsing content within blockquotes.
   *
   * Supported block elements:
   * - Headers (# ## ### etc.)
   * - Ordered and unordered lists
   * - Task lists with checkboxes
   * - Horizontal rules
   * - Paragraphs
   * - Nested blockquotes (rendered as paragraphs to avoid recursion)
   *
   * @param {string} multilineInput - Multiline string inside blockquote.
   * @returns {Array} tokens - Parsed tokens.
   */
  function tokenizeUserInputIterative(multilineInput) {
    const innerLines = multilineInput.split("\n");
    const innerTokens = [];
    let idx = 0;

    while (idx < innerLines.length) {
      const line = innerLines[idx];
      const trimmed = line.trim();

      if (trimmed.length === 0) {
        idx++;
        continue; // Skip empty lines
      }

      // Horizontal rule (3 or more repeated *, -, or _)
      if (/^([*\-_])\1{2,}$/.test(trimmed)) {
        innerTokens.push({ megaType: "horizontalRule" });
        idx++;
        continue;
      }

      // Nested blockquotes in blockquotes parsed as paragraphs with inline tokens (no recursion)
      if (/^>\s?/.test(trimmed)) {
        innerTokens.push({
          megaType: "paragraph",
          content: tokenizeInline(trimmed.replace(/^>\s?/, "")),
        });
        idx++;
        continue;
      }

      // Ordered lists (lines starting with number and dot)
      if (/^\d+\.\s+/.test(trimmed)) {
        const items = [];
        while (idx < innerLines.length) {
          const l = innerLines[idx].trim();
          const m = l.match(/^(\d+)\.\s+(.*)$/);
          if (!m) break;
          items.push(tokenizeInline(m[2]));
          idx++;
        }
        innerTokens.push({ megaType: "olist", items });
        continue;
      }

      // Unordered lists (lines starting with '-' or '*')
      if (/^[-*]\s+/.test(trimmed)) {
        const items = [];
        while (idx < innerLines.length) {
          const l = innerLines[idx].trim();
          const m = l.match(/^([-*])\s+(.*)$/);
          if (!m) break;
          items.push(tokenizeInline(m[2]));
          idx++;
        }
        innerTokens.push({ megaType: "list", items });
        continue;
      }

      // Headings (1 to 6 # characters)
      const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        innerTokens.push({
          megaType: "heading",
          level,
          content: tokenizeInline(headingMatch[2]),
        });
        idx++;
        continue;
      }

      // Default to paragraph block with inline tokens
      innerTokens.push({
        megaType: "paragraph",
        content: tokenizeInline(trimmed),
      });

      idx++;
    }

    return innerTokens;
  }

  // ----------------------- MAIN BLOCK PARSING LOOP -------------------------
  // This is the core parsing loop that processes markdown line by line to identify
  // and parse block-level elements. The order of checks is important for proper
  // precedence (e.g., code blocks before lists, task lists before regular lists).
  //
  // Processing Order (by precedence):
  // 1. Fenced code blocks (``` blocks)
  // 2. Horizontal rules (--- *** ___)
  // 3. Blockquotes (> text)
  // 4. Task lists (- [ ] and - [x])
  // 5. Ordered lists (1. 2. 3.)
  // 6. Unordered lists (- *)
  // 7. Headers (# ## ###)
  // 8. Tables (| col | col |)
  // 9. Paragraphs (fallback)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.length === 0) continue; // Skip empty lines

    // Fenced code block: line starting with ```
    const fencedStartMatch = trimmed.match(/^\`\`\`(\w*)\s*$/);
    if (fencedStartMatch) {
      const language = fencedStartMatch[1] || "";
      const codeLines = [];
      let j = i + 1;
      while (j < lines.length && !/^\`\`\`\s*$/.test(lines[j].trim())) {
        codeLines.push(lines[j]);
        j++;
      }
      if (j < lines.length && /^\`\`\`\s*$/.test(lines[j].trim())) {
        j++; // skip closing fence
      }
      i = j - 1; // adjust loop index
      const codeContent = codeLines.join("\n");
      tokens.push({
        megaType: "codeBlock",
        content: codeContent,
        language: language || "",
      });
      continue;
    }

    // Detect horizontal rule - line with 3 or more same characters *, -, or _
    if (/^([*\-_])\1{2,}$/.test(trimmed)) {
      tokens.push({ megaType: "horizontalRule" });
      continue;
    }

    // Blockquote lines start with '>'
    if (/^>\s?/.test(trimmed)) {
      // Collect all consecutive blockquote lines to form blockquote content
      const blockquoteLines = [];
      let j = i;
      while (j < lines.length) {
        const l = lines[j];
        if (/^>/.test(l.trim()) || l.trim() === "") {
          blockquoteLines.push(l);
          j++;
        } else {
          break;
        }
      }
      // Tokenize the collected blockquote lines
      const content = tokenizeBlockquoteLines(blockquoteLines);
      // Push tokens with megaType "blockquote"
      tokens.push({ megaType: "blockquote", content });
      i = j - 1; // Advance line index to end of blockquote
      continue;
    }

    // Task list, before lists
    const taskListItemMatch = trimmed.match(/^([-*])\s+\[( |x|X)\]\s+(.*)$/);
    if (taskListItemMatch) {
      const items = [];
      let j = i;

      while (j < lines.length) {
        const l = lines[j].trim();
        const m = l.match(/^([-*])\s+\[( |x|X)\]\s+(.*)$/);
        if (!m) break;
        const checked = m[2].toLowerCase() === "x";
        // tokenize inline content of the task description
        const contentTokens = tokenizeInline(m[3]);
        items.push({ checked, content: contentTokens });
        j++;
      }

      tokens.push({ megaType: "list", items });
      i = j - 1;
      continue;
    }

    // Ordered list items: lines starting with number + '.'
    if (/^\d+\.\s+/.test(trimmed)) {
      const { listToken, endIndex } = parseNestedList(lines, i, true);
      tokens.push(listToken);
      i = endIndex;
      continue;
    }

    // Unordered list
    if (/^[-*+]\s+/.test(trimmed)) {
      const { listToken, endIndex } = parseNestedList(lines, i, false);
      tokens.push(listToken);
      i = endIndex;
      continue;
    }

    // Headings (# to ###### followed by space and text)
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      tokens.push({
        megaType: "heading",
        level,
        content: tokenizeInline(headingMatch[2]),
      });
      continue;
    }

    // Table
    if (/\|/.test(trimmed)) {
      // Peek next line for separator
      const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : "";
      if (/^\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?$/.test(nextLine)) {
        // Table with header
        const tableHeaderCells = trimmed
          .split("|")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
        const tableRows = [];
        i += 2;
        while (i < lines.length) {
          const rowLine = lines[i].trim();
          if (!rowLine || !rowLine.includes("|")) break; // End of table
          // split row cells similarly
          const rowCells = rowLine
            .split("|")
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
          tableRows.push(rowCells);
          i++;
        }
        // tokenize header cells inline
        const header = tableHeaderCells.map((cell) => tokenizeInline(cell));
        // tokenize each row cell inline
        const rows = tableRows.map((row) =>
          row.map((cell) => tokenizeInline(cell))
        );
        tokens.push({ megaType: "table", header, rows });
        i--;
        continue;
      } else {
        // Table without header - check if next line also has pipes
        const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : "";
        if (nextLine && /\|/.test(nextLine)) {
          const tableRows = [];
          let j = i;
          while (j < lines.length) {
            const rowLine = lines[j].trim();
            if (!rowLine || !rowLine.includes("|")) break; // End of table
            // split row cells
            const rowCells = rowLine
              .split("|")
              .map((s) => s.trim())
              .filter((s) => s.length > 0);
            tableRows.push(rowCells);
            j++;
          }
          // tokenize each row cell inline
          const rows = tableRows.map((row) =>
            row.map((cell) => tokenizeInline(cell))
          );
          tokens.push({ megaType: "table", header: [], rows });
          i = j - 1;
          continue;
        }
      }
    }

    // Default fallthrough: treat line as a paragraph with inline tokens
    tokens.push({
      megaType: "paragraph",
      content: tokenizeInline(trimmed),
    });
  }

  return tokens;
}

export default tokenizeUserInput;
