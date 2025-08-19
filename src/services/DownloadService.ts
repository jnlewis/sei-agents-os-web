import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ProjectFile } from '../types';
import { shouldExcludeFile, FILE_FILTER_CONFIG } from '../config/fileFilters';

export class DownloadService {
  static async downloadProjectFiles(
    files: ProjectFile[], 
    type: 'all' | 'app' | 'contracts',
    projectName: string = 'sei-project'
  ): Promise<void> {
    try {
      const zip = new JSZip();
      
      // Filter files based on download type
      const filteredFiles = this.filterFilesByType(files, type);
      
      if (filteredFiles.length === 0) {
        console.warn(`No files found for download type: ${type}`);
        return;
      }

      // Add files to zip
      filteredFiles.forEach(file => {
        // For app-only downloads, remove the 'app/' prefix from paths
        let zipPath = file.path;
        if (type === 'app' && file.path.startsWith('app/')) {
          zipPath = file.path.substring(4); // Remove 'app/' prefix
        }
        // For contracts-only downloads, remove the 'contracts/' prefix from paths
        else if (type === 'contracts' && file.path.startsWith('contracts/')) {
          zipPath = file.path.substring(10); // Remove 'contracts/' prefix
        }
        
        zip.file(zipPath, file.content);
      });

      // Generate zip file
      const content = await zip.generateAsync({ type: 'blob' });
      
      // Download the file
      const fileName = this.getFileName(type, projectName);
      saveAs(content, fileName);
      
      console.log(`Downloaded ${filteredFiles.length} files as ${fileName}`);
    } catch (error) {
      console.error('Failed to download files:', error);
      throw new Error('Failed to generate download. Please try again.');
    }
  }

  private static filterFilesByType(files: ProjectFile[], type: 'all' | 'app' | 'contracts'): ProjectFile[] {
    // First apply the central file filtering
    const centrallyFiltered = files.filter(file => {
      // Apply path-based filtering from config
      if (shouldExcludeFile(file.path)) {
        console.log(`Download: Filtering out file: ${file.path} (excluded by central config)`);
        return false;
      }
      
      // Apply size-based filtering from config
      if (file.content.length > FILE_FILTER_CONFIG.maxFileSize) {
        console.log(`Download: Filtering out file: ${file.path} (too large: ${file.content.length} bytes)`);
        return false;
      }
      
      return true;
    });
    
    // Then apply type-specific filtering
    switch (type) {
      case 'app':
        return centrallyFiltered.filter(file => 
          file.path.startsWith('app/')
        );
      
      case 'contracts':
        return centrallyFiltered.filter(file => 
          file.path.startsWith('contracts/')
        );
      
      case 'all':
      default:
        return centrallyFiltered;
    }
  }

  private static getFileName(type: 'all' | 'app' | 'contracts', projectName: string): string {
    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    
    switch (type) {
      case 'app':
        return `${projectName}-webapp-${timestamp}.zip`;
      case 'contracts':
        return `${projectName}-contracts-${timestamp}.zip`;
      case 'all':
      default:
        return `${projectName}-complete-${timestamp}.zip`;
    }
  }
}