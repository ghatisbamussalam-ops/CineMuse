
import React from 'react';

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, isStreaming }) => {
  const renderLine = (line: string, index: number) => {
    // Header 2
    if (line.startsWith('## ')) {
      return (
        <h2 key={index} className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300 mt-10 mb-6 pb-2 border-b border-gray-700/50">
          {line.substring(3)}
        </h2>
      );
    }
    // Header 3
    if (line.startsWith('### ')) {
      return (
        <h3 key={index} className="text-xl font-semibold text-cyan-200 mt-6 mb-3 flex items-center gap-2">
           <span className="text-cyan-500 opacity-50 text-sm">✦</span> {line.substring(4)}
        </h3>
      );
    }
    // List Item
     if (line.startsWith('* ') || line.startsWith('- ')) {
      return (
        <li key={index} className="ml-6 list-none relative pl-2 mb-2 text-gray-300">
          <span className="absolute left-[-1.2em] top-[0.6em] w-1.5 h-1.5 rounded-full bg-gray-500"></span>
          {formatText(line.substring(2))}
        </li>
      );
    }
    // Blockquote
    if (line.startsWith('> ')) {
        return (
            <blockquote key={index} className="border-r-4 border-cyan-500/50 bg-gray-900/50 pr-4 py-3 my-6 rounded-l-lg italic text-gray-400 shadow-sm">
                "{formatText(line.substring(2))}"
            </blockquote>
        )
    }
    
    // Empty line
    if (line.trim() === '') {
        return <div key={index} className="h-4"></div>;
    }

    // Paragraph
    return (
      <p key={index} className="mb-4 leading-relaxed text-gray-300/90 text-lg">
        {formatText(line)}
      </p>
    );
  };
  
  const formatText = (text: string) => {
      // Basic bold and italic support
      const parts = text.split(/(\*\*.*?\*\*|_.*?_)/g).filter(Boolean);
      return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="text-cyan-100 font-bold">{part.slice(2,-2)}</strong>;
            }
            if (part.startsWith('_') && part.endsWith('_')) {
                return <em key={i} className="text-gray-200">{part.slice(1,-1)}</em>;
            }
            return part;
        });
  };

  const lines = content.split('\n');

  return (
    <div className="font-serif-ar max-w-none">
      {lines.map(renderLine)}
      {isStreaming && (
        <span className="inline-block w-2 h-5 bg-cyan-500 animate-pulse ml-1 align-middle shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
      )}
    </div>
  );
};

export default MarkdownRenderer;
