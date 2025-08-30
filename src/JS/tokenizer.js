function tokeniseUserInput(input) {
  const lines = input.split('\n');
  const tokens = [];

  function tokenizeInline(text) {
    const inlineTokens = [];
    let pos = 0;

    // Regex patterns for inline tokens
    const patterns = [
      // Bold Italic: ***text*** or ___text___ (using * or _ three times)
      { type: 'boldItalic', regex: /(\*\*\*|___)(.+?)\1/g },
      // Bold: **text** or __text__
      { type: 'bold', regex: /(\*\*|__)(.+?)\1/g },
      // Italic: *text* or _text_
      { type: 'italic', regex: /(\*|_)(.+?)\1/g },
      // Link: [text](href)
      { type: 'link', regex: /\[([^\]]+)\]\(([^)]+)\)/g },
      // Image: ![alt](src)
      { type: 'image', regex: /!\[([^\]]*)\]\(([^)]+)\)/g },
    ];

    while (pos < text.length) {
      let closestMatch = null;
      let closestIndex = text.length;

      for (const { type, regex } of patterns) {
        regex.lastIndex = pos;
        const match = regex.exec(text);
        if (match && match.index < closestIndex) {
          closestMatch = { type, match };
          closestIndex = match.index;
        }
      }

      if (!closestMatch) {
        inlineTokens.push({ type: 'text', content: text.slice(pos) });
        break;
      }

      if (closestIndex > pos) {
        inlineTokens.push({ type: 'text', content: text.slice(pos, closestIndex) });
      }

      const { type, match } = closestMatch;

      switch (type) {
        case 'boldItalic':
          inlineTokens.push({ type: 'boldItalic', content: match[2] });
          break;

        case 'bold':
          inlineTokens.push({ type: 'bold', content: match[2] });
          break;

        case 'italic':
          inlineTokens.push({ type: 'italic', content: match[2] });
          break;

        case 'link':
          inlineTokens.push({ type: 'link', content: match[1], href: match[2] });
          break;

        case 'image':
          inlineTokens.push({ type: 'image', alt: match[1], src: match[2] });
          break;
      }

      pos = match.index + match[0].length;
    }

    return inlineTokens;
  }

  for (const line of lines) {
    let trimmed = line.trim();
    if (trimmed.length === 0) continue;

    let headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = headingMatch[2];
      tokens.push({
        megaType: 'heading',
        level,
        content: tokenizeInline(content),
      });
    } else {
      tokens.push({
        megaType: 'paragraph',
        content: tokenizeInline(trimmed),
      });
    }
  }

  return tokens;
}

export default tokeniseUserInput;
