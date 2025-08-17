import React from 'react';
import { ChevronDown, ChevronRight, File, Folder, FolderOpen } from 'lucide-react';
import { useProject } from '../contexts/ProjectContext';

export function FileExplorer() {
  const { files, selectedFile, setSelectedFile, expandedDirs, toggleDir } = useProject();

  const renderFileTree = (items: any[], basePath = '') => {
    return items.map((item) => {
      const fullPath = basePath ? `${basePath}/${item.name}` : item.name;
      const isExpanded = expandedDirs.has(fullPath);
      const isSelected = selectedFile === fullPath;

      if (item.type === 'directory') {
        return (
          <div key={fullPath}>
            <div
              className={`flex items-center gap-2 px-2 py-1 hover:bg-gray-700 cursor-pointer text-sm ${
                isSelected ? 'bg-purple-600 text-white' : 'text-gray-300'
              }`}
              onClick={() => toggleDir(fullPath)}
            >
              {isExpanded ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
              {isExpanded ? (
                <FolderOpen size={14} />
              ) : (
                <Folder size={14} />
              )}
              <span>{item.name}</span>
            </div>
            {isExpanded && item.children && (
              <div className="ml-4">
                {renderFileTree(item.children, fullPath)}
              </div>
            )}
          </div>
        );
      } else {
        return (
          <div
            key={fullPath}
            className={`flex items-center gap-2 px-2 py-1 hover:bg-gray-700 cursor-pointer text-sm ml-4 ${
              isSelected ? 'bg-purple-600 text-white' : 'text-gray-300'
            }`}
            onClick={() => setSelectedFile(fullPath)}
          >
            <File size={14} />
            <span>{item.name}</span>
          </div>
        );
      }
    });
  };

  return (
    <div className="h-full bg-gray-800 overflow-y-auto">
      <div className="p-3 border-b border-gray-700">
        <h3 className="text-white font-medium text-sm">Files</h3>
      </div>
      <div className="p-2">
        {files.length > 0 ? renderFileTree(files) : (
          <div className="text-gray-400 text-sm text-center py-8">
            No files loaded
          </div>
        )}
      </div>
    </div>
  );
}