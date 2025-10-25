import React from "react";
import { MapPin, Clock, Star, AlertCircle } from "lucide-react";
import { Card, Badge } from "@/components";
import { AttractionDetail } from "@/types";

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
  if (!attractions || attractions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-300 mb-3" />
        <p className="text-gray-500 text-center">
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
            <div className="w-4 h-4 rounded-full bg-indigo-500 border-4 border-white shadow-lg" />
            {/* Linha para próxima atração */}
            {index < sortedAttractions.length - 1 && (
              <div className="w-1 h-24 bg-gradient-to-b from-indigo-500 to-indigo-200 mt-2" />
            )}
          </div>

          {/* Conteúdo da atração */}
          <div className="flex-1 pt-1">
            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onAttractionClick?.(attraction)}
            >
              <div className="space-y-3">
                {/* Header: Hora e Nome */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      <span className="font-semibold text-sm text-indigo-600">
                        {attraction.time || "Horário não definido"}
                      </span>
                    </div>
                    {attraction.category && (
                      <Badge variant="secondary" className="text-xs">
                        {attraction.category}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {attraction.name}
                  </h3>
                </div>

                {/* Descrição */}
                {attraction.reason && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {attraction.reason}
                  </p>
                )}

                {/* Localização */}
                {attraction.location && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 line-clamp-1">
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
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-600 italic">
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
