import React, { useState, useEffect } from 'react';
import { FileText, Plus, Edit3, Trash2, Loader2 } from 'lucide-react';

interface ChatMessageFileActionProps {
  filePath: string;
  contentType: 'create' | 'replace' | 'delete';
  isCompleted?: boolean;
}

export function ChatMessageFileAction({ filePath, contentType, isCompleted = false }: ChatMessageFileActionProps) {
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    if (isCompleted) {
      setShowLoading(false);
    }
  }, [isCompleted]);

  const fileName = filePath.split('/').pop() || filePath;

  const getActionConfig = () => {
    switch (contentType) {
      case 'create':
        return {
          icon: Plus,
          label: 'Creating',
          bgColor: 'bg-green-600/20',
          borderColor: 'border-green-500/30',
          textColor: 'text-green-400',
          hoverColor: 'hover:bg-green-600/30',
          iconColor: 'text-green-400'
        };
      case 'delete':
        return {
          icon: Trash2,
          label: 'Deleting',
          bgColor: 'bg-red-600/20',
          borderColor: 'border-red-500/30',
          textColor: 'text-red-400',
          hoverColor: 'hover:bg-red-600/30',
          iconColor: 'text-red-400'
        };
      default: // replace
        return {
          icon: Edit3,
          label: 'Updating',
          bgColor: 'bg-purple-600/20',
          borderColor: 'border-purple-500/30',
          textColor: 'text-purple-400',
          hoverColor: 'hover:bg-purple-600/30',
          iconColor: 'text-purple-400'
        };
    }
  };

  const config = getActionConfig();
  const IconComponent = config.icon;

  return (
    <div className="flex gap-2 flex-wrap mb-2">
      <div
        className={`group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-default ${
          config.bgColor
        } ${config.borderColor} ${config.textColor} ${config.hoverColor} border`}
        title={filePath}
      >
        <div className="flex items-center gap-1.5">
          {showLoading && (
            <Loader2 size={10} className="animate-spin text-gray-400" />
          )}
          <IconComponent size={12} className={config.iconColor} />
          <FileText size={12} />
          <span>{fileName}</span>
        </div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
          {config.label}: {filePath}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        </div>
      </div>
    </div>
  );
}