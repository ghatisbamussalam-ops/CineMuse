
import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const renderLine = (line: string, index: number) => {
    if (line.startsWith('## ')) {
      return (
        <h2 key={index} className="text-2xl font-bold text-cyan-300 mt-6 mb-3 border-b-2 border-cyan-700 pb-2">
          {line.substring(3)}
        </h2>
      );
    }
    if (line.startsWith('### ')) {
      return (
        <h3 key={index} className="text-xl font-semibold text-cyan-400 mt-4 mb-2">
          {line.substring(4)}
        </h3>
      );
    }
     if (line.startsWith('* ')) {
      return (
        <li key={index} className="ml-6 list-disc">
          {line.substring(2)}
        </li>
      );
    }
    if (line.trim() === '') {
        return <br key={index} />;
    }

    // Basic bold and italic support
    const parts = line.split(/(\*\*.*?\*\*|_.*?_)/g).filter(Boolean);
    
    return (
      <p key={index} className="mb-4 leading-relaxed">
        {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i}>{part.slice(2,-2)}</strong>;
            }
            if (part.startsWith('_') && part.endsWith('_')) {
                return <em key={i}>{part.slice(1,-1)}</em>;
            }
            return part;
        })}
      </p>
    );
  };

  const lines = content.split('\n');

  return (
    <div className="prose prose-invert max-w-none text-gray-300">
      {lines.map(renderLine)}
    </div>
  );
};

export default MarkdownRenderer;
