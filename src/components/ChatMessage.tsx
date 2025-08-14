import React from 'react';
import { User, Bot } from 'lucide-react';
import { Message } from '../types';
import { ChatMessageText } from './ChatMessageText';
import { ChatMessageFileAction } from './ChatMessageFileAction';
import { ChatMessageCommandAction } from './ChatMessageCommandAction';

interface ChatMessageProps {
  message: Message;
}

interface MessageSegment {
  type: 'text' | 'file-action' | 'command-action';
  content?: string;
  filePath?: string;
  contentType?: 'create' | 'replace' | 'delete';
  command?: string;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  // Parse message content into segments
  const parseMessageSegments = (content: string): MessageSegment[] => {
    const segments: MessageSegment[] = [];
    
    // Find all Action tags (both file and command types)
    const actionRegex = /<Action\s+type="(file|command)"(?:\s+filePath="([^"]+)"\s+contentType="([^"]+)"|(?:\s+command="([^"]+)"))[^>]*>(?:[\s\S]*?<\/Action>)?/g;
    
    let lastIndex = 0;
    let match;
    
    while ((match = actionRegex.exec(content)) !== null) {
      const [fullMatch, actionType, filePath, contentType, command] = match;
      
      // Add text before this Action tag
      if (match.index > lastIndex) {
        const textContent = content.slice(lastIndex, match.index).trim();
        if (textContent) {
          segments.push({
            type: 'text',
            content: cleanTextForDisplay(textContent)
          });
        }
      }
      
      // Add action segment
      if (actionType === 'file' && filePath && contentType) {
        segments.push({
          type: 'file-action',
          filePath,
          contentType: contentType as 'create' | 'replace' | 'delete'
        });
      } else if (actionType === 'command' && command) {
        segments.push({
          type: 'command-action',
          command
        });
      }
      
      lastIndex = match.index + fullMatch.length;
    }
    
    // Add remaining text after last action
    if (lastIndex < content.length) {
      const remainingContent = content.slice(lastIndex).trim();
      if (remainingContent) {
        segments.push({
          type: 'text',
          content: cleanTextForDisplay(remainingContent)
        });
      }
    }
    
    // If no actions found, return the entire content as text
    if (segments.length === 0) {
      segments.push({
        type: 'text',
        content: cleanTextForDisplay(content)
      });
    }
    
    return segments;
  };

  // Clean text content for display
  const cleanTextForDisplay = (content: string): string => {
    return content
      // Remove Artifact wrapper tags
      .replace(/<Artifact[^>]*>/g, '')
      .replace(/<\/Artifact>/g, '')
      // Remove Action tags and any content between them
      .replace(/<Action\s+[^>]*>[\s\S]*?<\/Action>/g, '')
      // Remove standalone Action tags (self-closing or unclosed)
      .replace(/<Action\s+[^>]*>/g, '')
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
                {segment.type === 'text' && segment.content && (
                  <ChatMessageText content={segment.content} />
                )}
                {segment.type === 'file-action' && segment.filePath && segment.contentType && (
                  <ChatMessageFileAction 
                    filePath={segment.filePath} 
                    contentType={segment.contentType} 
                  />
                )}
                {segment.type === 'command-action' && segment.command && (
                  <ChatMessageCommandAction command={segment.command} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}