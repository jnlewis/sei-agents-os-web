import React, { useEffect, useState } from 'react';
import { RefreshCw, ExternalLink } from 'lucide-react';
import { useWebContainer } from '../contexts/WebContainerContext';

export function PreviewPanel() {
  const { previewUrl, isLoading: containerLoading, isDisabled } = useWebContainer();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    if (previewUrl) {
      setIsRefreshing(true);
      // Force iframe reload
      const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
      if (iframe) {
        iframe.src = iframe.src;
      }
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      <div className="flex-shrink-0 bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
        <span className="text-gray-300 text-sm font-medium">Preview</span>
        <div className="flex gap-2">
          {previewUrl && (
            <>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
              >
                <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              </button>
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              >
                <ExternalLink size={14} />
              </a>
            </>
          )}
        </div>
      </div>
      
      <div className="flex-1 relative">
        {containerLoading || isDisabled ? (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">
                {isDisabled ? 'Updating files...' : 'Initializing Preview...'}
              </p>
            </div>
          </div>
        ) : previewUrl ? (
          <iframe
            id="preview-iframe"
            src={previewUrl}
            className="w-full h-full border-none bg-white"
            title="App Preview"
          />
        ) : (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <ExternalLink size={48} className="mx-auto mb-4 opacity-50" />
              <p>No preview available</p>
              <p className="text-sm mt-2">Generate an app to see the preview</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}