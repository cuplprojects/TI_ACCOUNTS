/**
 * Get file extension from filename
 */
export const getFileExtension = (fileName: string): string => {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'FILE';
};

/**
 * Get file type category
 */
export const getFileType = (fileName: string): string => {
  const ext = getFileExtension(fileName).toLowerCase();
  
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
  const documentExts = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt'];
  const excelExts = ['xls', 'xlsx', 'csv'];
  const videoExts = ['mp4', 'avi', 'mov', 'mkv', 'flv', 'wmv'];
  const audioExts = ['mp3', 'wav', 'flac', 'aac', 'm4a'];
  const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz'];

  if (imageExts.includes(ext)) return 'Image';
  if (documentExts.includes(ext)) return 'Document';
  if (excelExts.includes(ext)) return 'Excel';
  if (videoExts.includes(ext)) return 'Video';
  if (audioExts.includes(ext)) return 'Audio';
  if (archiveExts.includes(ext)) return 'Archive';
  
  return 'File';
};

/**
 * Get file type color
 */
export const getFileTypeColor = (fileName: string): string => {
  const type = getFileType(fileName);
  
  switch (type) {
    case 'Image':
      return 'bg-blue-50 text-blue-700';
    case 'Document':
      return 'bg-red-50 text-red-700';
    case 'Excel':
      return 'bg-green-100 text-green-700';
    case 'Video':
      return 'bg-purple-50 text-purple-700';
    case 'Audio':
      return 'bg-orange-50 text-orange-700';
    case 'Archive':
      return 'bg-yellow-50 text-yellow-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

/**
 * Truncate filename keeping extension
 * Example: "very-long-filename-here.jpg" -> "very-long-fi...jpg"
 */
export const truncateFileName = (fileName: string, maxLength: number = 30): string => {
  if (fileName.length <= maxLength) {
    return fileName;
  }

  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex === -1) {
    // No extension
    return fileName.substring(0, maxLength - 3) + '...';
  }

  const extension = fileName.substring(lastDotIndex);
  const nameWithoutExt = fileName.substring(0, lastDotIndex);
  const availableLength = maxLength - extension.length - 3; // 3 for "..."

  if (availableLength <= 0) {
    return '...' + extension;
  }

  return nameWithoutExt.substring(0, availableLength) + '...' + extension;
};
