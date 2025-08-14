import React, { useEffect, useRef } from 'react';
import { File as FileIcon } from 'lucide-react';
import { useProject } from '../contexts/ProjectContext';

export function CodeEditor() {
  const { selectedFile, getFileContent, updateFile } = useProject();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const content = selectedFile ? getFileContent(selectedFile) : '';

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (selectedFile) {
      const cursorPosition = e.target.selectionStart;
      updateFile(selectedFile, e.target.value);
      
      // Restore cursor position after React re-render
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(cursorPosition, cursorPosition);
        }
      });
    }
  };


  if (!selectedFile) {
    return (
      <div className="h-full bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400 text-center">
          <FileIcon size={48} className="mx-auto mb-4 opacity-50" />
          <p>Select a file to edit</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      <div className="flex-shrink-0 bg-gray-800 px-4 py-2 border-b border-gray-700">
        <span className="text-gray-300 text-sm font-medium">{selectedFile}</span>
      </div>
      <div className="flex-1 p-4">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          className="w-full h-full bg-gray-900 text-gray-100 font-mono text-sm resize-none border-none outline-none"
          spellCheck={false}
        />
      </div>
    </div>
  );
}