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
  targetDir?: string;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  // Parse message content into segments
  const parseMessageSegments = (content: string): MessageSegment[] => {
    const segments: MessageSegment[] = [];
    
    // Find all Artifact blocks containing Action tags
    const artifactRegex = /<Artifact[^>]*>([\s\S]*?)<\/Artifact>/g;
    // Find Action tags within artifacts
    const actionRegex = /<Action\s+type="(file|command)"(?:\s+filePath="([^"]+)"\s+contentType="([^"]+)"|(?:\s+targetDir="([^"]+)")?\s+command="([^"]+)")(?:[^>]*)>([\s\S]*?)<\/Action>/g;
    
    let lastIndex = 0;
    let artifactMatch;
    
    while ((artifactMatch = artifactRegex.exec(content)) !== null) {
      const [fullArtifactMatch, artifactContent] = artifactMatch;
      
      // Add text before this Artifact
      if (artifactMatch.index > lastIndex) {
        const textContent = content.slice(lastIndex, artifactMatch.index).trim();
        if (textContent) {
          segments.push({
            type: 'text',
            content: cleanTextForDisplay(textContent)
          });
        }
      }
      
      // Parse actions within this artifact
      let actionMatch;
      actionRegex.lastIndex = 0; // Reset regex for new artifact content
      
      while ((actionMatch = actionRegex.exec(artifactContent)) !== null) {
        const [, actionType, filePath, contentType, targetDir, command] = actionMatch;
        
        if (actionType === 'file' && filePath && contentType) {
          segments.push({
            type: 'file-action',
            filePath,
            contentType: contentType as 'create' | 'replace' | 'delete'
          });
        } else if (actionType === 'command' && command) {
          segments.push({
            type: 'command-action',
            command,
            targetDir: targetDir || '/app' // Default to /app if not specified
          });
        }
      }
      
      lastIndex = artifactMatch.index + fullArtifactMatch.length;
    }
    
    // Add remaining text after last artifact
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
      .replace(/<Artifact[^>]*>[\s\S]*?<\/Artifact>/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const segments = parseMessageSegments(message.content);

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-purple-600' : 'bg-gray-600'
      }`}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      
      <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
        {isUser ? (
          <div className="inline-block max-w-full p-3 rounded-lg bg-purple-600 text-white">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.content}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Show streaming actions first */}
            {message.streamingActions?.map((action) => (
              <div key={action.id}>
                {action.type === 'file' && action.filePath && action.contentType && (
                  <ChatMessageFileAction 
                    filePath={action.filePath} 
                    contentType={action.contentType}
                    isCompleted={action.isCompleted}
                  />
                )}
                {action.type === 'command' && action.command && (
                  <ChatMessageCommandAction 
                    command={action.command} 
                    targetDir={action.targetDir}
                  />
                )}
              </div>
            ))}
            
            {/* Show parsed segments from final content */}
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
                  <ChatMessageCommandAction 
                    command={segment.command} 
                    targetDir={segment.targetDir}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}