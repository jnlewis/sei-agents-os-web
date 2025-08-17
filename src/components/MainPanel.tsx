import React, { useState } from 'react';
import { Code, Eye, FileCode, Rocket } from 'lucide-react';
import { FileExplorer } from './FileExplorer';
import { CodeEditor } from './CodeEditor';
import { PreviewPanel } from './PreviewPanel';
import { ContractsPanel } from './ContractsPanel';
import { DeploymentPanel } from './DeploymentPanel';

export function MainPanel() {
  const [activeTab, setActiveTab] = useState<'code' | 'preview' | 'contracts' | 'deployment'>('preview');

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      <div className="flex-shrink-0 bg-gray-800 border-b border-gray-700 px-4 py-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'code'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Code size={16} />
            Code
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'preview'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Eye size={16} />
            Preview
          </button>
          <button
            onClick={() => setActiveTab('contracts')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'contracts'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <FileCode size={16} />
            Contracts
          </button>
          <button
            onClick={() => setActiveTab('deployment')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'deployment'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Rocket size={16} />
            Deployment
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'code' ? (
          <div className="h-full flex">
            <div className="w-64 border-r border-gray-700">
              <FileExplorer />
            </div>
            <div className="flex-1">
              <CodeEditor />
            </div>
          </div>
        ) : activeTab === 'contracts' ? (
          <ContractsPanel />
        ) : activeTab === 'deployment' ? (
          <DeploymentPanel />
        ) : (
          <PreviewPanel />
        )}
      </div>
    </div>
  );
}