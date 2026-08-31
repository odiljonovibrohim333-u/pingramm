import apiClient from './client';
import { LoginRequest, SignupRequest, LoginResponse, UserProfile } from '../types';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/api/login/', data);
    return response.data;
  },

  signup: async (data: SignupRequest): Promise<void> => {
    await apiClient.post('/api/signup/', data);
  },

  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>('/api/profile/');
    return response.data;
  },

  updateProfile: async (formData: FormData): Promise<UserProfile> => {
    const response = await apiClient.patch<UserProfile>('/api/profile/update/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
