import apiClient from './client';
import type { LoginRequest, LoginResponse, OtpResponse } from '../types/auth';

export const authApi = {
  sendOtp: async (phoneNumber: string): Promise<OtpResponse> => {
    const response = await apiClient.post('/auth/otp/generate', {
      number: phoneNumber,
    });
    return response.data;
  },

  login: async (loginRequest: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', {
      ...loginRequest,
      loginFrom: 'ACADEMY_ADMIN',
    });
    return response.data;
  },

  validateToken: async (): Promise<boolean> => {
    try {
      const response = await apiClient.get('/auth/validate');
      return response.data?.status?.code === 200;
    } catch {
      return false;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore logout errors
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
