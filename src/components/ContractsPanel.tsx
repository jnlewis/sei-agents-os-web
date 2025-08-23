import React, { useState, useEffect } from 'react';
import { FileCode, Package, AlertCircle, CheckCircle, Upload } from 'lucide-react';
import { useProject } from '../contexts/ProjectContext';

interface ContractFile {
  name: string;
  path: string;
  content: string;
}

interface ContractArtifact {
  name: string;
  path: string;
  abi: any[];
  bytecode: string;
}

export function ContractsPanel() {
  const { getFileContent, getProjectFiles } = useProject();
  const [contractFiles, setContractFiles] = useState<ContractFile[]>([]);
  const [contractArtifacts, setContractArtifacts] = useState<ContractArtifact[]>([]);
  const [selectedContract, setSelectedContract] = useState<string | null>(null);

  useEffect(() => {
    loadContractFiles();
    loadContractArtifacts();
  }, []);

  const loadContractFiles = () => {
    // Load all .sol files from contracts/src directory
    const files: ContractFile[] = [];
    const projectFiles = getProjectFiles();
    
    projectFiles
      .filter(file => file.path.startsWith('contracts/src/') && file.path.endsWith('.sol'))
      .forEach(file => {
        const fileName = file.path.split('/').pop() || file.path;
        files.push({
          name: fileName,
          path: file.path,
          content: file.content
        });
      });

    setContractFiles(files);
    if (files.length > 0 && !selectedContract) {
      setSelectedContract(files[0].name);
    }
  };

  const loadContractArtifacts = () => {
    // Load all contract artifacts from contracts/artifacts directory
    const artifacts: ContractArtifact[] = [];
    const projectFiles = getProjectFiles();
    
    projectFiles
      .filter(file => 
        file.path.startsWith('contracts/artifacts/') && 
        file.path.endsWith('.json') &&
        !file.path.includes('.dbg.json') &&
        !file.path.includes('build-info')
      )
      .forEach(file => {
        try {
          const parsed = JSON.parse(file.content);
          // Extract contract name from path (e.g., contracts/artifacts/Token.sol/Token.json -> Token)
          const pathParts = file.path.split('/');
          const fileName = pathParts[pathParts.length - 1];
          const contractName = fileName.replace('.json', '');
          
          artifacts.push({
            name: contractName,
            path: file.path,
            abi: parsed.abi || [],
            bytecode: parsed.bytecode || ''
          });
        } catch (error) {
          console.error('Failed to parse contract artifact:', file.path, error);
        }
      });

    setContractArtifacts(artifacts);
  };

  const selectedContractFile = contractFiles.find(f => f.name === selectedContract);
  const selectedContractArtifact = contractArtifacts.find(a => {
    // Match by contract name (remove .sol extension from file name)
    const contractName = selectedContract?.replace('.sol', '');
    return a.name === contractName;
  });

  return (
    <div className="h-full bg-gray-900 flex">
      {/* Contract List Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-3 border-b border-gray-700">
          <h3 className="text-white font-medium text-sm flex items-center gap-2">
            <FileCode size={16} />
            Smart Contracts
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {contractFiles.length > 0 ? (
            <div className="space-y-1">
              {contractFiles.map((file) => {
                const contractName = file.name.replace('.sol', '');
                const hasArtifact = contractArtifacts.some(a => a.name === contractName);
                return (
                  <div
                    key={file.name}
                    className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer text-sm transition-colors ${
                      selectedContract === file.name
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                    onClick={() => setSelectedContract(file.name)}
                  >
                    <FileCode size={14} />
                    <span className="flex-1">{file.name}</span>
                    {hasArtifact ? (
                      <CheckCircle size={12} className="text-green-400" title="Compiled" />
                    ) : (
                      <AlertCircle size={12} className="text-yellow-400" title="Not compiled" />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-gray-400 text-sm text-center py-8">
              <FileCode size={32} className="mx-auto mb-2 opacity-50" />
              <p>No contracts found</p>
              <p className="text-xs mt-1">Add .sol files to contracts/src/</p>
            </div>
          )}
        </div>
      </div>



      {/* Contract Details */}
      <div className="flex-1 flex flex-col">
        {selectedContractFile ? (
          <>
            {/* Header */}
            <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileCode size={20} className="text-purple-400" />
                <div>
                  <h2 className="text-white font-medium">{selectedContractFile.name}</h2>
                  <p className="text-gray-400 text-xs">{selectedContractFile.path}</p>
                </div>
              </div>
              
              <button
                disabled
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-gray-400 rounded-lg cursor-not-allowed"
                title="Deploy functionality coming soon"
              >
                <Upload size={16} />
                Deploy
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex">
              {/* Source Code */}
              <div className="flex-1 flex flex-col">
                <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
                  <h3 className="text-gray-300 text-sm font-medium">Source Code</h3>
                </div>
                <div className="flex-1 p-4 overflow-auto">
                  <pre className="text-gray-300 text-sm font-mono whitespace-pre-wrap">
                    {selectedContractFile.content}
                  </pre>
                </div>
              </div>

              {/* Contract Info */}
              <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
                <div className="px-4 py-2 border-b border-gray-700">
                  <h3 className="text-gray-300 text-sm font-medium flex items-center gap-2">
                    <Package size={14} />
                    Contract Info
                  </h3>
                </div>
                
                <div className="flex-1 p-4 overflow-auto space-y-4">
                  {/* Compilation Status */}
                  <div>
                    <h4 className="text-white text-sm font-medium mb-2">Status</h4>
                    {selectedContractArtifact ? (
                      <div className="flex items-center gap-2 text-green-400 text-sm">
                        <CheckCircle size={14} />
                        Compiled Successfully
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-yellow-400 text-sm">
                        <AlertCircle size={14} />
                        Not Compiled
                      </div>
                    )}
                  </div>

                  {selectedContractArtifact ? (
                    <>
                      {/* ABI Functions */}
                      <div>
                        <h4 className="text-white text-sm font-medium mb-2">
                          Functions ({selectedContractArtifact.abi.filter(item => item.type === 'function').length})
                        </h4>
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                          {selectedContractArtifact.abi
                            .filter(item => item.type === 'function')
                            .map((func, index) => (
                              <div key={index} className="bg-gray-900 p-3 rounded border border-gray-700">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-sm font-medium text-white">{func.name}</span>
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                    func.stateMutability === 'view' || func.stateMutability === 'pure'
                                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                                      : func.stateMutability === 'payable'
                                      ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/30'
                                      : 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                                  }`}>
                                    {func.stateMutability || 'nonpayable'}
                                  </span>
                                </div>
                                
                                {/* Parameters */}
                                {func.inputs && func.inputs.length > 0 && (
                                  <div className="mb-2">
                                    <div className="text-xs text-gray-400 mb-1">Parameters:</div>
                                    <div className="space-y-1">
                                      {func.inputs.map((input: any, inputIndex: number) => (
                                        <div key={inputIndex} className="text-xs font-mono text-gray-300 bg-gray-800 px-2 py-1 rounded">
                                          <span className="text-blue-400">{input.type}</span>
                                          {input.name && <span className="text-gray-300 ml-2">{input.name}</span>}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Return values */}
                                {func.outputs && func.outputs.length > 0 && (
                                  <div>
                                    <div className="text-xs text-gray-400 mb-1">Returns:</div>
                                    <div className="space-y-1">
                                      {func.outputs.map((output: any, outputIndex: number) => (
                                        <div key={outputIndex} className="text-xs font-mono text-gray-300 bg-gray-800 px-2 py-1 rounded">
                                          <span className="text-green-400">{output.type}</span>
                                          {output.name && <span className="text-gray-300 ml-2">{output.name}</span>}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          {selectedContractArtifact.abi.filter(item => item.type === 'function').length === 0 && (
                            <div className="text-xs text-gray-500 text-center py-4">
                              No functions found
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Events */}
                      {selectedContractArtifact.abi.filter(item => item.type === 'event').length > 0 && (
                        <div>
                          <h4 className="text-white text-sm font-medium mb-2">
                            Events ({selectedContractArtifact.abi.filter(item => item.type === 'event').length})
                          </h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {selectedContractArtifact.abi
                              .filter(item => item.type === 'event')
                              .map((event, index) => (
                                <div key={index} className="bg-gray-900 p-3 rounded border border-gray-700">
                                  <div className="text-sm font-medium text-white mb-2">{event.name}</div>
                                  {event.inputs && event.inputs.length > 0 && (
                                    <div className="space-y-1">
                                      {event.inputs.map((input: any, inputIndex: number) => (
                                        <div key={inputIndex} className="text-xs font-mono text-gray-300 bg-gray-800 px-2 py-1 rounded">
                                          <span className="text-orange-400">{input.type}</span>
                                          {input.name && <span className="text-gray-300 ml-2">{input.name}</span>}
                                          {input.indexed && <span className="text-yellow-400 ml-2">(indexed)</span>}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Constructor */}
                      {selectedContractArtifact.abi.filter(item => item.type === 'constructor').length > 0 && (
                        <div>
                          <h4 className="text-white text-sm font-medium mb-2">Constructor</h4>
                          <div className="space-y-2">
                            {selectedContractArtifact.abi
                              .filter(item => item.type === 'constructor')
                              .map((constructor, index) => (
                                <div key={index} className="bg-gray-900 p-3 rounded border border-gray-700">
                                  {constructor.inputs && constructor.inputs.length > 0 ? (
                                    <div className="space-y-1">
                                      {constructor.inputs.map((input: any, inputIndex: number) => (
                                        <div key={inputIndex} className="text-xs font-mono text-gray-300 bg-gray-800 px-2 py-1 rounded">
                                          <span className="text-blue-400">{input.type}</span>
                                          {input.name && <span className="text-gray-300 ml-2">{input.name}</span>}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-xs text-gray-400">No parameters</div>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Bytecode Info */}
                      <div>
                        <h4 className="text-white text-sm font-medium mb-2">Bytecode</h4>
                        <div className="text-xs text-gray-400">
                          Size: {selectedContractArtifact.bytecode ? Math.floor(selectedContractArtifact.bytecode.length / 2) : 0} bytes
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <AlertCircle size={32} className="mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Contract not compiled</p>
                      <p className="text-xs mt-1">Compile to see ABI and functions</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <FileCode size={48} className="mx-auto mb-4 opacity-50" />
              <p>Select a contract to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}