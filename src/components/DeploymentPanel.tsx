import React, { useState } from 'react';
import { Rocket, Globe, Bot, FileCode, AlertCircle, Download, ChevronDown } from 'lucide-react';

export function DeploymentPanel() {
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const handleDownload = (type: 'all' | 'app' | 'contracts') => {
    // This would implement the actual download functionality
    console.log(`Downloading ${type} source code...`);
    setShowDownloadMenu(false);
    // TODO: Implement actual zip download
  };

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Rocket size={20} className="text-purple-400" />
          <div>
            <h2 className="text-white font-medium">Deployment Center</h2>
            <p className="text-gray-400 text-xs">Deploy your applications to production</p>
          </div>
        </div>
        
        {/* Download Source Code Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDownloadMenu(!showDownloadMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
          >
            <Download size={16} />
            Download Source
            <ChevronDown size={14} className={`transition-transform ${showDownloadMenu ? 'rotate-180' : ''}`} />
          </button>
          
          {showDownloadMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10">
              <div className="py-2">
                <button
                  onClick={() => handleDownload('all')}
                  className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  Complete Project (.zip)
                </button>
                <button
                  onClick={() => handleDownload('app')}
                  className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  Web App Only (.zip)
                </button>
                <button
                  onClick={() => handleDownload('contracts')}
                  className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  Contracts Only (.zip)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Coming Soon Notice */}
          <div className="bg-yellow-600/10 border border-yellow-500/30 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-yellow-400 font-medium mb-1">Deployment Coming Soon</h3>
              <p className="text-gray-300 text-sm">
                One-click deployment functionality is currently in development. Soon you'll be able to deploy your applications directly to production environments.
              </p>
            </div>
          </div>

          {/* Deployment Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Web App Deployment */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Globe size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Web Application</h3>
                  <p className="text-gray-400 text-xs">Frontend deployment</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-yellow-400">Ready to Deploy</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Platform:</span>
                  <span className="text-gray-300">Vercel/Netlify</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Build Time:</span>
                  <span className="text-gray-300">~2 minutes</span>
                </div>
              </div>
              
              <button
                disabled
                className="w-full px-4 py-2 bg-gray-600 text-gray-400 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Globe size={16} />
                Deploy Web App
              </button>
            </div>

            {/* Smart Contracts Deployment */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <FileCode size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Smart Contracts</h3>
                  <p className="text-gray-400 text-xs">SEI blockchain deployment</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-yellow-400">Ready to Deploy</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Network:</span>
                  <span className="text-gray-300">SEI Testnet</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Gas Estimate:</span>
                  <span className="text-gray-300">~0.01 SEI</span>
                </div>
              </div>
              
              <button
                disabled
                className="w-full px-4 py-2 bg-gray-600 text-gray-400 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FileCode size={16} />
                Deploy Contracts
              </button>
            </div>

            {/* Automated Agents Deployment */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 opacity-60">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Automated Agents</h3>
                  <p className="text-gray-400 text-xs">AI agent deployment</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-gray-500">Coming Soon</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Platform:</span>
                  <span className="text-gray-500">SEI Agents Cloud</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Runtime:</span>
                  <span className="text-gray-500">24/7 Active</span>
                </div>
              </div>
              
              <button
                disabled
                className="w-full px-4 py-2 bg-gray-700 text-gray-500 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Bot size={16} />
                Deploy Agents
              </button>
            </div>
          </div>

          {/* Deployment History */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <Rocket size={16} />
              Deployment History
            </h3>
            
            <div className="text-center py-8 text-gray-400">
              <Rocket size={32} className="mx-auto mb-3 opacity-50" />
              <p>No deployments yet</p>
              <p className="text-sm mt-1">Your deployment history will appear here</p>
            </div>
          </div>

          {/* Environment Configuration */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-white font-medium mb-4">Environment Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">SEI Network</label>
                <select 
                  disabled
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 cursor-not-allowed"
                >
                  <option>SEI Testnet</option>
                  <option>SEI Mainnet</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">Deployment Environment</label>
                <select 
                  disabled
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 cursor-not-allowed"
                >
                  <option>Production</option>
                  <option>Staging</option>
                  <option>Development</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}