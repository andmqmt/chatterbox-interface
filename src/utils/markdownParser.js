function parseMarkdown(text) {
  if (!text) return [];

  const lines = text.split('\n');
  const elements = [];
  let currentParagraph = [];
  let inCodeBlock = false;
  let codeBlockContent = [];
  let codeBlockLanguage = '';

  function flushParagraph() {
    if (currentParagraph.length > 0) {
      elements.push({
        type: 'paragraph',
        content: currentParagraph.join(' ')
      });
      currentParagraph = [];
    }
  }

  function flushCodeBlock() {
    if (codeBlockContent.length > 0) {
      elements.push({
        type: 'code',
        language: codeBlockLanguage,
        content: codeBlockContent.join('\n')
      });
      codeBlockContent = [];
      codeBlockLanguage = '';
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock();
        inCodeBlock = false;
      } else {
        flushParagraph();
        inCodeBlock = true;
        codeBlockLanguage = line.substring(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(lines[i]);
      continue;
    }

    if (line.startsWith('# ')) {
      flushParagraph();
      elements.push({
        type: 'h1',
        content: line.substring(2)
      });
      continue;
    }

    if (line.startsWith('## ')) {
      flushParagraph();
      elements.push({
        type: 'h2',
        content: line.substring(3)
      });
      continue;
    }

    if (line.startsWith('### ')) {
      flushParagraph();
      elements.push({
        type: 'h3',
        content: line.substring(4)
      });
      continue;
    }

    if (line.startsWith('- ') || line.startsWith('* ') || /^\d+\.\s/.test(line)) {
      flushParagraph();
      const listItems = [];
      let j = i;
      while (j < lines.length && (lines[j].trim().startsWith('- ') || lines[j].trim().startsWith('* ') || /^\d+\.\s/.test(lines[j].trim()))) {
        listItems.push(lines[j].trim().replace(/^[-*]\s|^\d+\.\s/, ''));
        j++;
      }
      i = j - 1;
      elements.push({
        type: 'list',
        items: listItems
      });
      continue;
    }

    if (line.startsWith('> ')) {
      flushParagraph();
      elements.push({
        type: 'blockquote',
        content: line.substring(2)
      });
      continue;
    }

    if (line === '') {
      flushParagraph();
      continue;
    }

    currentParagraph.push(line);
  }

  flushParagraph();
  flushCodeBlock();

  return elements;
}

function parseInlineMarkdown(text) {
  if (!text) return [{ type: 'text', content: '' }];

  const parts = [];
  let i = 0;

  while (i < text.length) {
    const remaining = text.substring(i);

    const strongMatch = remaining.match(/^\*\*(.*?)\*\*/);
    if (strongMatch) {
      parts.push({ type: 'strong', content: strongMatch[1] });
      i += strongMatch[0].length;
      continue;
    }

    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      parts.push({ type: 'link', content: linkMatch[1], url: linkMatch[2] });
      i += linkMatch[0].length;
      continue;
    }

    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      parts.push({ type: 'code', content: codeMatch[1] });
      i += codeMatch[0].length;
      continue;
    }

    const emMatch = remaining.match(/^\*([^*\n]+?)\*(?!\*)/);
    if (emMatch) {
      parts.push({ type: 'em', content: emMatch[1] });
      i += emMatch[0].length;
      continue;
    }

    let nextSpecial = text.length;
    const patterns = [
      text.indexOf('**', i),
      text.indexOf('[', i),
      text.indexOf('`', i),
      text.indexOf('*', i)
    ].filter(pos => pos !== -1 && pos >= i);

    if (patterns.length > 0) {
      nextSpecial = Math.min(...patterns);
    }

    if (i < nextSpecial) {
      const textContent = text.substring(i, nextSpecial);
      if (textContent) {
        parts.push({ type: 'text', content: textContent });
      }
      i = nextSpecial;
    } else {
      parts.push({ type: 'text', content: remaining });
      break;
    }
  }

  if (parts.length === 0) {
    return [{ type: 'text', content: text }];
  }

  return parts;
}

export { parseMarkdown, parseInlineMarkdown };

