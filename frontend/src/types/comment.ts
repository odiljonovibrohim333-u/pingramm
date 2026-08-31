export interface Comment {
  id: number;
  author: string;
  text: string;
  created_at: string;
}

export interface CreateCommentRequest {
  text: string;
}
