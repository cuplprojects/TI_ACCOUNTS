import axiosInstance from '@/app/lib/axiosConfig';

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
 * Get all files for seller from a folder
 */
export const getSellerFiles = async (
  folder: string = ''
): Promise<FileItem[]> => {
  try {
    const params: any = {};
    if (folder) {
      params.folder = folder;
    }

    const response = await axiosInstance.get('/seller/files', { params });

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch files');
  }
};

/**
 * Upload single file for seller
 */
export const uploadSellerFile = async (
  file: File,
  folder: string
): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await axiosInstance.post('/seller/files/upload', formData, {
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
 * Bulk upload multiple files for seller
 */
export const bulkUploadSellerFiles = async (
  files: File[],
  folder: string
): Promise<BulkUploadResponse> => {
  try {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('folder', folder);

    const response = await axiosInstance.post(
      '/seller/files/bulk-upload',
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
 * Delete single file for seller
 */
export const deleteSellerFile = async (
  fileKey: string
): Promise<DeleteResponse> => {
  try {
    const response = await axiosInstance.delete(
      `/seller/files/delete/${encodeURIComponent(fileKey)}`
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
 * Delete multiple files for seller
 */
export const deleteMultipleSellerFiles = async (
  fileKeys: string[]
): Promise<DeleteMultipleResponse> => {
  try {
    const response = await axiosInstance.post(
      '/seller/files/delete-multiple',
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

/**
 * Get all object names for seller (folders within seller's folder)
 */
export const getSellerObjectNames = async (): Promise<string[]> => {
  try {
    const response = await axiosInstance.get('/seller/files/object-names');

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch object names');
  }
};
