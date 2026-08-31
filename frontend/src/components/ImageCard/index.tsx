import { useState } from 'react';
import { Link } from 'react-router';
import { Heart, Bookmark, Trash2 } from 'lucide-react';
import { Image } from '../../types';
import Avatar from '../Avatar';
import { imagesApi } from '../../api/images';
import ConfirmModal from '../ConfirmModal';

interface ImageCardProps {
  image: Image;
  currentUserId?: number;
  onDelete?: (imageId: number) => void;
}

const ImageCard = ({ image, currentUserId, onDelete }: ImageCardProps) => {
  const [isLiked, setIsLiked] = useState(image.is_liked);
  const [likesCount, setLikesCount] = useState(image.likes_count);
  const [isSaved, setIsSaved] = useState(image.is_saved);
  const [savesCount, setSavesCount] = useState(image.saves_count);
  const [isHovered, setIsHovered] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLiking) return;
    setIsLiking(true);
    try {
      const response = await imagesApi.likeImage(image.id);
      setIsLiked(response.liked);
      setLikesCount(response.likes_count);
    } catch {
      // Error handled silently
    } finally {
      setIsLiking(false);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSaving) return;
    setIsSaving(true);
    try {
      const response = await imagesApi.saveImage(image.id);
      setIsSaved(response.saved);
      setSavesCount(response.saves_count);
    } catch {
      // Error handled silently
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await imagesApi.deleteImage(image.id);
      onDelete?.(image.id);
      setShowDeleteConfirm(false);
    } catch {
      // Error handled silently
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const isOwner = currentUserId === image.author_id;

  return (
    <>
      <Link
        to={`/pin/${image.id}`}
        className="group block break-inside-avoid mb-4"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative bg-white rounded-lg overflow-hidden border border-gray-100 hover:border-gray-200 transition-all duration-200">
          {/* Image */}
          <img
            src={image.image}
            alt={image.title || 'Image'}
            className="w-full h-auto"
            loading="lazy"
          />

          {/* Hover overlay */}
          <div
            className={`absolute inset-0 bg-black/0 transition-all duration-200 ${
              isHovered ? 'bg-black/10' : ''
            }`}
          />

          {/* Actions */}
          <div
            className={`absolute top-2 right-2 flex flex-col gap-2 transition-opacity duration-200 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                isSaved
                  ? 'bg-black text-white'
                  : 'bg-white/90 text-gray-700 hover:bg-white'
              } ${isSaving ? 'opacity-50' : ''}`}
              aria-label={isSaved ? "Saqlanganlardan o'chirish" : 'Saqlash'}
            >
              <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Bottom actions */}
          <div
            className={`absolute bottom-2 left-2 right-2 flex items-center justify-between transition-opacity duration-200 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-sm text-xs font-medium transition-colors ${
                isLiked
                  ? 'bg-red-500 text-white'
                  : 'bg-white/90 text-gray-700 hover:bg-white'
              } ${isLiking ? 'opacity-50' : ''}`}
              aria-label={isLiked ? 'Like dan o\'chirish' : 'Like'}
            >
              <Heart className="w-3.5 h-3.5" fill={isLiked ? 'currentColor' : 'none'} />
              {likesCount}
            </button>

            {isOwner && (
              <button
                onClick={handleDeleteClick}
                className="p-2 rounded-full bg-white/90 text-gray-700 hover:bg-white backdrop-blur-sm transition-colors"
                aria-label="O'chirish"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-2 px-1">
          {image.title && (
            <h3 className="text-sm font-medium text-gray-900 truncate">{image.title}</h3>
          )}
          <div className="flex items-center gap-2 mt-1">
            <Avatar src={null} size="sm" />
            <span className="text-xs text-gray-500">@{image.author}</span>
          </div>
        </div>
      </Link>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Rasmni o'chirish"
        message="Bu rasmini o'chirmoqchimisiz? Bu amalni bekor qilib bo'lmaydi."
        confirmLabel="O'chirish"
        isLoading={isDeleting}
        danger
      />
    </>
  );
};

export default ImageCard;
