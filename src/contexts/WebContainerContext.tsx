import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { WebContainer } from '@webcontainer/api';

interface WebContainerContextType {
  webcontainer: WebContainer | null;
  previewUrl: string;
  isLoading: boolean;
}

const WebContainerContext = createContext<WebContainerContextType | undefined>(undefined);

export function WebContainerProvider({ children }: { children: ReactNode }) {
  const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const initializingRef = useRef(false);

  useEffect(() => {
    const initWebContainer = async () => {
      if (initializingRef.current) return;
      initializingRef.current = true;
      
      try {
        const instance = await WebContainer.boot();
        setWebcontainer(instance);
        
        // Listen for server ready events
        instance.on('server-ready', (port, url) => {
          setPreviewUrl(url);
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize WebContainer:', error);
        setIsLoading(false);
        initializingRef.current = false;
      }
    };

    initWebContainer();
  }, []);

  return (
    <WebContainerContext.Provider value={{ webcontainer, previewUrl, isLoading }}>
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