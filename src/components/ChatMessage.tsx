import React from 'react';
import { User, Bot } from 'lucide-react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-blue-600' : 'bg-gray-600'
      }`}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      
      <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block max-w-full p-3 rounded-lg ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-700 text-gray-100'
        }`}>
          <div className="whitespace-pre-wrap text-sm leading-relaxed prose prose-invert max-w-none">
            {message.content.split('\n').map((line, index) => {
              // Handle file update messages
              if (line.startsWith('📝 **') && line.endsWith('**')) {
                return (
                  <div key={index} className="font-semibold text-green-400 my-2">
                    {line}
                  </div>
                );
              }
              // Handle code blocks
              if (line.startsWith('```')) {
                return (
                  <div key={index} className="font-mono text-xs bg-gray-800 px-2 py-1 rounded my-1">
                    {line.replace('```', '')}
                  </div>
                );
              }
              return <div key={index}>{line}</div>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}