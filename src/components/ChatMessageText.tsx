import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageTextProps {
  content: string;
}

export function ChatMessageText({ content }: ChatMessageTextProps) {
  if (!content.trim()) return null;

  return (
    <div className="inline-block max-w-full p-3 rounded-lg bg-gray-700 text-gray-100">
      <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-white">{children}</h1>,
            h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-white">{children}</h2>,
            h3: ({ children }) => <h3 className="text-sm font-bold mb-1 text-white">{children}</h3>,
            p: ({ children }) => <p className="mb-2 last:mb-0 text-gray-100">{children}</p>,
            code: ({ inline, children }) => 
              inline ? (
                <code className="bg-gray-800 px-1.5 py-0.5 rounded text-xs font-mono text-green-400">
                  {children}
                </code>
              ) : (
                <code className="block bg-gray-800 p-2 rounded text-xs font-mono text-green-400 overflow-x-auto">
                  {children}
                </code>
              ),
            pre: ({ children }) => (
              <pre className="bg-gray-800 p-3 rounded-lg overflow-x-auto mb-2">
                {children}
              </pre>
            ),
            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
            li: ({ children }) => <li className="text-gray-100">{children}</li>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-purple-500 pl-3 italic text-gray-300 mb-2">
                {children}
              </blockquote>
            ),
            a: ({ href, children }) => (
              <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 underline"
              >
                {children}
              </a>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto mb-2">
                <table className="min-w-full border border-gray-600 rounded">
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className="border border-gray-600 px-2 py-1 bg-gray-800 text-left font-medium">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border border-gray-600 px-2 py-1">
                {children}
              </td>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}