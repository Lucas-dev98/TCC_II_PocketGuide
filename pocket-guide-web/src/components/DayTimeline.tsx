import React from "react";
import { MapPin, Clock, Star, AlertCircle } from "lucide-react";
import { Card, Badge } from "@/components";
import { AttractionDetail } from "@/types";
import useI18n from "../hooks/useI18n";

interface DayTimelineProps {
  attractions: AttractionDetail[];
  onAttractionClick?: (attraction: AttractionDetail) => void;
}

/**
 * Timeline de atrações para um dia
 * Exibe atrações em ordem cronológica com detalhes
 */
export const DayTimeline: React.FC<DayTimelineProps> = ({
  attractions,
  onAttractionClick,
}) => {
  const { t } = useI18n()
  if (!attractions || attractions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg">
        <AlertCircle className="w-12 h-12 text-gray-300 dark:text-slate-600 mb-3" />
        <p className="text-gray-500 dark:text-slate-400 text-center">
          Nenhuma atração programada para este dia
        </p>
      </div>
    );
  }

  // Ordenar atrações por hora
  const sortedAttractions = [...attractions].sort((a, b) => {
    const timeA = a.time || "00:00";
    const timeB = b.time || "00:00";
    return timeA.localeCompare(timeB);
  });

  return (
    <div className="space-y-6" aria-label="Timeline de atrações do dia">
      {sortedAttractions.map((attraction, index) => (
        <div
          key={attraction.id}
          className="flex gap-4"
          role="article"
          aria-label={`Atração ${index + 1}: ${attraction.name}`}
        >
          {/* Timeline linha */}
          <div className="flex flex-col items-center">
            {/* Ponto */}
            <div className="w-4 h-4 rounded-full bg-indigo-500 border-4 border-white dark:border-slate-800 shadow-lg" />
            {/* Linha para próxima atração */}
            {index < sortedAttractions.length - 1 && (
              <div className="w-1 h-24 bg-gradient-to-b from-indigo-500 to-indigo-200 dark:from-indigo-600 dark:to-indigo-800 mt-2" />
            )}
          </div>

          {/* Conteúdo da atração */}
          <div className="flex-1 pt-1">
            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden border-slate-200 dark:border-slate-700"
              onClick={() => onAttractionClick?.(attraction)}
            >
              {/* Foto da atração */}
              {attraction.photos && attraction.photos.length > 0 ? (
                <div className="w-full h-48 bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/30 dark:to-indigo-800/20 overflow-hidden relative group flex items-center justify-center">
                  <img
                    src={attraction.photos[0].url}
                    alt={attraction.photos[0].alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      console.warn(`❌ Erro carregando imagem: ${img.src}`);
                      // Tentar segunda URL se disponível
                      const photos = attraction.photos;
                      if (photos && photos.length > 1) {
                        img.src = photos[1].url;
                      } else {
                        // Se falhar, mostrar apenas fallback
                        img.style.display = 'none';
                      }
                    }}
                    onLoad={() => {
                      console.log(`✅ Imagem carregada: ${attraction.name}`);
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/40 dark:to-indigo-800/30 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-indigo-300 dark:text-indigo-600 mx-auto mb-2" />
                    <p className="text-sm text-indigo-600 dark:text-indigo-400">{attraction.name}</p>
                  </div>
                </div>
              )}

              <div className="space-y-3 p-4">
                {/* Header: Hora e Nome */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                      <span className="font-semibold text-sm text-indigo-600 dark:text-indigo-400">
                        {attraction.time || t('time.notDefined')}
                      </span>
                    </div>
                    {attraction.category && (
                      <Badge variant="secondary" className="text-xs">
                        {attraction.category}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {attraction.name}
                  </h3>
                </div>

                {/* Descrição */}
                {attraction.reason && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {attraction.reason}
                  </p>
                )}

                {/* Localização */}
                {attraction.location && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400 line-clamp-1">
                      {attraction.location.address ||
                        `${attraction.location.lat}, ${attraction.location.lng}`}
                    </span>
                  </div>
                )}

                {/* Info com badges */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {attraction.duration && (
                    <Badge variant="secondary" className="text-xs">
                      ⏱️ {Math.round(attraction.duration / 60)}h
                    </Badge>
                  )}

                  {attraction.averageRating && (
                    <Badge variant="secondary" className="text-xs">
                      <Star className="w-3 h-3 inline mr-1" />
                      {attraction.averageRating.toFixed(1)}
                    </Badge>
                  )}

                  {attraction.reason && (
                    <Badge variant="secondary" className="text-xs truncate">
                      💡 {attraction.reason}
                    </Badge>
                  )}
                </div>

                {/* Tips */}
                {attraction.tip && (
                  <div className="pt-2 border-t border-gray-100 dark:border-slate-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                      💭 {attraction.tip}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DayTimeline;
