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
  const { getFileContent } = useProject();
  const [contractFiles, setContractFiles] = useState<ContractFile[]>([]);
  const [contractArtifacts, setContractArtifacts] = useState<ContractArtifact[]>([]);
  const [selectedContract, setSelectedContract] = useState<string | null>(null);

  useEffect(() => {
    loadContractFiles();
    loadContractArtifacts();
  }, []);

  const loadContractFiles = () => {
    // Load contract source files from /contracts/src
    const files: ContractFile[] = [];
    
    // Try to load SampleToken.sol
    const sampleTokenContent = getFileContent('contracts/src/SampleToken.sol');
    if (sampleTokenContent) {
      files.push({
        name: 'SampleToken.sol',
        path: 'contracts/src/SampleToken.sol',
        content: sampleTokenContent
      });
    }

    setContractFiles(files);
    if (files.length > 0 && !selectedContract) {
      setSelectedContract(files[0].name);
    }
  };

  const loadContractArtifacts = () => {
    // Load contract artifacts from /contracts/artifacts
    const artifacts: ContractArtifact[] = [];
    
    // Try to load SampleToken.json artifact
    const sampleTokenArtifact = getFileContent('contracts/artifacts/src/SampleToken.sol/SampleToken.json');
    if (sampleTokenArtifact) {
      try {
        const parsed = JSON.parse(sampleTokenArtifact);
        artifacts.push({
          name: 'SampleToken',
          path: 'contracts/artifacts/src/SampleToken.sol/SampleToken.json',
          abi: parsed.abi || [],
          bytecode: parsed.bytecode || ''
        });
      } catch (error) {
        console.error('Failed to parse contract artifact:', error);
      }
    }

    setContractArtifacts(artifacts);
  };

  const selectedContractFile = contractFiles.find(f => f.name === selectedContract);
  const selectedContractArtifact = contractArtifacts.find(a => a.name === selectedContract?.replace('.sol', ''));

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
                const hasArtifact = contractArtifacts.some(a => a.name === file.name.replace('.sol', ''));
                return (
                  <div
                    key={file.name}
                    className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer text-sm transition-colors ${
                      selectedContract === file.name
                        ? 'bg-blue-600 text-white'
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
                <FileCode size={20} className="text-blue-400" />
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
              {selectedContractArtifact && (
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
                      <div className="flex items-center gap-2 text-green-400 text-sm">
                        <CheckCircle size={14} />
                        Compiled Successfully
                      </div>
                    </div>

                    {/* ABI */}
                    <div>
                      <h4 className="text-white text-sm font-medium mb-2">ABI Functions</h4>
                      <div className="space-y-1">
                        {selectedContractArtifact.abi
                          .filter(item => item.type === 'function')
                          .slice(0, 5)
                          .map((func, index) => (
                            <div key={index} className="text-xs text-gray-400 font-mono bg-gray-900 p-2 rounded">
                              {func.name}({func.inputs?.map((input: any) => `${input.type} ${input.name}`).join(', ')})
                            </div>
                          ))}
                        {selectedContractArtifact.abi.filter(item => item.type === 'function').length > 5 && (
                          <div className="text-xs text-gray-500">
                            +{selectedContractArtifact.abi.filter(item => item.type === 'function').length - 5} more functions
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bytecode Info */}
                    <div>
                      <h4 className="text-white text-sm font-medium mb-2">Bytecode</h4>
                      <div className="text-xs text-gray-400">
                        Size: {selectedContractArtifact.bytecode ? Math.floor(selectedContractArtifact.bytecode.length / 2) : 0} bytes
                      </div>
                    </div>
                  </div>
                </div>
              )}
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