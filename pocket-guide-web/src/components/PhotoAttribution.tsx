import React from 'react';
import type { PhotoSource } from '@/services/photoService';

interface PhotoAttributionProps {
  photo: PhotoSource;
  compact?: boolean;
}

/**
 * PhotoAttribution Component
 * Displays proper attribution for Unsplash photos
 * Required for Unsplash production-level access
 * 
 * @component
 * @example
 * ```tsx
 * <PhotoAttribution photo={photoData} />
 * ```
 */
export const PhotoAttribution: React.FC<PhotoAttributionProps> = ({ 
  photo, 
  compact = false 
}) => {
  // Skip attribution for fallback photos
  if (photo.source !== 'unsplash' || !photo.photographer) {
    return null;
  }

  if (compact) {
    return (
      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
        Photo by{' '}
        <a 
          href={photo.photographerUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          {photo.photographer}
        </a>
        {' '}on{' '}
        <a 
          href="https://unsplash.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          Unsplash
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mt-3 p-2 bg-gray-50 dark:bg-gray-900 rounded">
      <span className="text-xs">📷</span>
      <div className="flex flex-col gap-1">
        <p>
          Photo by{' '}
          <a 
            href={photo.photographerUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
          >
            {photo.photographer}
          </a>
          {' '}on{' '}
          <a 
            href={photo.unsplashLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
          >
            Unsplash
          </a>
        </p>
      </div>
    </div>
  );
};

export default PhotoAttribution;
