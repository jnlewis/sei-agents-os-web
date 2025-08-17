import { Message, ProjectFile } from '../types';
import { filterProjectFiles, shouldExcludeFile } from '../config/fileFilters';

export class ApiService {
  private readonly API_KEY = 'demoApiKey';
  private readonly TEMPLATE_URL = 'https://ip6c7bfrslspyjyuke6n7fo5sq0ctelb.lambda-url.us-east-1.on.aws/';
  private readonly STREAMING_URL = 'https://3e7vnnbximfzwowqpxnsww3tbu0zjkaq.lambda-url.us-east-1.on.aws/';

  async getTemplate(): Promise<ProjectFile[]> {
    try {
      console.log('Making template API request to:', this.TEMPLATE_URL);
      console.log('Using API key:', this.API_KEY);
      
      const response = await fetch(this.TEMPLATE_URL, {
        method: 'GET',
        headers: {
          'seiagents-api-key': this.API_KEY,
        },
      });

      console.log('Template API response status:', response.status);
      console.log('Template API response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Template API error response:', errorText);
        throw new Error(`Template API failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('Template API response data:', data);
      
      if (!data.success) {
        console.error('Template API returned unsuccessful response:', data);
        throw new Error(data.error || 'Template API returned unsuccessful response');
      }

      console.log('Template files count:', data.files?.length || 0);
      return data.files.map((file: any) => ({
        path: file.path,
        content: file.content,
        lastModified: Date.now()
      }));
    } catch (error) {
      console.error('Template API error - Full details:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network error - check if the API endpoint is accessible');
      }
      throw error;
    }
  }

  async streamChat(
    requestData: {
      messages: Message[];
      isFirstPrompt: boolean;
      projectId: string;
      projectFiles?: {
        visible: ProjectFile[];
        hidden: string[];
      };
    },
    onChunk: (chunk: string) => void
  ): Promise<void> {
    try {
      // Apply file filtering before sending to API
      let filteredRequestData = { ...requestData };
      
      if (requestData.projectFiles?.visible) {
        const originalCount = requestData.projectFiles.visible.length;
        
        // First layer: Apply central filtering
        const filteredFiles = filterProjectFiles(requestData.projectFiles.visible);
        
        // Second layer: Double-check for critical exclusions
        const doubleFilteredFiles = filteredFiles.filter(file => {
          const shouldExclude = shouldExcludeFile(file.path);
          if (shouldExclude) {
            console.warn(`CRITICAL: File ${file.path} was caught by second filter layer!`);
          }
          return !shouldExclude;
        });
        
        // Third layer: Explicit check for node_modules, dist, build in app/ and contracts/
        const finalFilteredFiles = doubleFilteredFiles.filter(file => {
          const path = file.path.toLowerCase();
          const criticalPaths = [
            'app/node_modules',
            'app/dist',
            'app/build',
            'contracts/node_modules',
            'contracts/dist',
            'contracts/build'
          ];
          
          for (const criticalPath of criticalPaths) {
            if (path.startsWith(criticalPath) || path.includes(`/${criticalPath}/`)) {
              console.error(`BLOCKED: Attempted to send critical path ${file.path}`);
              return false;
            }
          }
          return true;
        });
        
        filteredRequestData.projectFiles = {
          ...requestData.projectFiles,
          visible: finalFilteredFiles
        };
        
        console.log(`File filtering summary: ${originalCount} -> ${finalFilteredFiles.length} files`);
        
        // Log what types of files are being sent for debugging
        const fileTypes = finalFilteredFiles.reduce((acc, file) => {
          const ext = file.path.split('.').pop() || 'no-ext';
          acc[ext] = (acc[ext] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        console.log('File types being sent:', fileTypes);
      }

      const response = await fetch(this.STREAMING_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'seiagents-api-key': this.API_KEY,
        },
        body: JSON.stringify(filteredRequestData),
      });

      if (!response.ok) {
        throw new Error(`Streaming API failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          onChunk(chunk);
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Streaming API error:', error);
      throw error;
    }
  }
}