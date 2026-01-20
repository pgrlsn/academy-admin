import apiClient from './client';

export interface QuizQuestion {
  id?: number;
  videoId: number;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  sequenceOrder: number;
  isActive: boolean;
}

export interface QuizQuestionCreateRequest {
  videoId: number;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  sequenceOrder: number;
}

// Fetch quiz questions for a video
export const getQuizQuestions = async (videoId: number): Promise<QuizQuestion[]> => {
  const response = await apiClient.get(`/academy/admin/videos/${videoId}/quiz`);
  return response.data;
};

// Create a quiz question
export const createQuizQuestion = async (question: QuizQuestionCreateRequest): Promise<QuizQuestion> => {
  const response = await apiClient.post('/academy/admin/quiz', question);
  return response.data;
};

// Update a quiz question
export const updateQuizQuestion = async (id: number, question: Partial<QuizQuestion>): Promise<QuizQuestion> => {
  const response = await apiClient.put(`/academy/admin/quiz/${id}`, question);
  return response.data;
};

// Delete a quiz question
export const deleteQuizQuestion = async (id: number): Promise<void> => {
  await apiClient.delete(`/academy/admin/quiz/${id}`);
};

// Reorder quiz questions
export const reorderQuizQuestions = async (videoId: number, questionIds: number[]): Promise<void> => {
  await apiClient.post(`/academy/admin/videos/${videoId}/quiz/reorder`, { questionIds });
};

// Bulk create/update questions
export const saveQuizQuestions = async (videoId: number, questions: Omit<QuizQuestion, 'id' | 'videoId' | 'isActive'>[]): Promise<QuizQuestion[]> => {
  const response = await apiClient.post(`/academy/admin/videos/${videoId}/quiz/bulk`, { questions });
  return response.data;
};
