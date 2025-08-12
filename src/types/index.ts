export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
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