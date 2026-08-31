export interface User {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
}

export interface UserProfile extends User {
  images_count: number;
  followers_count: number;
  following_count: number;
  is_followed: boolean;
}

export interface LoginResponse {
  user: {
    user: number;
    username: string;
    email: string;
  };
  refresh: string;
  access: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}
