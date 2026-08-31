import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { Heart, Bookmark, Download, Trash2, MessageCircle, ArrowLeft, Maximize2 } from 'lucide-react';
import { useAuth } from '../../hooks';
import { imagesApi } from '../../api/images';
import { commentsApi } from '../../api/comments';
import { Image, Comment as CommentType } from '../../types';
import Avatar from '../../components/Avatar';
import Comment from '../../components/Comment';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import { SkeletonDetail } from '../../components/Loader';
import ErrorState from '../../components/ErrorState';

const PinDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [image, setImage] = useState<Image | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteImageConfirm, setShowDeleteImageConfirm] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const imageData = await imagesApi.getImage(Number(id));
        setImage(imageData);
        if (imageData.comments_enabled) {
          const commentsData = await commentsApi.getComments(Number(id));
          setComments(commentsData);
        }
      } catch {
        setError('Bu rasm topilmadi');
      } finally {
        setIsLoading(false);
      }
    };
    loadImage();
  }, [id]);

  const handleLike = async () => {
    if (!image || isLiking) return;
    setIsLiking(true);
    try {
      const response = await imagesApi.likeImage(image.id);
      setImage(prev => prev ? {
        ...prev,
        is_liked: response.liked,
        likes_count: response.likes_count,
      } : null);
    } catch {
      // Error handled silently
    } finally {
      setIsLiking(false);
    }
  };

  const handleSave = async () => {
    if (!image || isSaving) return;
    setIsSaving(true);
    try {
      const response = await imagesApi.saveImage(image.id);
      setImage(prev => prev ? {
        ...prev,
        is_saved: response.saved,
        saves_count: response.saves_count,
      } : null);
    } catch {
      // Error handled silently
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!image || isDeletingImage) return;
    setIsDeletingImage(true);
    try {
      await imagesApi.deleteImage(image.id);
      navigate('/');
    } catch {
      // Error handled silently
    } finally {
      setIsDeletingImage(false);
      setShowDeleteImageConfirm(false);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !image) return;

    setIsSubmittingComment(true);
    try {
      const newComment = await commentsApi.createComment(image.id, { text: commentText });
      setComments(prev => [...prev, newComment]);
      setCommentText('');
      setImage(prev => prev ? {
        ...prev,
        comments_count: prev.comments_count + 1,
      } : null);
    } catch {
      // Error handled silently
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (deletingCommentId !== null) return;
    setDeletingCommentId(commentId);
    try {
      await commentsApi.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      setImage(prev => prev ? {
        ...prev,
        comments_count: prev.comments_count - 1,
      } : null);
    } catch {
      // Error handled silently
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleDownload = async () => {
    if (!image) return;
    try {
      const response = await fetch(image.image);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${image.title || 'image'}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      // Error handled silently
    }
  };

  if (isLoading) {
    return (
      <div className="pt-20 pb-8 px-4 max-w-6xl mx-auto">
        <SkeletonDetail />
      </div>
    );
  }

  if (error || !image) {
    return (
      <div className="pt-20 pb-8 px-4 max-w-6xl mx-auto">
        <ErrorState message={error || 'Rasm topilmadi'} onRetry={() => navigate('/')} />
      </div>
    );
  }

  const isOwner = user?.id === image.author_id;

  return (
    <>
      <div className="pt-20 pb-8 px-4 max-w-6xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Orqaga
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="relative">
            <img
              src={image.image}
              alt={image.title || 'Image'}
              className="w-full h-auto rounded-xl"
            />
            <button
              onClick={() => setIsZoomOpen(true)}
              className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
              aria-label="Kattalashtirish"
            >
              <Maximize2 className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {/* Actions */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLike}
                  disabled={isLiking}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                    image.is_liked
                      ? 'bg-red-50 text-red-500'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${isLiking ? 'opacity-50' : ''}`}
                >
                  <Heart className="w-5 h-5" fill={image.is_liked ? 'currentColor' : 'none'} />
                  <span className="text-sm font-medium">{image.likes_count}</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                    image.is_saved
                      ? 'bg-blue-50 text-blue-500'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${isSaving ? 'opacity-50' : ''}`}
                >
                  <Bookmark className="w-5 h-5" fill={image.is_saved ? 'currentColor' : 'none'} />
                  <span className="text-sm font-medium">{image.saves_count}</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  aria-label="Yuklab olish"
                >
                  <Download className="w-5 h-5 text-gray-700" />
                </button>
                {isOwner && (
                  <button
                    onClick={() => setShowDeleteImageConfirm(true)}
                    className="p-2 bg-gray-100 rounded-full hover:bg-red-50 transition-colors"
                    aria-label="O'chirish"
                  >
                    <Trash2 className="w-5 h-5 text-gray-700 hover:text-red-500" />
                  </button>
                )}
              </div>
            </div>

            {/* Title & Description */}
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">{image.title}</h1>
            {image.description && (
              <p className="text-gray-600 mb-4">{image.description}</p>
            )}

            {/* Author */}
            <Link
              to={`/profile/${image.author_id}`}
              className="flex items-center gap-3 py-4 border-t border-gray-100"
            >
              <Avatar src={null} size="md" />
              <div>
                <p className="font-medium text-gray-900">@{image.author}</p>
                <p className="text-sm text-gray-500">
                  {new Date(image.created_at).toLocaleDateString('uz-UZ')}
                </p>
              </div>
            </Link>

            {/* Comments */}
            {image.comments_enabled && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <h3 className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-4">
                  <MessageCircle className="w-4 h-4" />
                  Kommentlar ({image.comments_count})
                </h3>

                {/* Comment form */}
                {user && (
                  <form onSubmit={handleComment} className="mb-4">
                    <div className="flex gap-3">
                      <Avatar src={user.avatar} size="sm" />
                      <div className="flex-1">
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Komment yozing..."
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                        />
                        {commentText.trim() && (
                          <Button
                            type="submit"
                            size="sm"
                            isLoading={isSubmittingComment}
                            className="mt-2"
                          >
                            Yuborish
                          </Button>
                        )}
                      </div>
                    </div>
                  </form>
                )}

                {/* Comments list */}
                <div className="space-y-1 divide-y divide-gray-100">
                  {comments.length === 0 ? (
                    <p className="text-sm text-gray-500 py-4">
                      Bu yerda hali komment yo'q
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <Comment
                        key={comment.id}
                        comment={comment}
                        currentUsername={user?.username}
                        onDelete={handleDeleteComment}
                        isDeleting={deletingCommentId === comment.id}
                      />
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
      <Modal isOpen={isZoomOpen} onClose={() => setIsZoomOpen(false)} size="lg">
        <img
          src={image.image}
          alt={image.title || 'Image'}
          className="w-full h-auto max-h-[80vh] object-contain"
        />
      </Modal>

      {/* Delete Image Confirm */}
      <ConfirmModal
        isOpen={showDeleteImageConfirm}
        onClose={() => setShowDeleteImageConfirm(false)}
        onConfirm={handleDeleteImage}
        title="Rasmni o'chirish"
        message="Bu rasmini o'chirmoqchimisiz? Bu amalni bekor qilib bo'lmaydi."
        confirmLabel="O'chirish"
        isLoading={isDeletingImage}
        danger
      />
    </>
  );
};

export default PinDetail;
