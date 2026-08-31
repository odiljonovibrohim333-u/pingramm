import { Trash2, Loader2 } from 'lucide-react';
import { Comment as CommentType } from '../../types';
import Avatar from '../Avatar';

interface CommentProps {
  comment: CommentType;
  currentUserId?: number;
  currentUsername?: string;
  onDelete?: (commentId: number) => void;
  isDeleting?: boolean;
}

const Comment = ({ comment, currentUsername, onDelete, isDeleting = false }: CommentProps) => {
  const isOwner = currentUsername === comment.author;

  return (
    <div className="flex gap-3 py-3">
      <Avatar src={null} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">@{comment.author}</span>
          <span className="text-xs text-gray-400">
            {new Date(comment.created_at).toLocaleDateString('uz-UZ')}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">{comment.text}</p>
      </div>
      {isOwner && onDelete && (
        <button
          onClick={() => onDelete(comment.id)}
          disabled={isDeleting}
          className="p-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-50"
          aria-label="Kommentni o'chirish"
        >
          {isDeleting ? (
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4 text-gray-400" />
          )}
        </button>
      )}
    </div>
  );
};

export default Comment;
