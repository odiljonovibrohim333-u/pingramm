import { ReactNode } from 'react';

interface MasonryGridProps {
  children: ReactNode;
  className?: string;
}

const MasonryGrid = ({ children, className = '' }: MasonryGridProps) => {
  return (
    <div
      className={`columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4 ${className}`}
    >
      {children}
    </div>
  );
};

export default MasonryGrid;
