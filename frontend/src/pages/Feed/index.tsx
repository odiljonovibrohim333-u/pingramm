import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks';
import { imagesApi } from '../../api/images';
import { Image } from '../../types';
import MasonryGrid from '../../components/MasonryGrid';
import ImageCard from '../../components/ImageCard';
import { SkeletonFeed } from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { ImageOff } from 'lucide-react';
import { useInfiniteScroll } from '../../hooks';

const Feed = () => {
  const { user } = useAuth();
  const [images, setImages] = useState<Image[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchImages = useCallback(async (pageNum: number, append = false) => {
    try {
      const response = await imagesApi.getImages(pageNum);
      if (append) {
        setImages(prev => [...prev, ...response.results]);
      } else {
        setImages(response.results);
      }
      setHasMore(!!response.next);
    } catch (err) {
      setError('Server bilan aloqa o\'rnatilmadi');
    }
  }, []);

  useEffect(() => {
    const loadInitial = async () => {
      setIsLoading(true);
      await fetchImages(1);
      setIsLoading(false);
    };
    loadInitial();
  }, [fetchImages]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    await fetchImages(nextPage, true);
    setPage(nextPage);
    setIsLoadingMore(false);
  }, [page, isLoadingMore, hasMore, fetchImages]);

  const { lastElementRef } = useInfiniteScroll({
    hasMore,
    isLoading: isLoadingMore,
    onLoadMore: loadMore,
  });

  const handleDelete = (imageId: number) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleRetry = () => {
    setError(null);
    setPage(1);
    setHasMore(true);
    fetchImages(1);
  };

  if (isLoading) {
    return (
      <div className="pt-20 pb-8 px-4 max-w-7xl mx-auto">
        <SkeletonFeed />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-20 pb-8 px-4 max-w-7xl mx-auto">
        <ErrorState message={error} onRetry={handleRetry} />
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="pt-20 pb-8 px-4 max-w-7xl mx-auto">
        <EmptyState
          icon={ImageOff}
          title="Hali rasmlar yo'q"
          description="Birinchi rasmni yuklang yoki boshqa foydalanuvchilarni kuzating"
        />
      </div>
    );
  }

  return (
    <div className="pt-20 pb-8 px-4 max-w-7xl mx-auto">
      <MasonryGrid>
        {images.map((image, index) => (
          <div
            key={image.id}
            ref={index === images.length - 1 ? lastElementRef : undefined}
          >
            <ImageCard
              image={image}
              currentUserId={user?.id}
              onDelete={handleDelete}
            />
          </div>
        ))}
      </MasonryGrid>

      {isLoadingMore && (
        <div className="mt-8">
          <SkeletonFeed count={8} />
        </div>
      )}
    </div>
  );
};

export default Feed;
