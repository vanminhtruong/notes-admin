import React from 'react';
import './editor.css';

interface RichTextContentProps {
  content: string;
  className?: string;
}

/**
 * Component to safely render rich text HTML content
 */
const RichTextContent: React.FC<RichTextContentProps> = ({ content, className = '' }) => {
  if (!content) return null;

  return (
    <div 
      className={`prose prose-sm dark:prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default RichTextContent;
