import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { WebContainer } from '@webcontainer/api';

interface WebContainerContextType {
  webcontainer: WebContainer | null;
  previewUrl: string;
  isLoading: boolean;
  isDisabled: boolean;
  setDisabled: (disabled: boolean) => void;
  reloadContainer: () => Promise<void>;
}

const WebContainerContext = createContext<WebContainerContextType | undefined>(undefined);

export function WebContainerProvider({ children }: { children: ReactNode }) {
  const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const initializingRef = useRef(false);

  const setDisabled = (disabled: boolean) => {
    setIsDisabled(disabled);
    if (disabled) {
      setPreviewUrl('');
    }
  };

  const reloadContainer = async () => {
    if (!webcontainer || isDisabled) return;
    
    try {
      // Kill existing processes in the app directory
      const processes = await webcontainer.spawn('pkill', ['-f', 'vite'], {
        cwd: '/app'
      });
      await processes.exit;
    } catch (error) {
      // Ignore errors when killing processes
    }
    
    try {
      // Restart dev server in the app directory
      const devProcess = await webcontainer.spawn('npm', ['run', 'dev'], {
        cwd: '/app'
      });
      // Don't await the process as it runs continuously
    } catch (error) {
      console.error('Failed to restart dev server:', error);
    }
  };

  useEffect(() => {
    const initWebContainer = async () => {
      if (initializingRef.current) return;
      initializingRef.current = true;
      
      try {
        const instance = await WebContainer.boot();
        setWebcontainer(instance);
        
        // Listen for server ready events - only from the app directory
        instance.on('server-ready', (port, url) => {
          if (!isDisabled) {
            setPreviewUrl(url);
          }
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize WebContainer:', error);
        setIsLoading(false);
        initializingRef.current = false;
      }
    };

    initWebContainer();
  }, [isDisabled]);

  return (
    <WebContainerContext.Provider value={{ 
      webcontainer, 
      previewUrl, 
      isLoading, 
      isDisabled, 
      setDisabled, 
      reloadContainer 
    }}>
      {children}
    </WebContainerContext.Provider>
  );
}

export function useWebContainer() {
  const context = useContext(WebContainerContext);
  if (context === undefined) {
    throw new Error('useWebContainer must be used within a WebContainerProvider');
  }
  return context;
}