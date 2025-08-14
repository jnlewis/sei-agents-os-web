import React, { useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { useProject } from '../contexts/ProjectContext';

interface SidebarProps {
  width: number;
}

export function Sidebar({ width }: SidebarProps) {
  const [inputValue, setInputValue] = useState('');
  const { messages, sendMessage, isLoading, isInitialized } = useProject();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || !isInitialized) return;

    const message = inputValue.trim();
    setInputValue('');
    await sendMessage(message);
  };

  return (
    <div 
      className="bg-gray-800 flex flex-col border-r border-gray-700"
      style={{ width }}
    >
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-2 text-white">
          <MessageSquare size={20} />
          <h1 className="font-semibold">AI Code Generator</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!isInitialized ? (
          <div className="text-gray-400 text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading template...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
            <p>Describe the app you want to build...</p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
        
        {isLoading && isInitialized && (
          <div className="text-blue-400">
            <div className="flex items-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
              <span>Generating...</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Describe your app..."
            className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none disabled:opacity-50"
            disabled={isLoading || !isInitialized}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading || !isInitialized}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}