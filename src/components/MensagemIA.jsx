import React from 'react';
import { parseMarkdown, parseInlineMarkdown } from '../utils/markdownParser';

function MensagemIA({ conteudo, carregando }) {
  if (!conteudo && carregando) {
    return (
      <div className="loading-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    );
  }

  if (!conteudo) {
    return null;
  }

  const elements = parseMarkdown(conteudo);

  const renderInline = (text) => {
    const parts = parseInlineMarkdown(text);
    return parts.map((part, idx) => {
      switch (part.type) {
        case 'strong':
          return <strong key={idx} className="markdown-strong">{part.content}</strong>;
        case 'em':
          return <em key={idx} className="markdown-em">{part.content}</em>;
        case 'code':
          return <code key={idx} className="markdown-code-inline">{part.content}</code>;
        case 'link':
          return (
            <a key={idx} href={part.url} className="markdown-link" target="_blank" rel="noopener noreferrer">
              {part.content}
            </a>
          );
        default:
          return <span key={idx}>{part.content}</span>;
      }
    });
  };

  return (
    <div className="conteudo-markdown">
      {elements.map((element, idx) => {
        switch (element.type) {
          case 'paragraph':
            return (
              <p key={idx} className="markdown-paragraph">
                {renderInline(element.content)}
              </p>
            );
          case 'h1':
            return (
              <h1 key={idx} className="markdown-h1">
                {renderInline(element.content)}
              </h1>
            );
          case 'h2':
            return (
              <h2 key={idx} className="markdown-h2">
                {renderInline(element.content)}
              </h2>
            );
          case 'h3':
            return (
              <h3 key={idx} className="markdown-h3">
                {renderInline(element.content)}
              </h3>
            );
          case 'list':
            return (
              <ul key={idx} className="markdown-list">
                {element.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="markdown-list-item">
                    {renderInline(item)}
                  </li>
                ))}
              </ul>
            );
          case 'code':
            return (
              <pre key={idx} className="markdown-pre">
                <code className="markdown-code-block">{element.content}</code>
              </pre>
            );
          case 'blockquote':
            return (
              <blockquote key={idx} className="markdown-blockquote">
                {renderInline(element.content)}
              </blockquote>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

export default MensagemIA;
