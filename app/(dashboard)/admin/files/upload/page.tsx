'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { getAllObjectNames, uploadFile, bulkUploadFiles } from '@/app/services/fileService';

export default function UploadFilesPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [folder, setFolder] = useState('files/');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [totalProgress, setTotalProgress] = useState(0);

  // Load folders on mount with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadFolders();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const loadFolders = async () => {
    setIsLoadingFolders(true);
    try {
      const folderList = await getAllObjectNames();
      
      // Flatten the nested tree structure to get all folder paths
      const flattenFolders = (nodes: any[]): string[] => {
        const paths: string[] = [];
        const traverse = (node: any) => {
          if (node && node.path) {
            paths.push(node.path);
          }
          if (Array.isArray(node?.children)) {
            node.children.forEach(traverse);
          }
        };
        
        if (Array.isArray(nodes)) {
          nodes.forEach(traverse);
        }
        return paths;
      };
      
      const flatPaths = flattenFolders(folderList);
      // Remove duplicates
      const uniqueFolders = Array.from(new Set(flatPaths));
      setFolders(uniqueFolders);
    } catch (error) {
      console.error('Failed to load folders:', error);
      setFolders([]);
    } finally {
      setIsLoadingFolders(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Check for duplicates
      const updatedFiles = [...selectedFiles];
      const selectedFileNames = new Set(selectedFiles.map(f => f.name));
      
      newFiles.forEach(newFile => {
        if (selectedFileNames.has(newFile.name)) {
          // Replace existing file with same name
          const index = updatedFiles.findIndex(f => f.name === newFile.name);
          updatedFiles[index] = newFile;
          Swal.fire('Info', `File "${newFile.name}" was already selected and has been replaced`, 'info');
        } else {
          // Add new file
          updatedFiles.push(newFile);
        }
      });
      
      setSelectedFiles(updatedFiles);
    }
  };

  // Remove file from selection
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Bulk upload with progress
  const handleBulkUpload = async () => {
    if (selectedFiles.length === 0) {
      Swal.fire('Error', 'Please select files', 'error');
      return;
    }

    try {
      setUploading(true);
      setTotalProgress(0);

      const totalFiles = selectedFiles.length;
      const progressPerFile = 100 / totalFiles;
      let successCount = 0;
      let failedFiles: string[] = [];

      // Upload files one by one and track progress
      for (let i = 0; i < totalFiles; i++) {
        const file = selectedFiles[i];

        try {
          await uploadFile(file, folder);
          successCount++;
        } catch (error: any) {
          console.error(`Failed to upload ${file.name}:`, error);
          failedFiles.push(`${file.name}: ${error.message}`);
        }

        // Update progress after each file
        setTotalProgress((i + 1) * progressPerFile);
      }

      setUploading(false);
      setTotalProgress(0);

      // Show results
      if (failedFiles.length === 0) {
        Swal.fire(
          'Success',
          `Successfully uploaded ${successCount} file(s)`,
          'success'
        );
        setSelectedFiles([]);
        router.push('/admin/files');
      } else if (successCount > 0) {
        Swal.fire(
          'Partial Success',
          `Uploaded ${successCount} file(s)\n\nFailed:\n${failedFiles.join('\n')}`,
          'warning'
        );
        setSelectedFiles([]);
        router.push('/admin/files');
      } else {
        Swal.fire(
          'Error',
          `Failed to upload files:\n${failedFiles.join('\n')}`,
          'error'
        );
        setUploading(false);
      }
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
      setUploading(false);
      setTotalProgress(0);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/files" className="text-blue-600 hover:underline text-sm mb-4 inline-block">
          ← Back to Files
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Upload Files</h1>
        <p className="text-gray-600 text-sm mt-1">Upload files to your storage</p>
      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        {/* Folder Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Folder
          </label>
          <select
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            disabled={isLoadingFolders || uploading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          >
            <option value="files/">files/ (Default)</option>
            {folders.map((f, index) => (
              <option key={index} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Images (Max 100 files, 5MB each)
          </label>
          <div className={`border-2 border-dashed rounded-lg p-8 text-center transition cursor-pointer ${
            uploading ? 'border-gray-300 bg-gray-100' : 'border-gray-300 bg-gray-100 hover:border-blue-500'
          }`}>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml,image/bmp"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input" className={`cursor-pointer ${uploading ? 'pointer-events-none' : ''}`}>
              <div className={uploading ? 'text-gray-400' : 'text-gray-600'}>
                <p className="font-medium">Click to select images or drag and drop</p>
                <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF, WebP, SVG, BMP up to 5MB each</p>
              </div>
            </label>
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Selected Images ({selectedFiles.length})
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-100 rounded-lg hover:bg-gray-100">
                    <div className="flex-1">
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    {!uploading && (
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-800 ml-4"
                        title="Remove file"
                      >
                        <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {uploading && (
                <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-semibold text-blue-900">Upload Progress</p>
                    <span className="text-sm font-semibold text-blue-900">{Math.min(Math.round(totalProgress), 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-primary h-3 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(totalProgress, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Link
            href="/admin/files"
            className={`px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium ${
              uploading ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            Cancel
          </Link>
          <button
            onClick={handleBulkUpload}
            disabled={uploading || selectedFiles.length === 0}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:bg-gray-400 transition font-medium"
          >
            {uploading ? `Uploading... ${Math.min(Math.round(totalProgress), 100)}%` : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}
