import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks';
import { imagesApi } from '../../api/images';
import { Image } from '../../types';
import MasonryGrid from '../../components/MasonryGrid';
import ImageCard from '../../components/ImageCard';
import { SkeletonFeed } from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { Bookmark } from 'lucide-react';
import { useInfiniteScroll } from '../../hooks';

const Saved = () => {
  const { user } = useAuth();
  const [images, setImages] = useState<Image[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const loadSaved = async () => {
      setIsLoading(true);
      try {
        const response = await imagesApi.getSavedImages(1);
        setImages(response.results);
        setHasMore(!!response.next);
      } catch {
        setError('Saqlanganlarni yuklash xatosi');
      } finally {
        setIsLoading(false);
      }
    };
    loadSaved();
  }, []);

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const response = await imagesApi.getSavedImages(page + 1);
      setImages(prev => [...prev, ...response.results]);
      setHasMore(!!response.next);
      setPage(prev => prev + 1);
    } catch {
      // Error handled silently
    } finally {
      setIsLoadingMore(false);
    }
  };

  const { lastElementRef } = useInfiniteScroll({
    hasMore,
    isLoading: isLoadingMore,
    onLoadMore: loadMore,
  });

  if (isLoading) {
    return (
      <div className="pt-20 pb-8 px-4 max-w-6xl mx-auto">
        <h1 className="text-xl font-medium text-gray-900 mb-6">Saqlanganlar</h1>
        <SkeletonFeed />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-20 pb-8 px-4 max-w-6xl mx-auto">
        <ErrorState message={error} />
      </div>
    );
  }

  return (
    <div className="pt-20 pb-8 px-4 max-w-6xl mx-auto">
      <h1 className="text-xl font-medium text-gray-900 mb-6">Saqlanganlar</h1>

      {images.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Saqlangan rasmlar yo'q"
          description="Rasmlarni saqlash uchun bookmark belgisini bosing"
        />
      ) : (
        <>
          <MasonryGrid>
            {images.map((image, index) => (
              <div
                key={image.id}
                ref={index === images.length - 1 ? lastElementRef : undefined}
              >
                <ImageCard
                  image={image}
                  currentUserId={user?.id}
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
    </div>
  );
};

export default Saved;
