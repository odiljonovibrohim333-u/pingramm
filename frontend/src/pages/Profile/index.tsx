import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Settings, Grid, Bookmark } from 'lucide-react';
import { useAuth } from '../../hooks';
import { useInfiniteScroll } from '../../hooks';
import { usersApi } from '../../api/users';
import { imagesApi } from '../../api/images';
import { UserProfile, Image } from '../../types';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import MasonryGrid from '../../components/MasonryGrid';
import ImageCard from '../../components/ImageCard';
import { SkeletonProfile, SkeletonFeed } from '../../components/Loader';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { authApi } from '../../api/auth';

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [savedImages, setSavedImages] = useState<Image[]>([]);
  const [activeTab, setActiveTab] = useState<'images' | 'saved'>('images');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Pagination state for images
  const [imagesPage, setImagesPage] = useState(1);
  const [imagesHasMore, setImagesHasMore] = useState(true);
  const [isLoadingMoreImages, setIsLoadingMoreImages] = useState(false);

  // Pagination state for saved images
  const [savedPage, setSavedPage] = useState(1);
  const [savedHasMore, setSavedHasMore] = useState(true);
  const [isLoadingMoreSaved, setIsLoadingMoreSaved] = useState(false);

  const isOwnProfile = currentUser?.id === Number(id);

  useEffect(() => {
    const loadProfile = async () => {
      if (!id) return;
      setIsLoading(true);
      setImages([]);
      setSavedImages([]);
      setImagesPage(1);
      setSavedPage(1);
      setImagesHasMore(true);
      setSavedHasMore(true);
      try {
        const profileData = await usersApi.getUser(Number(id));
        setProfile(profileData);
        const imagesResponse = await usersApi.getUserImages(Number(id), 1);
        setImages(imagesResponse.results);
        setImagesHasMore(!!imagesResponse.next);
      } catch {
        setError('Bu foydalanuvchi mavjud emas');
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, [id]);

  // Load saved images separately when profile is own and user is loaded
  useEffect(() => {
    if (isOwnProfile && !isLoading && profile) {
      const loadSaved = async () => {
        try {
          const savedResponse = await imagesApi.getSavedImages(1);
          setSavedImages(savedResponse.results);
          setSavedHasMore(!!savedResponse.next);
        } catch {
          // Error handled silently
        }
      };
      loadSaved();
    }
  }, [isOwnProfile, isLoading, profile]);

  const loadMoreImages = useCallback(async () => {
    if (isLoadingMoreImages || !imagesHasMore || !id) return;
    setIsLoadingMoreImages(true);
    try {
      const nextPage = imagesPage + 1;
      const response = await usersApi.getUserImages(Number(id), nextPage);
      setImages(prev => [...prev, ...response.results]);
      setImagesHasMore(!!response.next);
      setImagesPage(nextPage);
    } catch {
      // Error handled silently
    } finally {
      setIsLoadingMoreImages(false);
    }
  }, [id, imagesPage, isLoadingMoreImages, imagesHasMore]);

  const loadMoreSaved = useCallback(async () => {
    if (isLoadingMoreSaved || !savedHasMore) return;
    setIsLoadingMoreSaved(true);
    try {
      const nextPage = savedPage + 1;
      const response = await imagesApi.getSavedImages(nextPage);
      setSavedImages(prev => [...prev, ...response.results]);
      setSavedHasMore(!!response.next);
      setSavedPage(nextPage);
    } catch {
      // Error handled silently
    } finally {
      setIsLoadingMoreSaved(false);
    }
  }, [savedPage, isLoadingMoreSaved, savedHasMore]);

  const { lastElementRef: imagesLastRef } = useInfiniteScroll({
    hasMore: imagesHasMore,
    isLoading: isLoadingMoreImages,
    onLoadMore: loadMoreImages,
  });

  const { lastElementRef: savedLastRef } = useInfiniteScroll({
    hasMore: savedHasMore,
    isLoading: isLoadingMoreSaved,
    onLoadMore: loadMoreSaved,
  });

  const handleFollow = async () => {
    if (!profile) return;
    try {
      const response = await usersApi.followUser(profile.id);
      setProfile(prev => prev ? {
        ...prev,
        is_followed: response.followed,
        followers_count: response.followers_count,
      } : null);
    } catch {
      // Error handled silently
    }
  };

  const handleAvatarUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', selectedFile);
      const updatedProfile = await authApi.updateProfile(formData);
      setProfile(prev => prev ? { ...prev, avatar: updatedProfile.avatar } : null);
      if (currentUser) {
        updateUser({ ...currentUser, avatar: updatedProfile.avatar });
      }
      if (updatedProfile.avatar) {
        localStorage.setItem('avatar', updatedProfile.avatar);
      }
      setIsAvatarModalOpen(false);
      setSelectedFile(null);
    } catch {
      // Error handled silently
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = (imageId: number) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  if (isLoading) {
    return (
      <div className="pt-20 pb-8 px-4 max-w-6xl mx-auto">
        <SkeletonProfile />
        <div className="mt-8">
          <SkeletonFeed />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="pt-20 pb-8 px-4 max-w-6xl mx-auto">
        <ErrorState message={error || 'Profil topilmadi'} onRetry={() => navigate('/')} />
      </div>
    );
  }

  const displayImages = activeTab === 'images' ? images : savedImages;
  const isLoadingMore = activeTab === 'images' ? isLoadingMoreImages : isLoadingMoreSaved;
  const hasMore = activeTab === 'images' ? imagesHasMore : savedHasMore;
  const lastRef = activeTab === 'images' ? imagesLastRef : savedLastRef;

  return (
    <div className="pt-20 pb-8 px-4 max-w-6xl mx-auto">
      {/* Profile Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative group">
          <Avatar src={profile.avatar} size="xl" />
          {isOwnProfile && (
            <button
              onClick={() => setIsAvatarModalOpen(true)}
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Settings className="w-6 h-6 text-white" />
            </button>
          )}
        </div>

        <h1 className="mt-4 text-2xl font-semibold text-gray-900">{profile.username}</h1>

        <div className="flex items-center gap-8 mt-4">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">{profile.images_count}</p>
            <p className="text-sm text-gray-500">rasm</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">{profile.followers_count}</p>
            <p className="text-sm text-gray-500">kuzatuvchi</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">{profile.following_count}</p>
            <p className="text-sm text-gray-500">kuzatilmoqda</p>
          </div>
        </div>

        {!isOwnProfile && currentUser && (
          <Button
            onClick={handleFollow}
            variant={profile.is_followed ? 'secondary' : 'primary'}
            className="mt-4"
          >
            {profile.is_followed ? 'Kuzatilmoqda' : 'Kuzatish'}
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-1 border-b border-gray-100 mb-6">
        <button
          onClick={() => setActiveTab('images')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'images'
              ? 'border-black text-black'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Grid className="w-4 h-4" />
          Rasmlar
        </button>
        {isOwnProfile && (
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'saved'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            Saqlanganlar
          </button>
        )}
      </div>

      {/* Images Grid */}
      {displayImages.length === 0 ? (
        <EmptyState
          icon={Grid}
          title={activeTab === 'images' ? "Hali rasmlar yo'q" : "Saqlangan rasmlar yo'q"}
          description={
            activeTab === 'images'
              ? "Birinchi rasmni yuklang"
              : "Saqlangan rasmlar bu yerda ko'rinadi"
          }
          action={
            activeTab === 'images' && isOwnProfile
              ? { label: 'Yuklash', onClick: () => navigate('/upload') }
              : undefined
          }
        />
      ) : (
        <>
          <MasonryGrid>
            {displayImages.map((image, index) => (
              <div
                key={image.id}
                ref={index === displayImages.length - 1 ? lastRef : undefined}
              >
                <ImageCard
                  image={image}
                  currentUserId={currentUser?.id}
                  onDelete={handleDeleteImage}
                />
              </div>
            ))}
          </MasonryGrid>

          {isLoadingMore && (
            <div className="mt-8">
              <SkeletonFeed count={8} />
            </div>
          )}
        </>
      )}

      {/* Avatar Modal */}
      <Modal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        title="Avatarni yangilash"
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <Avatar src={selectedFile ? URL.createObjectURL(selectedFile) : profile.avatar} size="xl" />
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleAvatarUpload}
              isLoading={isUploading}
              disabled={!selectedFile}
              className="flex-1"
            >
              Saqlash
            </Button>
            <Button
              onClick={() => setIsAvatarModalOpen(false)}
              variant="secondary"
              className="flex-1"
            >
              Bekor qilish
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
