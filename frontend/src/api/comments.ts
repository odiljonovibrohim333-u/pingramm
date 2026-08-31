import apiClient from './client';
import { Comment, CreateCommentRequest } from '../types';

export const commentsApi = {
  getComments: async (imageId: number): Promise<Comment[]> => {
    const response = await apiClient.get<Comment[]>(`/api/images/${imageId}/comments/`);
    return response.data;
  },

  createComment: async (imageId: number, data: CreateCommentRequest): Promise<Comment> => {
    const response = await apiClient.post<Comment>(`/api/images/${imageId}/comments/`, data);
    return response.data;
  },

  deleteComment: async (commentId: number): Promise<void> => {
    await apiClient.delete(`/api/comments/${commentId}/`);
  },
};
