import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { MainPanel } from './MainPanel';
import { WebContainerProvider } from '../contexts/WebContainerContext';
import { ProjectProvider } from '../contexts/ProjectContext';

export function CodeGeneratorApp() {
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = Math.max(300, Math.min(600, e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <WebContainerProvider>
      <ProjectProvider>
        <div className="h-screen bg-gray-900 flex overflow-hidden">
          <Sidebar width={sidebarWidth} />
          
          <div
            className={`w-1 bg-gray-700 cursor-col-resize hover:bg-purple-500 transition-colors ${
              isResizing ? 'bg-purple-500' : ''
            }`}
            onMouseDown={handleMouseDown}
          />
          
          <div className="flex-1 min-w-0">
            <MainPanel />
          </div>
        </div>
      </ProjectProvider>
    </WebContainerProvider>
  );
}