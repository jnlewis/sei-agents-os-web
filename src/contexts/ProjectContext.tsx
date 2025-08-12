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
      setIsLoading(true);
      const templateFiles = await apiService.getTemplate();
      setProjectFiles(templateFiles);
      
      if (webcontainer) {
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
        
        // Start dev server
        const installProcess = await webcontainer.spawn('npm', ['install']);
        await installProcess.exit;
        
        const devProcess = await webcontainer.spawn('npm', ['run', 'dev']);
      }
      
      setFiles(buildFileTree(templateFiles));
      setExpandedDirs(new Set(['src']));
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to load template:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const parseStreamContent = (content: string) => {
    const actions: Array<{ type: string; path?: string; content?: string }> = [];
    let displayContent = '';

    // Split content by lines and process each line
    const lines = content.split('\n');
    let insideTag = false;
    let currentTag = '';
    let tagContent = '';
    let tagAttributes: any = {};

    for (const line of lines) {
      // Check for opening tags (Artifact, Action, etc.)
      const openTagMatch = line.match(/<(Artifact|Action|boltArtifact|boltAction)([^>]*)>/);
      if (openTagMatch) {
        insideTag = true;
        currentTag = openTagMatch[1];
        tagContent = '';
        
        // Parse attributes
        const attributeString = openTagMatch[2];
        const typeMatch = attributeString.match(/type="([^"]*)"/);
        const filePathMatch = attributeString.match(/filePath="([^"]*)"/);
        
        tagAttributes = {
          type: typeMatch ? typeMatch[1] : '',
          filePath: filePathMatch ? filePathMatch[1] : ''
        };
        
        // If it's a file action, show file creation message
        if (tagAttributes.type === 'file' && tagAttributes.filePath) {
          const fileName = tagAttributes.filePath.split('/').pop();
          displayContent += `\n\n📝 Creating/updating **${fileName}**\n\n`;
        }
        continue;
      }
      
      // Check for closing tags
      const closeTagMatch = line.match(/<\/(Artifact|Action|boltArtifact|boltAction)>/);
      if (closeTagMatch && insideTag && closeTagMatch[1] === currentTag) {
        insideTag = false;
        
        // Process the collected tag content
        if (currentTag === 'Action' || currentTag === 'boltAction') {
          if (tagAttributes.type === 'file' && tagAttributes.filePath) {
            actions.push({
              type: 'file',
              path: tagAttributes.filePath,
              content: tagContent.trim()
            });
          }
        }
        
        currentTag = '';
        tagContent = '';
        tagAttributes = {};
        continue;
      }
      
      // If we're inside a tag, collect the content
      if (insideTag) {
        tagContent += line + '\n';
      } else {
        // If we're not inside a tag, add to display content
        displayContent += line + '\n';
      }
    }

    // Clean up extra newlines
    displayContent = displayContent.replace(/\n{3,}/g, '\n\n').trim();

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
        
        // Update the message content progressively with raw content first
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            // Parse and clean content for display
            const { displayContent } = parseStreamContent(assistantContent);
            lastMessage.content = displayContent;
          }
          return newMessages;
        });

        // Parse content and extract actions for file operations
        const { actions } = parseStreamContent(assistantContent);
        actions.forEach(async (action) => {
          if (action.type === 'file' && action.path && action.content) {
            pendingFileUpdates.add(action.path);
            try {
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
              
              pendingFileUpdates.delete(action.path);
              fileUpdateCount++;
            } catch (error) {
              console.error('Failed to write file:', error);
              pendingFileUpdates.delete(action.path);
            }
          }
        });
      });

      // Update file tree after streaming is complete
      setFiles(buildFileTree(projectFiles));
      
      // Wait a bit for any remaining file operations to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
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