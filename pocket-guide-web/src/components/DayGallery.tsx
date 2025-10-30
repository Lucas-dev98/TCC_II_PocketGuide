import React, { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components";
import { PhotoData } from "@/types";
import PhotoAttribution from "@/components/PhotoAttribution";
import PhotoService from "@/services/photoService";

interface DayGalleryProps {
  photos: PhotoData[];
  attractionName?: string;
}

/**
 * Galeria de fotos com navegação
 * Exibe fotos em carrossel com setas de navegação
 */
export const DayGallery: React.FC<DayGalleryProps> = ({
  photos,
  attractionName = "Atração",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const currentPhoto = photos[currentIndex];

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  }, [photos.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  }, [photos.length]);

  // Track photo download when expanded (Unsplash compliance)
  const handlePhotoExpanded = useCallback(() => {
    const photo = photos[currentIndex];
    if (photo?.photoId && photo?.downloadLocation) {
      PhotoService.trackPhotoDownload(photo.photoId, photo.downloadLocation).catch((error) => {
        console.warn('Failed to track photo download:', error);
      });
    }
    setIsExpanded(true);
  }, [currentIndex, photos]);

  if (!photos || photos.length === 0) {
    return (
      <div
        className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-800 rounded-lg flex items-center justify-center"
        aria-label={`Sem fotos disponíveis para ${attractionName}`}
      >
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhuma foto disponível</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Galeria principal */}
      <div
        className="relative w-full bg-black rounded-lg overflow-hidden group"
        aria-label={`Galeria de fotos para ${attractionName}`}
      >
        {/* Imagem */}
        <img
          src={currentPhoto.url}
          alt={currentPhoto.alt}
          className="w-full h-96 object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
          onClick={handlePhotoExpanded}
          loading="lazy"
        />

        {/* Overlay com informações */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 dark:from-black/90 dark:via-black/60">
          <p className="text-white text-sm font-medium">{currentPhoto.attractionName}</p>
          <p className="text-gray-200 dark:text-gray-300 text-xs mt-1">{currentPhoto.alt}</p>
        </div>

        {/* Contador de fotos */}
        {photos.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/60 dark:bg-black/80 text-white text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm">
            {currentIndex + 1} / {photos.length}
          </div>
        )}

        {/* Botões de navegação */}
        {photos.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 hover:bg-white/40 rounded-full"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 hover:bg-white/40 rounded-full"
              aria-label="Próxima foto"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </Button>
          </>
        )}
      </div>

      {/* Miniaturas (se houver mais de 1 foto) */}
      {photos.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? "border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-300 dark:ring-indigo-500/50"
                  : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500"
              }`}
              aria-label={`Ir para foto ${index + 1}`}
              aria-current={index === currentIndex}
            >
              <img
                src={photo.url}
                alt={photo.alt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Photographer Attribution - Unsplash Compliance */}
      {currentPhoto && (
        <PhotoAttribution 
          photo={{
            url: currentPhoto.url,
            source: (currentPhoto.source as 'unsplash' | 'pexels' | 'fallback') || 'fallback',
            width: currentPhoto.width || 1200,
            height: currentPhoto.height || 600,
            photographer: currentPhoto.photographer,
            photographerUrl: currentPhoto.photographerUrl,
            unsplashLink: currentPhoto.unsplashLink,
            photoId: currentPhoto.photoId,
            downloadLocation: currentPhoto.downloadLocation,
          }}
          compact={true}
        />
      )}

      {/* Modal expandido */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={() => setIsExpanded(false)}
          aria-modal="true"
          aria-label="Visualização expandida da foto"
        >
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Imagem expandida */}
            <img
              src={currentPhoto.url}
              alt={currentPhoto.alt}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Botão de fechar */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full"
              aria-label="Fechar visualização expandida"
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Navegação */}
            {photos.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevious();
                  }}
                  className="absolute left-4 text-white hover:bg-white/20 rounded-full"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-4 text-white hover:bg-white/20 rounded-full"
                  aria-label="Próxima foto"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DayGallery;
