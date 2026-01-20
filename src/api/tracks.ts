import client from './client';

export interface VideoSummary {
  id: number;
  title: string;
  thumbnailUrl?: string;
  durationSeconds: number;
  sequenceOrder: number;
}

export interface MandatoryTrack {
  id: number;
  deliveryType: string;
  videoIds: number[];
  videos: VideoSummary[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MandatoryTrackUpdateRequest {
  deliveryType: string;
  videoIds: number[];
  isActive?: boolean;
}

// Delivery types constants
export const DELIVERY_TYPES = [
  { value: 'AMAZON', label: 'Amazon' },
  { value: 'BLUEDART', label: 'BlueDart' },
  { value: 'DELHIVERY', label: 'Delhivery' },
  { value: 'SWIGGY', label: 'Swiggy' },
  { value: 'ZOMATO', label: 'Zomato' },
];

/**
 * Get all mandatory tracks
 */
export const getAllTracks = async (): Promise<MandatoryTrack[]> => {
  const response = await client.get<MandatoryTrack[]>('/academy/admin/tracks');
  return response.data;
};

/**
 * Get track by delivery type
 */
export const getTrackByDeliveryType = async (deliveryType: string): Promise<MandatoryTrack | null> => {
  try {
    const response = await client.get<MandatoryTrack>(`/academy/admin/tracks/${deliveryType}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * Get available videos for a delivery type
 */
export const getAvailableVideos = async (deliveryType: string): Promise<VideoSummary[]> => {
  const response = await client.get<VideoSummary[]>(`/academy/admin/tracks/${deliveryType}/available-videos`);
  return response.data;
};

/**
 * Save (create or update) a mandatory track
 */
export const saveTrack = async (request: MandatoryTrackUpdateRequest): Promise<MandatoryTrack> => {
  const response = await client.post<MandatoryTrack>('/academy/admin/tracks', request);
  return response.data;
};

/**
 * Copy track configuration from one delivery type to another
 */
export const copyTrack = async (sourceDeliveryType: string, targetDeliveryType: string): Promise<MandatoryTrack> => {
  const response = await client.post<MandatoryTrack>(
    '/academy/admin/tracks/copy',
    null,
    { params: { sourceDeliveryType, targetDeliveryType } }
  );
  return response.data;
};

/**
 * Delete (deactivate) a mandatory track
 */
export const deleteTrack = async (id: number): Promise<void> => {
  await client.delete(`/academy/admin/tracks/${id}`);
};

/**
 * Format duration in seconds to mm:ss
 */
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
