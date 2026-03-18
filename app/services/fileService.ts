import axiosInstance from '@/app/lib/axiosConfig';

interface FolderNode {
  name: string;
  path: string;
  children: FolderNode[];
}

interface FileItem {
  key: string;
  fileName: string;
  size: number;
  lastModified: string;
  etag: string;
  storageClass: string;
  publicUrl: string;
}

interface UploadResponse {
  success: boolean;
  data: any;
  message: string;
}

interface BulkUploadResponse {
  success: boolean;
  data: {
    totalFiles: number;
    successCount: number;
    failureCount: number;
    successful: any[];
    failed: any[];
  };
  message: string;
}

interface DeleteResponse {
  success: boolean;
  data: any;
  message: string;
}

interface DeleteMultipleResponse {
  success: boolean;
  data: {
    totalFiles: number;
    deletedCount: number;
    failureCount: number;
    deleted: any[];
    failed: any[];
  };
  message: string;
}

/**
 * Get all files from a folder
 */
export const getAllFiles = async (
  folder: string = 'files/'
): Promise<FileItem[]> => {
  try {
    const response = await axiosInstance.get('/admin/files', {
      params: { folder },
    });

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch files');
  }
};

/**
 * Get single file by key
 */
export const getFileByKey = async (
  fileKey: string
): Promise<FileItem> => {
  try {
    const response = await axiosInstance.get(
      `/admin/files/get/${encodeURIComponent(fileKey)}`
    );

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get file');
  }
};

/**
 * Upload single file
 */
export const uploadFile = async (
  file: File,
  folder: string = 'files/'
): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await axiosInstance.post('/admin/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.message);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to upload file');
  }
};

/**
 * Bulk upload multiple files
 */
export const bulkUploadFiles = async (
  files: File[],
  folder: string = 'files/'
): Promise<BulkUploadResponse> => {
  try {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('folder', folder);

    const response = await axiosInstance.post(
      '/admin/files/bulk-upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.message);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to bulk upload files');
  }
};

/**
 * Update/replace file
 */
export const updateFile = async (
  fileKey: string,
  file: File
): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.put(
      `/admin/files/update/${encodeURIComponent(fileKey)}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.message);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update file');
  }
};

/**
 * Delete single file
 */
export const deleteFile = async (
  fileKey: string
): Promise<DeleteResponse> => {
  try {
    const response = await axiosInstance.delete(
      `/admin/files/delete/${encodeURIComponent(fileKey)}`
    );

    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.message);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete file');
  }
};

/**
 * Delete multiple files
 */
export const deleteMultipleFiles = async (
  fileKeys: string[]
): Promise<DeleteMultipleResponse> => {
  try {
    const response = await axiosInstance.post(
      '/admin/files/delete-multiple',
      { fileKeys }
    );

    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.message);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete files');
  }
};

interface FolderNode {
  name: string;
  path: string;
  children: FolderNode[];
}

/**
 * Get all unique object names from S3 as nested tree structure
 */
export const getAllObjectNames = async (): Promise<FolderNode[]> => {
  try {
    const response = await axiosInstance.get('/admin/files/object-names');

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch object names');
  }
};

/**
 * Get paginated files from a folder
 */
export const getFilesPaginated = async (
  folder: string = 'files/',
  pageSize: number = 50,
  continuationToken: string | null = null
): Promise<{
  files: FileItem[];
  nextToken: string | null;
  isTruncated: boolean;
  totalCount: number;
}> => {
  try {
    const params: any = { folder, pageSize };
    if (continuationToken) {
      params.token = continuationToken;
    }

    const response = await axiosInstance.get('/admin/files/paginated', { params });

    if (response.data.success) {
      return {
        files: response.data.data,
        nextToken: response.data.nextToken,
        isTruncated: response.data.isTruncated,
        totalCount: response.data.totalCount,
      };
    }
    throw new Error(response.data.message);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch paginated files');
  }
};
