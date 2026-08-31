import apiClient from './client';
import { Image, PaginatedResponse, LikeResponse, SaveResponse, CreateImageRequest } from '../types';

export const imagesApi = {
  getImages: async (page: number = 1, search?: string): Promise<PaginatedResponse<Image>> => {
    const params: Record<string, string | number> = { page };
    if (search) {
      params.search = search;
    }
    const response = await apiClient.get<PaginatedResponse<Image>>('/api/images/', { params });
    return response.data;
  },

  getImage: async (imageId: number): Promise<Image> => {
    const response = await apiClient.get<Image>(`/api/images/${imageId}/`);
    return response.data;
  },

  createImage: async (formData: FormData): Promise<Image> => {
    const response = await apiClient.post<Image>('/api/images/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteImage: async (imageId: number): Promise<void> => {
    await apiClient.delete(`/api/images/${imageId}/`);
  },

  likeImage: async (imageId: number): Promise<LikeResponse> => {
    const response = await apiClient.post<LikeResponse>(`/api/images/${imageId}/like/`);
    return response.data;
  },

  saveImage: async (imageId: number): Promise<SaveResponse> => {
    const response = await apiClient.post<SaveResponse>(`/api/images/${imageId}/save/`);
    return response.data;
  },

  getSavedImages: async (page: number = 1): Promise<PaginatedResponse<Image>> => {
    const response = await apiClient.get<PaginatedResponse<Image>>('/api/saved/', {
      params: { page },
    });
    return response.data;
  },
};
