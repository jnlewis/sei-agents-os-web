import React from 'react';
import { User, Bot, FileText, Plus, Edit3 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

interface MessageSegment {
  type: 'text' | 'file-operations';
  content: string;
  operations?: Array<{
    type: 'create' | 'replace' | 'delete';
    path: string;
    fileName: string;
  }>;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  // Parse message content into segments with inline file operations
  const parseMessageSegments = (content: string): MessageSegment[] => {
    const segments: MessageSegment[] = [];
    
    // Split content by Artifact/Action tags to create segments
    const artifactRegex = /<(?:Artifact[^>]*>|Action[^>]*>)/g;
    const operationRegex = /📝 \*\*(Creating|Updating|Deleting|Modifying)\*\* (.+?)(?:\n|$)/g;
    
    let lastIndex = 0;
    let match;
    
    // Find all file operation indicators and their positions
    const operations: Array<{ index: number; operation: any }> = [];
    while ((match = operationRegex.exec(content)) !== null) {
      const [fullMatch, action, filePath] = match;
      operations.push({
        index: match.index,
        operation: {
          type: action.toLowerCase().includes('creat') ? 'create' : 
                action.toLowerCase().includes('delet') ? 'delete' : 'replace',
          path: filePath.trim(),
          fileName: filePath.split('/').pop() || filePath,
          fullMatch
        }
      });
    }
    
    // Create segments based on operation positions
    operations.forEach((op, index) => {
      // Add text before this operation
      if (op.index > lastIndex) {
        const textContent = content.slice(lastIndex, op.index).trim();
        if (textContent) {
          segments.push({
            type: 'text',
            content: textContent
          });
        }
      }
      
      // Group consecutive operations together
      const consecutiveOps = [op.operation];
      let nextIndex = index + 1;
      let endIndex = op.index + op.operation.fullMatch.length;
      
      while (nextIndex < operations.length) {
        const nextOp = operations[nextIndex];
        const betweenContent = content.slice(endIndex, nextOp.index).trim();
        
        // If there's only whitespace between operations, group them
        if (!betweenContent || betweenContent.match(/^\s*$/)) {
          consecutiveOps.push(nextOp.operation);
          endIndex = nextOp.index + nextOp.operation.fullMatch.length;
          nextIndex++;
        } else {
          break;
        }
      }
      
      // Add file operations segment
      segments.push({
        type: 'file-operations',
        content: '',
        operations: consecutiveOps
      });
      
      lastIndex = endIndex;
      
      // Skip the operations we've already processed
      while (index + 1 < operations.length && index + 1 < nextIndex) {
        index++;
      }
    });
    
    // Add remaining text after last operation
    if (lastIndex < content.length) {
      const remainingContent = content.slice(lastIndex).trim();
      if (remainingContent) {
        segments.push({
          type: 'text',
          content: remainingContent
        });
      }
    }
    
    // If no operations found, return the entire content as text
    if (segments.length === 0) {
      segments.push({
        type: 'text',
        content: content
      });
    }
    
    return segments;
  };

  // Clean text content for markdown rendering
  const cleanTextForMarkdown = (content: string): string => {
    return content
      .replace(/📝 \*\*(Creating|Updating|Deleting|Modifying)\*\* (.+?)(?:\n|$)/g, '')
      .replace(/<(?:Artifact[^>]*>|\/Artifact>)/g, '')
      .replace(/<(?:Action[^>]*>|\/Action>)/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const segments = parseMessageSegments(message.content);

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-blue-600' : 'bg-gray-600'
      }`}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      
      <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
        {/* Render segments in sequence */}
        {isUser ? (
          <div className="inline-block max-w-full p-3 rounded-lg bg-blue-600 text-white">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.content}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {segments.map((segment, index) => (
              <div key={index}>
                {segment.type === 'file-operations' && segment.operations ? (
                  /* File Operations Pills */
                  <div className="flex gap-2 flex-wrap mb-2">
                    {segment.operations.map((op, opIndex) => (
                      <div
                        key={opIndex}
                        className={`group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-opacity-40 transition-colors cursor-default ${
                          op.type === 'create' 
                            ? 'bg-green-600/20 border border-green-500/30 text-green-400 hover:bg-green-600/30'
                            : op.type === 'delete'
                            ? 'bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30'
                            : 'bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30'
                        }`}
                        title={op.path}
                      >
                        <div className="flex items-center gap-1.5">
                          {op.type === 'create' ? (
                            <Plus size={12} className="text-green-400" />
                          ) : op.type === 'delete' ? (
                            <FileText size={12} className="text-red-400" />
                          ) : (
                            <Edit3 size={12} className="text-blue-400" />
                          )}
                          <FileText size={12} />
                          <span>{op.fileName}</span>
                        </div>
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                          {op.type === 'create' ? 'Creating' : op.type === 'delete' ? 'Deleting' : 'Updating'}: {op.path}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : segment.content ? (
                  /* Text Content */
                  <div className="inline-block max-w-full p-3 rounded-lg bg-gray-700 text-gray-100">
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
                        {cleanTextForMarkdown(segment.content)}
                      </ReactMarkdown>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}