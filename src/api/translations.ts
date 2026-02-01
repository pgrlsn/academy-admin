import apiClient from './client';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'te', name: 'Telugu' },
  { code: 'ta', name: 'Tamil' },
  { code: 'kn', name: 'Kannada' },
  { code: 'mr', name: 'Marathi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'gu', name: 'Gujarati' },
];

export interface VideoTranslation {
  id?: number;
  language: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
}

export interface QuizQuestionTranslation {
  id?: number;
  language: string;
  questionText: string;
  options: string[];
}

// Get all translations for a video
export const getVideoTranslations = async (videoId: number): Promise<VideoTranslation[]> => {
  const response = await apiClient.get<VideoTranslation[]>(`/academy/admin/videos/${videoId}/translations`);
  return response.data;
};

// Get a specific translation
export const getVideoTranslation = async (videoId: number, language: string): Promise<VideoTranslation | null> => {
  try {
    const response = await apiClient.get<VideoTranslation>(`/academy/admin/videos/${videoId}/translations/${language}`);
    return response.data;
  } catch (error) {
    return null;
  }
};

// Create a new translation
export const createVideoTranslation = async (videoId: number, translation: VideoTranslation): Promise<VideoTranslation> => {
  const response = await apiClient.post<VideoTranslation>(`/academy/admin/videos/${videoId}/translations`, translation);
  return response.data;
};

// Update an existing translation
export const updateVideoTranslation = async (
  videoId: number,
  translationId: number,
  translation: VideoTranslation
): Promise<VideoTranslation> => {
  const response = await apiClient.put<VideoTranslation>(
    `/academy/admin/videos/${videoId}/translations/${translationId}`,
    translation
  );
  return response.data;
};

// Delete a translation
export const deleteVideoTranslation = async (videoId: number, translationId: number): Promise<void> => {
  await apiClient.delete(`/academy/admin/videos/${videoId}/translations/${translationId}`);
};

// Upload a translated video file
export const uploadTranslationVideo = async (
  videoId: number,
  language: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ videoUrl: string; thumbnailUrl?: string }> => {
  const formData = new FormData();
  formData.append('video', file);
  formData.append('language', language);

  const response = await apiClient.post(
    `/academy/admin/videos/${videoId}/translations/upload`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    }
  );
  return response.data;
};

// Get available languages for a video
export const getAvailableLanguages = async (videoId: number): Promise<string[]> => {
  const response = await apiClient.get<string[]>(`/academy/admin/videos/${videoId}/translations/languages`);
  return response.data;
};

// Helper to get language name from code
export const getLanguageName = (code: string): string => {
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
  return lang?.name || code.toUpperCase();
};
