function tokenizeUserInput(input) {
  const lines = input.split('\n');
  const tokens = [];

  function tokenizeInline(text) {
    const inlineTokens = [];
    let pos = 0;

    const patterns = [
      { type: 'boldItalic', regex: /(\*\*\*|___)(.+?)\1/g },
      { type: 'bold', regex: /(\*\*|__)(.+?)\1/g },
      { type: 'italic', regex: /(\*|_)(.+?)\1/g },
      { type: 'strikethrough', regex: /~{1,2}(.+?)~{1,2}/g },
      { type: 'link', regex: /\[([^\]]+)\]\(([^)]+)\)/g },
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
        case 'strikethrough':
          inlineTokens.push({ type: 'strikethrough', content: match[1] });
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

  function consumeUnorderedList(startIndex) {
    const items = [];
    let i = startIndex;

    while (i < lines.length) {
      const line = lines[i].trim();
      const match = line.match(/^([-*])\s+(.*)$/);
      if (!match) break;
      items.push(tokenizeInline(match[2]));
      i++;
    }
    return { items, endIndex: i };
  }

  function consumeOrderedList(startIndex) {
    const items = [];
    let i = startIndex;

    while (i < lines.length) {
      const line = lines[i].trim();
      const match = line.match(/^(\d+)\.\s+(.*)$/);
      if (!match) break;
      items.push(tokenizeInline(match[2]));
      i++;
    }
    return { items, endIndex: i };
  }

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let trimmed = line.trim();
    if (trimmed.length === 0) continue;

    if (/^([*\-_])\1{2,}$/.test(trimmed)) {
      tokens.push({
        megaType: 'hr',
      });
      continue;
    }

    let blockQuoteMatch = trimmed.match(/^>\s?(.*)$/);
    if (blockQuoteMatch) {
      tokens.push({
        megaType: 'blockquote',
        content: tokenizeInline(blockQuoteMatch[1]),
      });
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const { items, endIndex } = consumeOrderedList(i);
      tokens.push({
        megaType: 'olist',
        items,
      });
      i = endIndex - 1;
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const { items, endIndex } = consumeUnorderedList(i);
      tokens.push({
        megaType: 'list',
        items,
      });
      i = endIndex - 1;
      continue;
    }

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

export default tokenizeUserInput;
