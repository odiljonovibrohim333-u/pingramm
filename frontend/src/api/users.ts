import apiClient from './client';
import { UserProfile, FollowResponse, Image, PaginatedResponse } from '../types';

export const usersApi = {
  getUser: async (userId: number): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>(`/api/users/${userId}/`);
    return response.data;
  },

  getUserImages: async (userId: number, page: number = 1): Promise<PaginatedResponse<Image>> => {
    const response = await apiClient.get<PaginatedResponse<Image>>(`/api/users/${userId}/images/`, {
      params: { page },
    });
    return response.data;
  },

  followUser: async (userId: number): Promise<FollowResponse> => {
    const response = await apiClient.post<FollowResponse>(`/api/users/${userId}/follow/`);
    return response.data;
  },
};
