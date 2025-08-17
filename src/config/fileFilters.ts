// Central configuration for file filtering
export const FILE_FILTER_CONFIG = {
  // Directories to exclude completely
  excludedDirectories: [
    'node_modules',
    'dist',
    'build',
    'artifacts',
    '.git',
    '.next',
    'coverage',
    '.nyc_output',
    'tmp',
    'temp',
    '.cache',
    '.parcel-cache',
    '.vscode',
    '.idea'
  ],
  
  // File extensions to exclude
  excludedExtensions: [
    '.log',
    '.tmp',
    '.temp',
    '.cache',
    '.lock',
    '.DS_Store',
    '.env.local',
    '.env.development.local',
    '.env.test.local',
    '.env.production.local'
  ],
  
  // Specific files to exclude
  excludedFiles: [
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    '.gitignore',
    '.eslintcache',
    'thumbs.db'
  ],
  
  // Maximum file size in bytes (1MB)
  maxFileSize: 1024 * 1024,
  
  // Maximum total files to send
  maxTotalFiles: 100
};

export function shouldExcludeFile(filePath: string): boolean {
  const normalizedPath = filePath.toLowerCase();
  
  // Check if path contains any excluded directory
  for (const dir of FILE_FILTER_CONFIG.excludedDirectories) {
    if (normalizedPath.includes(`/${dir}/`) || normalizedPath.startsWith(`${dir}/`) || normalizedPath.endsWith(`/${dir}`)) {
      return true;
    }
  }
  
  // Check file extension
  for (const ext of FILE_FILTER_CONFIG.excludedExtensions) {
    if (normalizedPath.endsWith(ext)) {
      return true;
    }
  }
  
  // Check specific filenames
  const fileName = filePath.split('/').pop()?.toLowerCase() || '';
  if (FILE_FILTER_CONFIG.excludedFiles.includes(fileName)) {
    return true;
  }
  
  return false;
}

export function filterProjectFiles(files: Array<{ path: string; content: string; lastModified: number }>) {
  const filtered = files.filter(file => {
    // Apply path-based filtering
    if (shouldExcludeFile(file.path)) {
      console.log(`Filtering out file: ${file.path} (excluded by path/extension)`);
      return false;
    }
    
    // Apply size-based filtering
    if (file.content.length > FILE_FILTER_CONFIG.maxFileSize) {
      console.log(`Filtering out file: ${file.path} (too large: ${file.content.length} bytes)`);
      return false;
    }
    
    return true;
  });
  
  // Limit total number of files
  if (filtered.length > FILE_FILTER_CONFIG.maxTotalFiles) {
    console.log(`Limiting files from ${filtered.length} to ${FILE_FILTER_CONFIG.maxTotalFiles}`);
    return filtered.slice(0, FILE_FILTER_CONFIG.maxTotalFiles);
  }
  
  console.log(`Sending ${filtered.length} files to API (filtered from ${files.length})`);
  return filtered;
}