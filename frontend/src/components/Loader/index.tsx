import { Loader2 } from 'lucide-react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Loader = ({ size = 'md', className = '' }: LoaderProps) => {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <Loader2 className={`${sizeStyles[size]} animate-spin text-gray-400 ${className}`} />
  );
};

// Skeleton components
export const SkeletonCard = () => {
  const heights = ['h-48', 'h-64', 'h-56', 'h-72', 'h-52'];
  const randomHeight = heights[Math.floor(Math.random() * heights.length)];

  return (
    <div className="animate-pulse">
      <div className={`${randomHeight} bg-gray-100 rounded-lg`} />
      <div className="mt-2 space-y-2">
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
  );
};

export const SkeletonFeed = ({ count = 12 }: { count?: number }) => {
  return (
    <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

export const SkeletonProfile = () => {
  return (
    <div className="animate-pulse">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full" />
        <div className="h-6 bg-gray-100 rounded w-32" />
        <div className="flex space-x-8">
          <div className="h-4 bg-gray-100 rounded w-16" />
          <div className="h-4 bg-gray-100 rounded w-16" />
          <div className="h-4 bg-gray-100 rounded w-16" />
        </div>
      </div>
    </div>
  );
};

export const SkeletonDetail = () => {
  return (
    <div className="animate-pulse">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square bg-gray-100 rounded-lg" />
        <div className="space-y-4">
          <div className="h-6 bg-gray-100 rounded w-1/2" />
          <div className="h-4 bg-gray-100 rounded w-3/4" />
          <div className="h-4 bg-gray-100 rounded w-1/3" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 rounded" />
            <div className="h-4 bg-gray-100 rounded w-5/6" />
          </div>
        </div>
      </div>
    </div>
  );
};
