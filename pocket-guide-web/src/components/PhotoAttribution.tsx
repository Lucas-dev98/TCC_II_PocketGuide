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
      <div className="text-xs text-gray-600 dark:text-gray-300 mt-2 px-2 py-1.5 bg-gray-50 dark:bg-slate-800/50 rounded border border-gray-200 dark:border-slate-700">
        <span className="inline-block mr-1">📷</span>
        Photo by{' '}
        <a 
          href={photo.photographerUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 hover:underline font-semibold transition-colors"
        >
          {photo.photographer}
        </a>
        {' '}on{' '}
        <a 
          href="https://unsplash.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 hover:underline font-semibold transition-colors"
        >
          Unsplash
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-200 mt-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700/80 border border-gray-200 dark:border-slate-600 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <span className="text-lg flex-shrink-0 mt-0.5">📷</span>
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <p className="text-sm leading-snug">
          Photo by{' '}
          <a 
            href={photo.photographerUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 hover:underline font-semibold transition-colors"
          >
            {photo.photographer}
          </a>
          {' '}on{' '}
          <a 
            href={photo.unsplashLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 hover:underline font-semibold transition-colors"
          >
            Unsplash
          </a>
        </p>
      </div>
    </div>
  );
};

export default PhotoAttribution;
