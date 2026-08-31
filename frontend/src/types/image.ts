export interface Image {
  id: number;
  title: string;
  description: string;
  image: string;
  comments_enabled: boolean;
  created_at: string;
  author: string;
  author_id: number;
  likes_count: number;
  is_liked: boolean;
  saves_count: number;
  is_saved: boolean;
  comments_count: number;
}

export interface PaginatedResponse<T> {
  results: T[];
  next: string | null;
  previous: string | null;
}

export interface LikeResponse {
  liked: boolean;
  likes_count: number;
}

export interface SaveResponse {
  saved: boolean;
  saves_count: number;
}

export interface FollowResponse {
  followed: boolean;
  followers_count: number;
}

export interface CreateImageRequest {
  image: File;
  title: string;
  description: string;
  comments_enabled: boolean;
}
