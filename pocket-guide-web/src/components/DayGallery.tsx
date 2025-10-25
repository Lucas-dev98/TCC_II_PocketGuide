import React, { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components";
import { PhotoData } from "@/types";

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

  if (!photos || photos.length === 0) {
    return (
      <div
        className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center"
        aria-label={`Sem fotos disponíveis para ${attractionName}`}
      >
        <div className="text-center">
          <p className="text-gray-500 text-sm">Nenhuma foto disponível</p>
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
          onClick={() => setIsExpanded(true)}
          loading="lazy"
        />

        {/* Overlay com informações */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <p className="text-white text-sm font-medium">{currentPhoto.attractionName}</p>
          <p className="text-gray-300 text-xs mt-1">{currentPhoto.alt}</p>
        </div>

        {/* Contador de fotos */}
        {photos.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/60 text-white text-xs font-medium px-3 py-1 rounded-full">
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
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? "border-indigo-500 ring-2 ring-indigo-300"
                  : "border-gray-200 hover:border-gray-300"
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
