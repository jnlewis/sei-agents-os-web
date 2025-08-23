import React, { useState } from 'react';
import { Rocket, Globe, Bot, FileCode, AlertCircle, X } from 'lucide-react';
import { useProject } from '../contexts/ProjectContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function DeploymentPanel() {
  const { getProjectFiles } = useProject();
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [manualDeploymentContent, setManualDeploymentContent] = useState<string>('');

  const handleContractDeployClick = () => {
    // Load manual deployment content
    const projectFiles = getProjectFiles();
    const manualDeploymentFile = projectFiles.find(file => file.path === 'contracts/MANUAL_DEPLOYMENT.md');
    if (manualDeploymentFile) {
      setManualDeploymentContent(manualDeploymentFile.content);
    } else {
      setManualDeploymentContent('Manual deployment instructions not found. Please check the contracts/MANUAL_DEPLOYMENT.md file.');
    }
    setShowDeployModal(true);
  };

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-gray-800 px-4 py-3 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <Rocket size={20} className="text-purple-400" />
          <div>
            <h2 className="text-white font-medium">Deployment Center</h2>
            <p className="text-gray-400 text-xs">Deploy your applications to production</p>
          </div>
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
                  <span className="text-gray-300">SEI Agents OS (AWS)</span>
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
              </div>
              
              <button
                onClick={handleContractDeployClick}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
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
                  <span className="text-gray-500">SEI Agents OS (AWS)</span>
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

        </div>

        {/* Deploy Modal */}
        {showDeployModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden border border-gray-700">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <AlertCircle size={20} className="text-yellow-400" />
                  <h3 className="text-white font-medium">Manual Deployment Required</h3>
                </div>
                <button
                  onClick={() => setShowDeployModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Modal Content */}
              <div className="p-4">
                <div className="bg-yellow-600/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                  <p className="text-yellow-400 text-sm">
                    Unable to automatically deploy contract. As a temporary solution, please refer to the manual deployment steps below.
                  </p>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <div className="flex items-center gap-2 mb-3 text-gray-400">
                    <FileCode size={16} />
                    <span className="text-sm font-mono">contracts/MANUAL_DEPLOYMENT.md</span>
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children }) => <h1 className="text-lg font-bold mb-3 text-white">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-white">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-sm font-bold mb-2 text-white">{children}</h3>,
                        p: ({ children }) => <p className="mb-3 text-gray-300 leading-relaxed">{children}</p>,
                        code: ({ inline, children }) => 
                          inline ? (
                            <code className="bg-gray-800 px-2 py-1 rounded text-xs font-mono text-green-400">
                              {children}
                            </code>
                          ) : (
                            <code className="block bg-gray-800 p-3 rounded text-sm font-mono text-green-400 overflow-x-auto">
                              {children}
                            </code>
                          ),
                        pre: ({ children }) => (
                          <pre className="bg-gray-800 p-4 rounded-lg overflow-x-auto mb-3 border border-gray-700">
                            {children}
                          </pre>
                        ),
                        ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1 text-gray-300">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1 text-gray-300">{children}</ol>,
                        li: ({ children }) => <li className="text-gray-300">{children}</li>,
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-400 mb-3">
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
                          <div className="overflow-x-auto mb-3">
                            <table className="min-w-full border border-gray-600 rounded">
                              {children}
                            </table>
                          </div>
                        ),
                        th: ({ children }) => (
                          <th className="border border-gray-600 px-3 py-2 bg-gray-800 text-left font-medium text-white">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="border border-gray-600 px-3 py-2 text-gray-300">
                            {children}
                          </td>
                        ),
                      }}
                    >
                      {manualDeploymentContent}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-4 border-t border-gray-700">
                <button
                  onClick={() => setShowDeployModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}