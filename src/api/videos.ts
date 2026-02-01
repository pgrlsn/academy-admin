import apiClient from './client';
import { type VideoTranslation } from './translations';

export interface Video {
  id: number;
  title: string;
  description?: string;
  durationSeconds: number;
  videoUrl: string;
  thumbnailUrl?: string;
  sequenceOrder: number;
  /**
   * Whether this video is required for training completion.
   * Determined by mandatory track membership, not stored on the video.
   */
  isRequired?: boolean;
  isActive: boolean;
  deliveryTypes: string[];
  primaryLanguage?: string;
  translations?: VideoTranslation[];
  availableLanguages?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface VideoCreateRequest {
  title: string;
  description?: string;
  durationSeconds: number;
  videoUrl: string;
  thumbnailUrl?: string;
  sequenceOrder: number;
  isActive?: boolean;
  deliveryTypes: string[];
  primaryLanguage?: string;
}

export interface VideoUpdateRequest extends VideoCreateRequest {
  id: number;
}

export interface VideoListResponse {
  content: Video[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface VideoUploadResponse {
  videoUrl: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
}

// Fetch videos with pagination and filters
export const getVideos = async (params?: {
  page?: number;
  size?: number;
  title?: string;
  deliveryType?: string;
  isActive?: boolean;
}): Promise<VideoListResponse> => {
  const response = await apiClient.get('/academy/admin/videos', { params });
  return response.data;
};

// Fetch single video
export const getVideoById = async (id: number): Promise<Video> => {
  const response = await apiClient.get(`/academy/admin/videos/${id}`);
  return response.data;
};

// Create video
export const createVideo = async (video: VideoCreateRequest): Promise<Video> => {
  const response = await apiClient.post('/academy/admin/videos', video);
  return response.data;
};

// Update video
export const updateVideo = async (id: number, video: VideoUpdateRequest): Promise<Video> => {
  const response = await apiClient.put(`/academy/admin/videos/${id}`, video);
  return response.data;
};

// Delete video (soft delete)
export const deleteVideo = async (id: number): Promise<void> => {
  await apiClient.delete(`/academy/admin/videos/${id}`);
};

// Bulk update status
export const bulkUpdateVideoStatus = async (ids: number[], isActive: boolean): Promise<void> => {
  await apiClient.post('/academy/admin/videos/bulk-status', { ids, isActive });
};

// Upload video file
export const uploadVideo = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<VideoUploadResponse> => {
  const formData = new FormData();
  formData.append('video', file);  // Backend expects 'video' parameter

  const response = await apiClient.post('/academy/admin/videos/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });
  return response.data;
};

// Upload thumbnail
export const uploadThumbnail = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ thumbnailUrl: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/academy/admin/videos/upload-thumbnail', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });
  return response.data;
};

// Get available delivery types
export const getDeliveryTypes = async (): Promise<string[]> => {
  const response = await apiClient.get('/academy/admin/delivery-types');
  return response.data;
};

// Get all videos (for sequence order validation)
export const getAllVideos = async (): Promise<Video[]> => {
  const response = await apiClient.get('/academy/admin/videos');
  // Handle both array response and paginated response
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data.content || [];
};
