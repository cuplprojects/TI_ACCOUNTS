'use client';

import React, { useEffect, useState } from 'react';
import { usePageTitle } from '@/app/providers/PageTitleProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faSearch,
  faEye,
  faTrash,
  faChevronLeft,
  faChevronRight,
  faCopy,
  faImage,
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import Swal from 'sweetalert2';
import {
  getAllFiles,
  deleteMultipleFiles,
  getAllObjectNames,
} from '@/app/services/fileService';
import { getFileType, getFileTypeColor, truncateFileName } from '@/app/utils/fileUtils';
import FolderTree from '@/app/components/FolderTree';
import ImageModal from '@/app/components/common/ImageModal';

interface FileItem {
  key: string;
  fileName: string;
  size: number;
  lastModified: string;
  etag: string;
  storageClass: string;
  publicUrl: string;
}

interface FolderNode {
  name: string;
  path: string;
  children: FolderNode[];
}

export default function FilesPage() {
  const { setTitle } = usePageTitle();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<string>('files/');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedFileKeys, setSelectedFileKeys] = useState<string[]>([]);
  const [objectNames, setObjectNames] = useState<FolderNode[]>([]);
  const [selectedFileType, setSelectedFileType] = useState<string>('');
  const [isFoldersLoading, setIsFoldersLoading] = useState(true);
  const [modalImage, setModalImage] = useState<FileItem | null>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when search term changes
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm]);

  // Fetch files
  useEffect(() => {
    loadFiles();
  }, [selectedFolder, debouncedSearchTerm]);

  // Load object names on mount
  useEffect(() => {
    loadObjectNames();
  }, []);

  // Reset page when folder selection changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFolder]);

  useEffect(() => {
    setTitle('Files');
  }, [setTitle]);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      // Check if selectedFolder is a parent folder (ends with / and has no files)
      // Only load files from actual file folders, not parent directories
      const data = await getAllFiles(selectedFolder);
      setFiles(data);
    } catch (error) {
      console.error('Failed to load files:', error);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadObjectNames = async () => {
    setIsFoldersLoading(true);
    try {
      const folders = await getAllObjectNames();
      // Ensure folders is an array, if it's a single object, wrap it
      const folderArray = Array.isArray(folders) ? folders : [folders];
      setObjectNames(folderArray);
    } catch (error) {
      console.error('Failed to load folders:', error);
      setObjectNames([]);
    } finally {
      setIsFoldersLoading(false);
    }
  };

  // Filter files based on search, selected folder, and file type
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.fileName.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    const matchesFileType = selectedFileType === '' || getFileType(file.fileName) === selectedFileType;
    return matchesSearch && matchesFileType;
  });

  // Sort by newest first (most recent lastModified date)
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    const dateA = new Date(a.lastModified).getTime();
    const dateB = new Date(b.lastModified).getTime();
    return dateB - dateA; // Newest first
  });

  // Paginate files
  const paginatedFiles = sortedFiles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedFiles.length / itemsPerPage);

  // Handle delete file - using bulk delete method
  const handleDeleteFile = async (fileKey: string) => {
    const result = await Swal.fire({
      title: 'Delete File?',
      html: `<div style="text-align: center;">
        <p style="margin-bottom: 12px;">This action cannot be undone.</p>
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 4px; margin-bottom: 12px; text-align: left;">
          <p style="margin: 0; color: #92400e; font-weight: 500;">⚠️ Warning</p>
          <p style="margin: 8px 0 0 0; color: #92400e; font-size: 14px;">Please make sure this image is not being used anywhere in your products, collections, or other content before deleting.</p>
        </div>
      </div>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
    });

    if (result.isConfirmed) {
      try {
        const response = await deleteMultipleFiles([fileKey]);
        Swal.fire('Deleted', `Deleted ${response.data.deletedCount} file(s)`, 'success');
        loadFiles();
      } catch (error: any) {
        Swal.fire('Error', error.message, 'error');
      }
    }
  };

  // Handle delete multiple files
  const handleDeleteMultiple = async () => {
    if (selectedFileKeys.length === 0) {
      Swal.fire('Error', 'Please select files to delete', 'error');
      return;
    }

    const { value: confirmText } = await Swal.fire({
      title: 'Delete Files?',
      html: `<div style="text-align: center; user-select: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none;">
        <p style="margin-bottom: 12px; font-weight: 500;">Delete ${selectedFileKeys.length} file(s)? This action cannot be undone.</p>
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 4px; margin-bottom: 16px; text-align: left;">
          <p style="margin: 0; color: #92400e; font-weight: 500;">⚠️ Warning</p>
          <p style="margin: 8px 0 0 0; color: #92400e; font-size: 14px;">Please make sure these files are not being used anywhere in your products, collections, or other content before deleting.</p>
        </div>
        <p style="margin-bottom: 8px; font-size: 14px; color: #666;">Type <strong style="color: #dc2626;">DELETE ALL</strong> to confirm:</p>
      </div>`,
      input: 'text',
      inputPlaceholder: 'Type DELETE ALL',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      didOpen: () => {
        const input = Swal.getInput();
        if (input) {
          input.setAttribute('autocomplete', 'off');
        }
      },
      inputValidator: (value) => {
        if (!value) {
          return 'Please type DELETE ALL to confirm';
        }
        if (value !== 'DELETE ALL') {
          return 'Please type exactly "DELETE ALL" to confirm';
        }
      },
    });

    if (confirmText === 'DELETE ALL') {
      try {
        const response = await deleteMultipleFiles(selectedFileKeys);
        Swal.fire(
          'Deleted',
          `Deleted ${response.data.deletedCount} file(s)`,
          'success'
        );
        setSelectedFileKeys([]);
        loadFiles();
      } catch (error: any) {
        Swal.fire('Error', error.message, 'error');
      }
    }
  };

  // Toggle file selection
  const toggleFileSelection = (fileKey: string) => {
    setSelectedFileKeys(prev =>
      prev.includes(fileKey)
        ? prev.filter(k => k !== fileKey)
        : [...prev, fileKey]
    );
  };

  // Toggle all files selection
  const toggleAllSelection = () => {
    if (selectedFileKeys.length === paginatedFiles.length) {
      setSelectedFileKeys([]);
    } else {
      setSelectedFileKeys(paginatedFiles.map(f => f.key));
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Generate page numbers
  const generatePageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const adjacentPages = 2;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);

      const startPage = Math.max(2, currentPage - adjacentPages);
      const endPage = Math.min(totalPages - 1, currentPage + adjacentPages);

      if (startPage > 2) {
        pageNumbers.push('...');
      }

      for (let i = startPage; i <= endPage; i++) {
        if (i !== 1 && i !== totalPages) {
          pageNumbers.push(i);
        }
      }

      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }

      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  return (
    <div className="flex gap-4 h-screen">
      {/* Sidebar - Folder Tree with own scroller */}
      <div className="w-56 bg-gray-bg rounded-lg overflow-hidden flex flex-col">
        {isFoldersLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="animate-pulse">
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-y-auto flex-1">
            <FolderTree
              folders={objectNames}
              selectedFolder={selectedFolder}
              onSelectFolder={(folder) => {
                setSelectedFolder(folder);
                setCurrentPage(1);
              }}
            />
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header and Search */}
        <div className="bg-gray-bg rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <select
                value={selectedFileType}
                onChange={(e) => {
                  setSelectedFileType(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-white border border-gray-line rounded-md xsmall focus:outline-none"
                title="Filter by file type"
              >
                <option value="">All Types</option>
                <option value="Image">Image</option>
                <option value="Document">Document</option>
                <option value="Excel">Excel</option>
                <option value="Video">Video</option>
                <option value="Audio">Audio</option>
                <option value="Archive">Archive</option>
                <option value="File">Other</option>
              </select>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center flex-1 max-w-md">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-line rounded-md xsmall placeholder:xsmall focus:outline-none text-gray-10"
                  />
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-10 h-3 w-3"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 bg-white border border-gray-line rounded-md xsmall focus:outline-none"
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>

                {selectedFileKeys.length > 0 && (
                  <button
                    onClick={handleDeleteMultiple}
                    className="px-4 py-2 bg-red-600 text-white rounded-md xsmall-semibold"
                  >
                    Delete Selected ({selectedFileKeys.length})
                  </button>
                )}

                <Link
                  href="/admin/files/upload"
                  className="px-4 py-2 bg-primary text-white rounded-md xsmall-semibold flex items-center"
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  Add Files
                </Link>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-md">
            <table className="min-w-full rounded-md">
              <thead className="bg-gray-line">
                <tr>
                  <th className="w-8 px-6 py-3">
                    <input
                      type="checkbox"
                      checked={selectedFileKeys.length === paginatedFiles.length && paginatedFiles.length > 0}
                      onChange={toggleAllSelection}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                    File Name
                  </th>
                  <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                    Modified
                  </th>
                  <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-line">
                {isLoading ? (
                  Array.from({ length: itemsPerPage }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-4"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-40"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    </tr>
                  ))
                ) : paginatedFiles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col gap-2 justify-center items-center">
                        {searchTerm ? (
                          <span>No files found matching your search criteria.</span>
                        ) : (
                          <span>No files found. Upload one!</span>
                        )}
                        <Link
                          href="/admin/files/upload"
                          className="px-4 py-2 bg-primary text-white rounded-md xsmall-semibold flex items-center"
                        >
                          <FontAwesomeIcon icon={faPlus} className="mr-2" />
                          Upload Files
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedFiles.map((file) => (
                    <tr key={file.key} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedFileKeys.includes(file.key)}
                          onChange={() => toggleFileSelection(file.key)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4">
                        {getFileType(file.fileName) === 'Image' ? (
                          <div className="flex items-center gap-3">
                            <div
                              className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => setModalImage(file)}
                            >
                              <img
                                src={file.publicUrl}
                                alt={file.fileName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                              <div className="hidden w-full h-full flex items-center justify-center bg-gray-200">
                                <FontAwesomeIcon icon={faImage} className="text-gray-400 h-6 w-6" />
                              </div>
                            </div>
                            <button
                              onClick={() => setModalImage(file)}
                              className="text-blue-600 hover:underline truncate xsmall"
                              title={file.fileName}
                            >
                              {truncateFileName(file.fileName, 30)}
                            </button>
                          </div>
                        ) : (
                          <a
                            href={file.publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline truncate xsmall"
                            title={file.fileName}
                          >
                            {truncateFileName(file.fileName, 30)}
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getFileTypeColor(file.fileName)}`}>
                          {getFileType(file.fileName)}
                        </span>
                      </td>
                      <td className="px-6 py-4 xsmall text-gray-10">
                        {formatFileSize(file.size)}
                      </td>
                      <td className="px-6 py-4 xsmall text-gray-10">
                        {new Date(file.lastModified).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {getFileType(file.fileName) === 'Image' ? (
                            <button
                              onClick={() => setModalImage(file)}
                              className="text-blue-600 hover:text-blue-800"
                              title="View"
                            >
                              <FontAwesomeIcon icon={faEye} className="h-5 w-5" />
                            </button>
                          ) : (
                            <a
                              href={file.publicUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                              title="View"
                            >
                              <FontAwesomeIcon icon={faEye} className="h-5 w-5" />
                            </a>
                          )}
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(file.publicUrl);
                              Swal.fire({
                                title: 'Copied!',
                                text: 'URL copied to clipboard',
                                icon: 'success',
                                timer: 2000,
                                timerProgressBar: true,
                                showConfirmButton: false,
                              });
                            }}
                            className="text-gray-600 hover:text-gray-800"
                            title="Copy URL"
                          >
                            <FontAwesomeIcon icon={faCopy} className="h-5 w-5" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                            onClick={() => handleDeleteFile(file.key)}
                          >
                            <FontAwesomeIcon icon={faTrash} className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-gray-10 xsmall">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, sortedFiles.length)} of{' '}
                {sortedFiles.length} files
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md xsmall-semibold flex items-center ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-line text-gray-10 hover:bg-gray-50'
                  }`}
                >
                  <FontAwesomeIcon icon={faChevronLeft} className="mr-1" />
                  Previous
                </button>

                {generatePageNumbers().map((pageNumber, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      typeof pageNumber === 'number'
                        ? setCurrentPage(pageNumber)
                        : undefined
                    }
                    disabled={typeof pageNumber === 'string'}
                    className={`px-3 py-1 rounded-md xsmall-semibold ${
                      typeof pageNumber === 'string'
                        ? 'bg-transparent text-gray-10 cursor-default'
                        : pageNumber === currentPage
                        ? 'bg-primary text-white'
                        : 'bg-white border border-gray-line text-gray-10 hover:bg-gray-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md xsmall-semibold flex items-center ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-line text-gray-10 hover:bg-gray-50'
                  }`}
                >
                  Next
                  <FontAwesomeIcon icon={faChevronRight} className="ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={!!modalImage}
        imageUrl={modalImage?.publicUrl || ''}
        fileName={modalImage?.fileName || ''}
        onClose={() => setModalImage(null)}
      />
    </div>
  );
}
