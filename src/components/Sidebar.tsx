import React, { useState } from 'react';
import { Send, MessageSquare, Lightbulb, X } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { useProject } from '../contexts/ProjectContext';

const EXAMPLE_PROMPTS = [
  {
    title: "Token Swap DApp",
    description: "Simple token swapping interface",
    prompt: "Create a simple token swap DApp with a clean interface where users can swap between two tokens. Include wallet connection and basic swap functionality."
  },
  {
    title: "NFT Minting App",
    description: "Basic NFT minting interface",
    prompt: "Build an NFT minting app where users can mint simple NFTs. Include a minting form, wallet connection, and display of minted NFTs. You may use placeholders instead of actual images."
  },
  {
    title: "Staking Dashboard",
    description: "Token staking interface",
    prompt: "Create a staking dashboard on SEI where users can stake tokens and view their rewards. Include stake, unstake, and claim rewards functionality."
  }
];

interface SidebarProps {
  width: number;
}

export function Sidebar({ width }: SidebarProps) {
  const [inputValue, setInputValue] = useState('');
  const [showExamples, setShowExamples] = useState(false);
  const { messages, sendMessage, isLoading, isInitialized } = useProject();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || !isInitialized) return;

    const message = inputValue.trim();
    setInputValue('');
    await sendMessage(message);
  };

  const handleExampleSelect = (prompt: string) => {
    setInputValue(prompt);
    setShowExamples(false);
  };

  const toggleExamples = () => {
    setShowExamples(!showExamples);
  };

  return (
    <div 
      className="bg-gray-800 flex flex-col border-r border-gray-700"
      style={{ width }}
    >
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-2 text-white">
          <MessageSquare size={20} />
          <h1 className="font-semibold">SEI Agents OS (Preview)</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!isInitialized ? (
          <div className="text-gray-400 text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Initializing project...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="space-y-4">
            <div className="text-gray-400 text-center py-4">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p>Describe the app and contract you want to build...</p>
            </div>
            
            {/* Examples Section */}
            <div className="border-t border-gray-700 pt-4">
              <button
                onClick={toggleExamples}
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium mb-3 transition-colors"
              >
                <Lightbulb size={16} />
                {showExamples ? 'Hide Examples' : 'Try an Example'}
                {showExamples && <X size={14} />}
              </button>
              
              {showExamples && (
                <div className="space-y-2">
                  {EXAMPLE_PROMPTS.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleSelect(example.prompt)}
                      className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-white text-sm font-medium mb-1 group-hover:text-blue-300 transition-colors">
                            {example.title}
                          </h4>
                          <p className="text-gray-400 text-xs leading-relaxed">
                            {example.description}
                          </p>
                        </div>
                        <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Send size={12} className="text-blue-400" />
                        </div>
                      </div>
                    </button>
                  ))}
                  
                  <div className="text-center pt-2">
                    <p className="text-xs text-gray-500">
                      Click any example to get started quickly
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
        
        {isLoading && isInitialized && (
          <div className="text-purple-400 text-center">
            <div className="flex justify-center">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={toggleExamples}
            className="px-3 py-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
            title="Try an example"
          >
            <Lightbulb size={16} />
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Describe your app and contract..."
            className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none disabled:opacity-50"
            disabled={isLoading || !isInitialized}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading || !isInitialized}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}