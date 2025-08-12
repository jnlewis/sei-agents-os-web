import { Message, ProjectFile } from '../types';

export class ApiService {
  private readonly API_KEY = 'demoApiKey';
  private readonly TEMPLATE_URL = '/api/template';
  private readonly STREAMING_URL = 'https://q2jgpxpl7y7tvn7nkfem5ro7hy0uigkb.lambda-url.us-east-1.on.aws';

  async getTemplate(): Promise<ProjectFile[]> {
    try {
      const response = await fetch(this.TEMPLATE_URL, {
        method: 'GET',
        headers: {
          'seiagents-api-key': this.API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`Template API failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Template API returned unsuccessful response');
      }

      return data.files.map((file: any) => ({
        path: file.path,
        content: file.content,
        lastModified: Date.now()
      }));
    } catch (error) {
      console.error('Template API error:', error);
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
      const response = await fetch(this.STREAMING_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'seiagents-api-key': this.API_KEY,
        },
        body: JSON.stringify(requestData),
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