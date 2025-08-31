/**
 * Tokenizes a markdown user input string into an array of tokens
 * representing block elements and inline formatting.
 *
 * @param {string} input - The raw markdown-like string input.
 * @returns {Array} tokens - Array of token objects representing the parsed structure.
 */
function tokenizeUserInput(input) {
  const lines = input.split("\n"); // Split input by lines for block-level parsing
  const tokens = [];

  /**
   * Parses inline markdown syntax from a given text string into tokens.
   * This function does iterative parsing without recursion to handle
   * nested styles and atomic elements like links and images.
   *
   * Supported inline elements:
   * - Images: ![alt](src)
   * - Links: [text](href)
   * - Inline code: `code`
   * - BoldItalic: ***text*** or ___text___
   * - Bold: **text** or __text__
   * - Italic: *text* or _text_
   * - Strikethrough: ~~text~~
   * - Subscript: ~text~
   * - Superscript: ^text^
   *
   * @param {string} text - Inline markdown text to parse.
   * @returns {Array} inlineTokens - Array of inline token objects.
   */
  function tokenizeInline(text) {
    const inlineTokens = [];
    if (!text) return inlineTokens;

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
      // Strikethrough: exactly 2 tildes only
      { type: "strikethrough", markers: ["~~"] },
      // Subscript: single tilde marker ~text~
      { type: "subscript", markers: ["~"] },
      // Superscript: single caret markers ^text^
      { type: "superscript", markers: ["^"] },
    ];
    // Stack for iterative parsing of nested inline formatting
    // Each frame holds remaining text to parse and current tokens to push to
    const stack = [{ remainingText: text, tokens: inlineTokens }];

    // Loop while there are frames to process on stack
    while (stack.length > 0) {
      const frame = stack.pop();
      let str = frame.remainingText;
      const tokensArr = frame.tokens;

      while (str.length > 0) {
        let earliestAtomic = null;

        // Find earliest atomic match (image, link, or code)
        for (const { type, regex } of atomicPatterns) {
          regex.lastIndex = 0; // Reset regex state for global search
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
              // Look for corresponding closing marker after start marker
              const endIndex = str.indexOf(marker, startIndex + marker.length);
              if (endIndex !== -1) {
                // Special handling for strikethrough to allow only "~~"
                if (type === "strikethrough" && marker !== "~~") {
                  // skip non "~~" strikethrough
                  continue;
                }
                // For subscript and superscript (single char markers), ensure they are not immediately adjacent (non-empty content)
                const innerLength = endIndex - (startIndex + marker.length);
                if (
                  (type === "subscript" || type === "superscript") &&
                  innerLength === 0
                ) {
                  // empty content, skip
                  continue;
                }
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
            tokensArr.push({ type: "text", content: str });
          }
          break;
        }

        // Push any text before the earliest matched token as plain text
        const preText =
          earliestMatch.type === "link" ||
          earliestMatch.type === "image" ||
          earliestMatch.type === "code"
            ? str.slice(0, earliestMatch.index)
            : str.slice(0, earliestMatch.startIndex);

        if (preText.length > 0) {
          tokensArr.push({ type: "text", content: preText });
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
          // Create a link token, parse its text content recursively
          const linkToken = { type: "link", content: [], href };
          tokensArr.push(linkToken);
          str = str.slice(earliestMatch.index + earliestMatch.match[0].length);
          // Push current remaining str back to stack to continue parsing after the link
          stack.push({ remainingText: str, tokens: tokensArr });
          // Parse link text content next
          stack.push({ remainingText: linkText, tokens: linkToken.content });
          break; // Break to process the stack
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
          // Push current remaining str back to stack for later processing
          stack.push({ remainingText: str, tokens: tokensArr });
          // Parse inner styled content next
          stack.push({ remainingText: innerText, tokens: styledToken.content });
          break; // Break to process next stack frame
        }
      }
    }

    return inlineTokens;
  }

  /**
   * Tokenizes blockquote lines into tokens by stripping leading '>' characters,
   * then parsing their content via the main tokenizer helper without recursion.
   * This breaks recursion cycles and handles blockquotes properly.
   *
   * @param {Array<string>} blockquoteLines - Lines starting with '>'.
   * @returns {Array} tokens - Parsed tokens inside the blockquote.
   */
  function tokenizeBlockquoteLines(blockquoteLines) {
    // Remove leading blockquote marker '> ' from each line and join back
    const blockquoteContent = blockquoteLines
      .map((line) => line.replace(/^>\s?/, ""))
      .join("\n");
    // Tokenize blockquote content with the iterative helper (no recursion)
    return tokenizeUserInputIterative(blockquoteContent);
  }

  /**
   * Iterative helper to tokenize multiline input, like blockquote content,
   * avoiding recursion by copying main block parsing logic.
   *
   * Supports the same block types (headings, lists, paragraphs, hr, blockquotes)
   * but parses blockquotes inline without recursive calls.
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
        innerTokens.push({ megaType: "hr" });
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
  // Iterate through each line of input to detect block elements and parse them
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.length === 0) continue; // Skip empty lines

    // Detect horizontal rule - line with 3 or more same characters *, -, or _
    if (/^([*\-_])\1{2,}$/.test(trimmed)) {
      tokens.push({ megaType: "hr" });
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

    // Ordered list items: lines starting with number + '.'
    if (/^\d+\.\s+/.test(trimmed)) {
      const items = [];
      let j = i;
      while (j < lines.length) {
        const l = lines[j].trim();
        const m = l.match(/^(\d+)\.\s+(.*)$/);
        if (!m) break;
        items.push(tokenizeInline(m[2]));
        j++;
      }
      tokens.push({ megaType: "olist", items });
      i = j - 1;
      continue;
    }

    // Unordered list items: lines starting with '-' or '*'
    if (/^[-*]\s+/.test(trimmed)) {
      const items = [];
      let j = i;
      while (j < lines.length) {
        const l = lines[j].trim();
        const m = l.match(/^([-*])\s+(.*)$/);
        if (!m) break;
        items.push(tokenizeInline(m[2]));
        j++;
      }
      tokens.push({ megaType: "list", items });
      i = j - 1;
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

    // Default fallthrough: treat line as a paragraph with inline tokens
    tokens.push({
      megaType: "paragraph",
      content: tokenizeInline(trimmed),
    });
  }

  return tokens;
}

export default tokenizeUserInput;
