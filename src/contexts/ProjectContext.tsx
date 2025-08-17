import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useWebContainer } from './WebContainerContext';
import { Message, ProjectFile } from '../types';
import { ApiService } from '../services/ApiService';
import { filterProjectFiles } from '../config/fileFilters';
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
  getProjectFiles: () => ProjectFile[];
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
  const [streamingState, setStreamingState] = useState<{
    insideArtifact: boolean;
    currentAction: string;
    actionBuffer: string;
  }>({
    insideArtifact: false,
    currentAction: '',
    actionBuffer: ''
  });
  
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
        // Create file structure for WebContainer - load ALL files (agents/, app/, contracts/)
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
        
        // Check if app folder has package.json and install dependencies
        const appFiles = templateFiles.filter(f => f.path.startsWith('app/'));
        const hasAppPackageJson = appFiles.some(f => f.path === 'app/package.json');
        
        if (hasAppPackageJson) {
          console.log('Installing dependencies in /app folder...');
          const installProcess = await webcontainer.spawn('npm', ['install'], {
            cwd: '/app'
          });
          await installProcess.exit;
          console.log('Dependencies installed in /app');
          
          console.log('Starting dev server in /app folder...');
          const devProcess = await webcontainer.spawn('npm', ['run', 'dev'], {
            cwd: '/app'
          });
          console.log('Dev server started in /app');
        }
      }
      
      setFiles(buildFileTree(templateFiles));
      setExpandedDirs(new Set(['app', 'contracts'])); // Auto-expand main folders
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
      targetDir?: string;
    }> = [];
    let displayContent = '';

    // Parse Artifact blocks containing Action tags
    const artifactRegex = /<Artifact[^>]*>([\s\S]*?)<\/Artifact>/g;
    const fileActionRegex = /<Action\s+type="file"\s+filePath="([^"]+)"\s+contentType="([^"]+)"[^>]*>([\s\S]*?)<\/Action>/g;
    const commandActionRegex = /<Action\s+type="command"(?:\s+targetDir="([^"]+)")?\s+command="([^"]+)"[^>]*>(?:[\s\S]*?<\/Action>)?/g;
    
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
        const [, targetDir, command] = commandMatch;
        
        actions.push({
          type: 'command',
          command: command,
          targetDir: targetDir || '/app' // Default to /app if not specified
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
        content: '',
        streamingActions: []
      };

      setMessages(prev => [...prev, assistantMessage]);

      let fileUpdateCount = 0;
      const pendingFileUpdates = new Set<string>();
      let currentStreamingState = {
        insideArtifact: false,
        currentAction: '',
        actionBuffer: '',
        textContent: '',
        streamingActions: [] as any[]
      };

      await apiService.streamChat(requestData, (chunk) => {
        assistantContent += chunk;
        
        // Process chunk character by character for progressive streaming
        let buffer = currentStreamingState.actionBuffer + chunk;
        let i = 0;
        
        while (i < buffer.length) {
          if (!currentStreamingState.insideArtifact) {
            // Look for <Artifact opening tag
            const artifactStart = buffer.indexOf('<Artifact', i);
            if (artifactStart !== -1 && artifactStart === i) {
              // Found artifact opening tag at current position
              const tagEnd = buffer.indexOf('>', artifactStart);
              if (tagEnd !== -1) {
                // Complete opening tag found
                currentStreamingState.insideArtifact = true;
                i = tagEnd + 1;
                continue;
              } else {
                // Incomplete tag, save to buffer and wait for more content
                currentStreamingState.actionBuffer = buffer.slice(i);
                break;
              }
            } else if (artifactStart !== -1) {
              // Add text before artifact to display
              currentStreamingState.textContent += buffer.slice(i, artifactStart);
              i = artifactStart;
              continue;
            } else {
              // No artifact tag found, add remaining text to display
              currentStreamingState.textContent += buffer.slice(i);
              break;
            }
          } else {
            // Inside artifact - look for Action tags or closing Artifact
            const artifactEnd = buffer.indexOf('</Artifact>', i);
            const actionStart = buffer.indexOf('<Action', i);
            
            if (artifactEnd !== -1 && (actionStart === -1 || artifactEnd < actionStart)) {
              // Found closing artifact tag first
              currentStreamingState.insideArtifact = false;
              i = artifactEnd + '</Artifact>'.length;
              continue;
            } else if (actionStart !== -1 && actionStart === i) {
              // Found action tag at current position
              const tagEnd = buffer.indexOf('>', actionStart);
              if (tagEnd !== -1) {
                // Complete action tag found
                const actionTag = buffer.slice(actionStart, tagEnd + 1);
                
                // Parse action attributes using string methods
                const typeStart = actionTag.indexOf('type="');
                if (typeStart !== -1) {
                  const typeValueStart = typeStart + 'type="'.length;
                  const typeValueEnd = actionTag.indexOf('"', typeValueStart);
                  if (typeValueEnd !== -1) {
                    const actionType = actionTag.slice(typeValueStart, typeValueEnd);
                    
                    if (actionType === 'file') {
                      // Parse file action attributes
                      const filePathStart = actionTag.indexOf('filePath="');
                      const contentTypeStart = actionTag.indexOf('contentType="');
                      
                      if (filePathStart !== -1 && contentTypeStart !== -1) {
                        const filePathValueStart = filePathStart + 'filePath="'.length;
                        const filePathValueEnd = actionTag.indexOf('"', filePathValueStart);
                        const contentTypeValueStart = contentTypeStart + 'contentType="'.length;
                        const contentTypeValueEnd = actionTag.indexOf('"', contentTypeValueStart);
                        
                        if (filePathValueEnd !== -1 && contentTypeValueEnd !== -1) {
                          const filePath = actionTag.slice(filePathValueStart, filePathValueEnd);
                          const contentType = actionTag.slice(contentTypeValueStart, contentTypeValueEnd);
                          
                          const newAction = {
                            id: Date.now() + Math.random(),
                            type: 'file' as const,
                            filePath: filePath,
                            contentType: contentType as 'create' | 'replace' | 'delete',
                            isCompleted: false
                          };
                          currentStreamingState.streamingActions.push(newAction);
                          
                          // Immediately update the message to show the action
                          setMessages(prev => {
                            const newMessages = [...prev];
                            const lastMessage = newMessages[newMessages.length - 1];
                            if (lastMessage && lastMessage.role === 'assistant') {
                              lastMessage.streamingActions = [...currentStreamingState.streamingActions];
                            }
                            return newMessages;
                          });
                        }
                      }
                    } else if (actionType === 'command') {
                      // Parse command action attributes
                      const commandStart = actionTag.indexOf('command="');
                      const targetDirStart = actionTag.indexOf('targetDir="');
                      
                      if (commandStart !== -1) {
                        const commandValueStart = commandStart + 'command="'.length;
                        const commandValueEnd = actionTag.indexOf('"', commandValueStart);
                        
                        let targetDir = '/app'; // Default
                        if (targetDirStart !== -1) {
                          const targetDirValueStart = targetDirStart + 'targetDir="'.length;
                          const targetDirValueEnd = actionTag.indexOf('"', targetDirValueStart);
                          if (targetDirValueEnd !== -1) {
                            targetDir = actionTag.slice(targetDirValueStart, targetDirValueEnd);
                          }
                        }
                        
                        if (commandValueEnd !== -1) {
                          const command = actionTag.slice(commandValueStart, commandValueEnd);
                          
                          const newAction = {
                            id: Date.now() + Math.random(),
                            type: 'command' as const,
                            command: command,
                            targetDir: targetDir
                          };
                          currentStreamingState.streamingActions.push(newAction);
                          
                          // Immediately update the message to show the action
                          setMessages(prev => {
                            const newMessages = [...prev];
                            const lastMessage = newMessages[newMessages.length - 1];
                            if (lastMessage && lastMessage.role === 'assistant') {
                              lastMessage.streamingActions = [...currentStreamingState.streamingActions];
                            }
                            return newMessages;
                          });
                        }
                      }
                    }
                  }
                }
                
                i = tagEnd + 1;
                continue;
              } else {
                // Incomplete action tag, save to buffer and wait for more content
                currentStreamingState.actionBuffer = buffer.slice(i);
                break;
              }
            } else if (actionStart !== -1) {
              // Skip to action tag
              i = actionStart;
              continue;
            } else if (artifactEnd === -1) {
              // No closing artifact tag found yet, save remaining content to buffer
              currentStreamingState.actionBuffer = buffer.slice(i);
              break;
            } else {
              // Skip character inside artifact
              i++;
            }
          }
        }
        
        // Clear buffer if we processed everything
        if (i >= buffer.length) {
          currentStreamingState.actionBuffer = '';
        }
        
        // Update message with current text content
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            lastMessage.content = currentStreamingState.textContent;
            lastMessage.fullContent = assistantContent; // Store full content for final processing
            lastMessage.streamingActions = [...currentStreamingState.streamingActions];
          }
          return newMessages;
        });
      });

      // Process file operations after streaming is complete
      const finalContent = assistantContent;
      const { actions } = parseStreamContent(finalContent);
      
      // Mark all streaming actions as completed
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant' && lastMessage.streamingActions) {
          lastMessage.streamingActions = lastMessage.streamingActions.map(action => ({
            ...action,
            isCompleted: true
          }));
        }
        return newMessages;
      });
      
      // Update final message content for proper parsing
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          lastMessage.content = finalContent;
          // Keep streaming actions but mark them as completed
        }
        return newMessages;
      });
      
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
          // Execute command in WebContainer with targetDir
          try {
            const parts = action.command.trim().split(' ');
            const cmd = parts[0];
            const args = parts.slice(1);
            
            // Convert targetDir to actual directory path (remove leading slash)
            const workingDir = action.targetDir?.replace(/^\//, '') || 'app';
            
            const process = await webcontainer.spawn(cmd, args, {
              cwd: `/${workingDir}`
            });
            await process.exit;
          } catch (error) {
            console.error('Failed to execute command:', action.command, 'in', action.targetDir, error);
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
      updateFile,
      getProjectFiles
    });
  };

  const getProjectFiles = (): ProjectFile[] => {
    return projectFiles;
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