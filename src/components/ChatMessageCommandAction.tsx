import React, { useState, useEffect } from 'react';
import { Terminal, Play, CheckCircle, XCircle, Loader, Folder } from 'lucide-react';
import { useWebContainer } from '../contexts/WebContainerContext';

interface ChatMessageCommandActionProps {
  command: string;
  targetDir?: string;
  onComplete?: (success: boolean, output: string) => void;
}

export function ChatMessageCommandAction({ command, targetDir = '/app', onComplete }: ChatMessageCommandActionProps) {
  const { webcontainer } = useWebContainer();
  const [status, setStatus] = useState<'pending' | 'running' | 'success' | 'error'>('pending');
  const [output, setOutput] = useState<string>('');

  useEffect(() => {
    if (webcontainer && status === 'pending') {
      executeCommand();
    }
  }, [webcontainer, status]);

  const executeCommand = async () => {
    if (!webcontainer) return;

    setStatus('running');
    setOutput('');

    try {
      // Parse command and arguments
      const parts = command.trim().split(' ');
      const cmd = parts[0];
      const args = parts.slice(1);

      // Convert targetDir to actual directory path (remove leading slash)
      const workingDir = targetDir.replace(/^\//, '');

      const process = await webcontainer.spawn(cmd, args, {
        cwd: `/${workingDir}`
      });
      
      let commandOutput = '';

      // Capture stdout
      process.output.pipeTo(new WritableStream({
        write(data) {
          let text: string;
          if (data == null) {
            text = '';
          } else if (typeof data === 'string') {
            text = data;
          } else {
            text = new TextDecoder().decode(data);
          }
          commandOutput += text;
          setOutput(prev => prev + text);
        }
      }));

      const exitCode = await process.exit;
      
      if (exitCode === 0) {
        setStatus('success');
        onComplete?.(true, commandOutput);
      } else {
        setStatus('error');
        onComplete?.(false, commandOutput);
      }
    } catch (error) {
      console.error('Command execution failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setOutput(errorMessage);
      setStatus('error');
      onComplete?.(false, errorMessage);
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'running':
        return {
          icon: Loader,
          bgColor: 'bg-yellow-600/20',
          borderColor: 'border-yellow-500/30',
          textColor: 'text-yellow-400',
          iconColor: 'text-yellow-400',
          animate: 'animate-spin'
        };
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-600/20',
          borderColor: 'border-green-500/30',
          textColor: 'text-green-400',
          iconColor: 'text-green-400',
          animate: ''
        };
      case 'error':
        return {
          icon: XCircle,
          bgColor: 'bg-red-600/20',
          borderColor: 'border-red-500/30',
          textColor: 'text-red-400',
          iconColor: 'text-red-400',
          animate: ''
        };
      default: // pending
        return {
          icon: Play,
          bgColor: 'bg-purple-600/20',
          borderColor: 'border-purple-500/30',
          textColor: 'text-purple-400',
          iconColor: 'text-purple-400',
          animate: ''
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <div className="mb-2">
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
          config.bgColor
        } ${config.borderColor} ${config.textColor}`}
      >
        <Terminal size={12} />
        <IconComponent size={12} className={`${config.iconColor} ${config.animate}`} />
        <Folder size={12} className="text-gray-400" />
        <span className="text-gray-400">{targetDir}</span>
        <code className="font-mono">{command}</code>
      </div>
      
      {output && (
        <div className="mt-2 p-3 bg-gray-800 rounded-lg text-xs font-mono text-gray-300 max-h-48 overflow-y-auto">
          <div className="flex items-center gap-2 mb-2 text-gray-400 border-b border-gray-700 pb-2">
            <Terminal size={12} />
            <span>Command Output ({targetDir})</span>
          </div>
          <pre className="whitespace-pre-wrap">{output}</pre>
        </div>
      )}
    </div>
  );
}