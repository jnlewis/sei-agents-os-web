export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  fullContent?: string;
  streamingActions?: Array<{
    id: number;
    type: 'file' | 'command';
    filePath?: string;
    contentType?: 'create' | 'replace' | 'delete';
    command?: string;
    targetDir?: string;
    isCompleted?: boolean;
  }>;
}

export interface ProjectFile {
  path: string;
  content: string;
  lastModified: number;
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}