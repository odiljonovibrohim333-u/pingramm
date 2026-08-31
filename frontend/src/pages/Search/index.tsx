import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { imagesApi } from '../../api/images';
import { Image } from '../../types';
import MasonryGrid from '../../components/MasonryGrid';
import ImageCard from '../../components/ImageCard';
import { SkeletonFeed } from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { Search as SearchIcon } from 'lucide-react';
import { useAuth } from '../../hooks';
import { useInfiniteScroll } from '../../hooks';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { user } = useAuth();
  const [images, setImages] = useState<Image[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const searchImages = async () => {
      if (!query) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const response = await imagesApi.getImages(1, query);
        setImages(response.results);
        setHasMore(!!response.next);
      } catch {
        setError('Qidiruv xatosi');
      } finally {
        setIsLoading(false);
      }
    };
    searchImages();
  }, [query]);

  const loadMore = async () => {
    if (isLoadingMore || !hasMore || !query) return;
    setIsLoadingMore(true);
    try {
      const response = await imagesApi.getImages(page + 1, query);
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

  if (!query) {
    return (
      <div className="pt-20 pb-8 px-4 max-w-6xl mx-auto">
        <EmptyState
          icon={SearchIcon}
          title="Qidirish"
          description="Qidirish maydoniga so'roz kiriting"
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="pt-20 pb-8 px-4 max-w-6xl mx-auto">
        <h1 className="text-xl font-medium text-gray-900 mb-6">
          "{query}" bo'yicha qidiruv
        </h1>
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
      <h1 className="text-xl font-medium text-gray-900 mb-6">
        "{query}" bo'yicha qidiruv
      </h1>

      {images.length === 0 ? (
        <EmptyState
          icon={SearchIcon}
          title="Hech narsa topilmadi"
          description="Boshqa so'roz bilan qidirib ko'ring"
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

export default Search;
