import client from './client';

export interface AnalyticsOverview {
  totalRiders: number;
  completedTraining: number;
  inProgress: number;
  notStarted: number;
  completionRate: number;
  avgCompletionDays: number;
  avgQuizScore: number;
  totalVideosWatched: number;
  totalQuizzesPassed: number;
}

export interface RiderProgressSummary {
  riderId: number;
  riderName: string;
  contactNumber: string;
  deliveryType: string;
  status: string;
  videosCompleted: number;
  totalVideos: number;
  avgQuizScore: number | null;
  startedAt: string | null;
  completedAt: string | null;
}

export interface RiderProgressListResponse {
  riders: RiderProgressSummary[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface VideoAnalytics {
  videoId: number;
  title: string;
  durationSeconds: number;
  totalViews: number;
  completions: number;
  avgWatchTimeSeconds: number;
  avgWatchPercentage: number;
  quizAttempts: number;
  quizPasses: number;
  quizPassRate: number;
  avgQuizScore: number;
}

export interface AnalyticsFilters {
  deliveryType?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Get overview metrics for the analytics dashboard
 */
export const getOverviewMetrics = async (): Promise<AnalyticsOverview> => {
  const response = await client.get<AnalyticsOverview>('/academy/admin/analytics/overview');
  return response.data;
};

/**
 * Get paginated list of rider progress with filters
 */
export const getRiderProgressList = async (
  filters: AnalyticsFilters & { page?: number; pageSize?: number }
): Promise<RiderProgressListResponse> => {
  const params = new URLSearchParams();
  if (filters.deliveryType) params.append('deliveryType', filters.deliveryType);
  if (filters.status) params.append('status', filters.status);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  params.append('page', String(filters.page || 0));
  params.append('pageSize', String(filters.pageSize || 20));

  const response = await client.get<RiderProgressListResponse>(
    `/academy/admin/analytics/riders?${params.toString()}`
  );
  return response.data;
};

/**
 * Get analytics for all videos
 */
export const getVideoAnalytics = async (): Promise<VideoAnalytics[]> => {
  const response = await client.get<VideoAnalytics[]>('/academy/admin/analytics/videos');
  return response.data;
};

/**
 * Export rider progress as CSV
 */
export const exportRiderProgressCsv = async (filters: AnalyticsFilters): Promise<void> => {
  const params = new URLSearchParams();
  if (filters.deliveryType) params.append('deliveryType', filters.deliveryType);
  if (filters.status) params.append('status', filters.status);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);

  const response = await client.get(`/academy/admin/analytics/export/riders?${params.toString()}`, {
    responseType: 'blob',
  });

  // Create download link
  const blob = new Blob([response.data], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `rider_progress_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Format seconds to mm:ss
 */
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format date string to readable format
 */
export const formatDate = (dateString: string | null): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
