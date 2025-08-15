import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useWebContainer } from './WebContainerContext';
import { Message, ProjectFile } from '../types';
import { ApiService } from '../services/ApiService';
import { useEffect } from 'react';

interface ProjectContextType {
  messages: Message[];
  files: any[];
  selectedFile: string | null;
  expandedDirs: Set<string>;
  isLoading: boolean;
  isInitialized: boolean;
  sendMessage: (content: string) => Promise<void>;
  setSelectedFile: (path: string | null) => void;
  toggleDir: (path: string) => void;
  getFileContent: (path: string) => string;
  updateFile: (path: string, content: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { webcontainer, setDisabled, reloadContainer } = useWebContainer();
  const [messages, setMessages] = useState<Message[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [projectId] = useState(() => 'project-' + Date.now());
  
  const apiService = new ApiService();

  // Load template on startup
  useEffect(() => {
    if (webcontainer && !isInitialized) {
      loadTemplateFiles();
    }
  }, [webcontainer, isInitialized]);

  const buildFileTree = (files: ProjectFile[]) => {
    const tree: any[] = [];
    const pathMap = new Map<string, any>();

    // Create root entry
    pathMap.set('', { name: '', type: 'directory', children: [] });

    files.forEach(file => {
      const parts = file.path.split('/');
      let currentPath = '';

      parts.forEach((part, index) => {
        const fullPath = currentPath ? `${currentPath}/${part}` : part;
        
        if (!pathMap.has(fullPath)) {
          const isFile = index === parts.length - 1;
          const node = {
            name: part,
            path: fullPath,
            type: isFile ? 'file' : 'directory',
            children: isFile ? undefined : []
          };

          pathMap.set(fullPath, node);

          // Add to parent
          const parentPath = currentPath;
          const parent = pathMap.get(parentPath);
          if (parent && parent.children) {
            parent.children.push(node);
          }
        }

        currentPath = fullPath;
      });
    });

    return pathMap.get('')?.children || [];
  };

  const loadTemplateFiles = async () => {
    try {
      console.log('Starting template load...');
      setIsLoading(true);
      
      console.log('Calling API service...');
      const templateFiles = await apiService.getTemplate();
      console.log('Template files received:', templateFiles.length, 'files');
      
      setProjectFiles(templateFiles);
      
      if (webcontainer) {
        console.log('Setting up WebContainer file structure...');
        // Create file structure for WebContainer
        const fileTree: { [key: string]: any } = {};
        
        templateFiles.forEach(file => {
          const parts = file.path.split('/');
          let current = fileTree;
          
          parts.forEach((part, index) => {
            if (index === parts.length - 1) {
              // File
              current[part] = {
                file: {
                  contents: file.content
                }
              };
            } else {
              // Directory
              if (!current[part]) {
                current[part] = {
                  directory: {}
                };
              }
              current = current[part].directory;
            }
          });
        });

        await webcontainer.mount(fileTree);
        console.log('Files mounted to WebContainer');
        
        // Start dev server
        console.log('Installing dependencies...');
        const installProcess = await webcontainer.spawn('npm', ['install']);
        await installProcess.exit;
        console.log('Dependencies installed');
        
        console.log('Starting dev server...');
        const devProcess = await webcontainer.spawn('npm', ['run', 'dev']);
        console.log('Dev server started');
      }
      
      setFiles(buildFileTree(templateFiles));
      setExpandedDirs(new Set(['src']));
      console.log('Template loading completed successfully');
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to load template - Full error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const parseStreamContent = (content: string) => {
    const actions: Array<{ 
      type: 'file' | 'command'; 
      path?: string; 
      content?: string; 
      contentType?: string;
      command?: string;
    }> = [];
    let displayContent = '';

    // Parse Artifact blocks containing Action tags
    const artifactRegex = /<Artifact[^>]*>([\s\S]*?)<\/Artifact>/g;
    const fileActionRegex = /<Action\s+type="file"\s+filePath="([^"]+)"\s+contentType="([^"]+)"[^>]*>([\s\S]*?)<\/Action>/g;
    const commandActionRegex = /<Action\s+type="command"\s+command="([^"]+)"[^>]*>(?:[\s\S]*?<\/Action>)?/g;
    
    let artifactMatch;

    // Process each artifact block
    while ((artifactMatch = artifactRegex.exec(content)) !== null) {
      const [, artifactContent] = artifactMatch;
      
      // Reset regex indices for new artifact content
      fileActionRegex.lastIndex = 0;
      commandActionRegex.lastIndex = 0;
      
      // Process file actions within this artifact
      let fileMatch;
      while ((fileMatch = fileActionRegex.exec(artifactContent)) !== null) {
        const [, filePath, contentType, fileContent] = fileMatch;
        
        actions.push({
          type: 'file',
          path: filePath,
          content: fileContent.trim(),
          contentType: contentType
        });
      }

      // Process command actions within this artifact
      let commandMatch;
      while ((commandMatch = commandActionRegex.exec(artifactContent)) !== null) {
        const [, command] = commandMatch;
        
        actions.push({
          type: 'command',
          command: command
        });
      }
    }

    // Keep the original content for display (components will handle parsing)
    displayContent = content;

    return { actions, displayContent };
  };

  const sendMessage = async (content: string) => {
    if (!webcontainer || !isInitialized) return;

    // Disable WebContainer during generation
    setDisabled(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const requestData = {
        messages: [userMessage],
        isFirstPrompt: false,
        projectId,
        projectFiles: {
          visible: projectFiles,
          hidden: []
        }
      };

      let assistantContent = '';
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: ''
      };

      setMessages(prev => [...prev, assistantMessage]);

      let fileUpdateCount = 0;
      const pendingFileUpdates = new Set<string>();

      await apiService.streamChat(requestData, (chunk) => {
        assistantContent += chunk;
        
        // Update the message content progressively, but filter out Artifact content from text display
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            // Store the full content for action parsing, but clean it for display
            lastMessage.content = assistantContent;
          }
          return newMessages;
        });
      });

      // Process file operations after streaming is complete
      const { actions } = parseStreamContent(assistantContent);
      
      for (const action of actions) {
        if (action.type === 'file' && action.path && action.content !== undefined) {
          pendingFileUpdates.add(action.path);
          const pathParts = action.path.split('/');
          
          try {
            if (action.contentType === 'delete') {
              // Delete file
              await webcontainer.fs.rm(action.path);
              
              // Remove from project files
              setProjectFiles(prev => prev.filter(f => f.path !== action.path));
              fileUpdateCount++;
            } else {
              // Create or replace file
              // Ensure directory exists before writing file
              if (pathParts.length > 1) {
                const dirPath = pathParts.slice(0, -1).join('/');
                await webcontainer.fs.mkdir(dirPath, { recursive: true });
              }
              
              await webcontainer.fs.writeFile(action.path, action.content);
              
              // Update project files
              setProjectFiles(prev => {
                const existing = prev.find(f => f.path === action.path);
                if (existing) {
                  existing.content = action.content!;
                  existing.lastModified = Date.now();
                  return [...prev];
                } else {
                  return [...prev, {
                    path: action.path!,
                    content: action.content!,
                    lastModified: Date.now()
                  }];
                }
              });
              
              // Auto-expand new directories
              if (pathParts.length > 1) {
                const dirPath = pathParts.slice(0, -1).join('/');
                setExpandedDirs(prev => new Set([...prev, dirPath]));
              }
              
              fileUpdateCount++;
            }
            
            pendingFileUpdates.delete(action.path);
          } catch (error) {
            console.error('Failed to process file:', error);
            pendingFileUpdates.delete(action.path);
          }
        } else if (action.type === 'command' && action.command && webcontainer) {
          // Execute command in WebContainer
          try {
            const parts = action.command.trim().split(' ');
            const cmd = parts[0];
            const args = parts.slice(1);
            
            const process = await webcontainer.spawn(cmd, args);
            await process.exit;
          } catch (error) {
            console.error('Failed to execute command:', action.command, error);
          }
        }
      }

      // Update file tree display after all operations
      await new Promise(resolve => setTimeout(resolve, 500));
      setProjectFiles(currentFiles => {
        setFiles(buildFileTree(currentFiles));
        return currentFiles;
      });
      
      // Re-enable WebContainer and reload if files were updated
      setDisabled(false);
      if (fileUpdateCount > 0) {
        await reloadContainer();
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.'
      };
      setMessages(prev => [...prev, errorMessage]);
      // Re-enable WebContainer on error
      setDisabled(false);
    }

    setIsLoading(false);
  };

  const toggleDir = (path: string) => {
    setExpandedDirs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const getFileContent = (path: string): string => {
    const file = projectFiles.find(f => f.path === path);
    return file?.content || '';
  };

  const updateFile = async (path: string, content: string) => {
    if (!webcontainer) return;

    try {
      await webcontainer.fs.writeFile(path, content);
      
      setProjectFiles(prev => {
        const updated = [...prev];
        const file = updated.find(f => f.path === path);
        if (file) {
          file.content = content;
          file.lastModified = Date.now();
        }
        return updated;
      });
    } catch (error) {
      console.error('Failed to update file:', error);
    }
  };

  return (
    <ProjectContext.Provider value={{
      messages,
      files,
      selectedFile,
      expandedDirs,
      isLoading,
      isInitialized,
      sendMessage,
      setSelectedFile,
      toggleDir,
      getFileContent,
      updateFile
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}