import React from 'react';
import { User, Bot, FileText, Plus, Edit3 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

interface FileOperation {
  type: 'create' | 'update';
  path: string;
  fileName: string;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  // Parse file operations from message content
  const parseFileOperations = (content: string): FileOperation[] => {
    const operations: FileOperation[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      // Look for file creation/update indicators
      if (line.includes('📝 **') && line.includes('**')) {
        const match = line.match(/📝 \*\*(Creating|Updating)\/updating \*\*(.+?)\*\*/);
        if (match) {
          const [, action, fileName] = match;
          operations.push({
            type: action.toLowerCase().includes('creat') ? 'create' : 'update',
            path: fileName,
            fileName: fileName.split('/').pop() || fileName
          });
        }
      }
    }
    
    return operations;
  };

  // Clean content for markdown rendering (remove file operation indicators)
  const cleanContentForMarkdown = (content: string): string => {
    return content
      .replace(/📝 \*\*(Creating|Updating)\/updating \*\*(.+?)\*\*/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const fileOperations = parseFileOperations(message.content);
  const cleanContent = cleanContentForMarkdown(message.content);

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-blue-600' : 'bg-gray-600'
      }`}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      
      <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
        {/* File Operations Indicators */}
        {fileOperations.length > 0 && !isUser && (
          <div className={`mb-3 flex gap-2 ${isUser ? 'justify-end' : 'justify-start'} flex-wrap`}>
            {fileOperations.map((op, index) => (
              <div
                key={index}
                className="group relative inline-flex items-center gap-2 px-3 py-1.5 bg-green-600/20 border border-green-500/30 rounded-full text-green-400 text-xs font-medium hover:bg-green-600/30 transition-colors cursor-default"
                title={op.path}
              >
                <div className="flex items-center gap-1.5">
                  {op.type === 'create' ? (
                    <Plus size={12} className="text-green-400" />
                  ) : (
                    <Edit3 size={12} className="text-blue-400" />
                  )}
                  <FileText size={12} />
                  <span>{op.fileName}</span>
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {op.type === 'create' ? 'Creating' : 'Updating'}: {op.path}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Message Content */}
        <div className={`inline-block max-w-full p-3 rounded-lg ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-700 text-gray-100'
        }`}>
          {isUser ? (
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.content}
            </div>
          ) : (
            <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Custom styling for markdown elements
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
                    <blockquote className="border-l-4 border-blue-500 pl-3 italic text-gray-300 mb-2">
                      {children}
                    </blockquote>
                  ),
                  a: ({ href, children }) => (
                    <a 
                      href={href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline"
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
                {cleanContent}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}