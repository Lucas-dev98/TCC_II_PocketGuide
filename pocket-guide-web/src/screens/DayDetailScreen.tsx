import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
import { Button, Skeleton, EmptyState, useToast } from "@/components";
import { DayNavigation } from "@/components/DayNavigation";
import { DayGallery } from "@/components/DayGallery";
import { DayTimeline } from "@/components/DayTimeline";
import { useDayNavigation } from "@/hooks/useDayNavigation";
import { AttractionDetail, PhotoData, Trip } from "@/types";

/**
 * Tela de detalhes de um dia específico da viagem
 * Rota: /trip/:tripId/day/:dayNumber
 */
export const DayDetailScreen: React.FC = () => {
  const { tripId, dayNumber } = useParams<{
    tripId: string;
    dayNumber: string;
  }>();
  const navigate = useNavigate();
  const { showError } = useToast();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  // Validar parâmetros
  if (!tripId || !dayNumber) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <EmptyState
          title="Dados inválidos"
          description="Não foi possível carregar os detalhes do dia."
          action={{
            label: "Voltar para Home",
            onClick: () => navigate("/"),
          }}
        />
      </div>
    );
  }

  const currentDay = parseInt(dayNumber, 10);

  // Buscar dados da viagem
  useEffect(() => {
    const loadTrip = async () => {
      try {
        setLoading(true);
        // TODO: Em produção, buscar do Firebase/API
        // Por enquanto, vamos usar dados do localStorage
        const storedTrips = localStorage.getItem("trips");
        if (storedTrips) {
          const trips = JSON.parse(storedTrips);
          const foundTrip = trips.find((t: Trip) => t.id === tripId);
          if (foundTrip) {
            setTrip(foundTrip);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar viagem:", error);
        showError("Não foi possível carregar a viagem");
      } finally {
        setLoading(false);
      }
    };

    loadTrip();
  }, [tripId, showError]);

  // Calcular total de dias
  const totalDays = useMemo(() => {
    if (!trip?.startDate || !trip?.endDate) return 1;
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    return (
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );
  }, [trip?.startDate, trip?.endDate]);

  // Hook de navegação
  const navigation = useDayNavigation(totalDays);

  // Filtrar atrações do dia
  const attractions: AttractionDetail[] = useMemo(() => {
    if (!trip?.attractions) return [];
    return trip.attractions
      .filter((a) => a.day === currentDay)
      .map((a) => ({
        ...a,
        category: a.reason
          ? (a.reason.toLowerCase().includes("restaurante")
              ? "restaurante"
              : a.reason.toLowerCase().includes("museu")
                ? "museu"
                : a.reason.toLowerCase().includes("natureza")
                  ? "natureza"
                  : a.reason.toLowerCase().includes("compra")
                    ? "compras"
                    : "outro")
          : "outro",
        photos: generatePhotosForAttraction(a),
      } as AttractionDetail));
  }, [trip?.attractions, currentDay]);

  // Buscar data do dia
  const dayDate = useMemo(() => {
    if (!trip?.startDate) return undefined;
    const start = new Date(trip.startDate);
    const dayDate = new Date(start);
    dayDate.setDate(dayDate.getDate() + currentDay - 1);
    return dayDate.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [trip?.startDate, currentDay]);

  // Voltar para viagem
  const handleBackToTrip = () => {
    navigate(`/trip/${tripId}`);
  };

  // Skeleton loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4">
          <Skeleton className="w-32 h-8" />
        </div>
        <div className="max-w-4xl mx-auto p-4 space-y-6">
          <Skeleton className="w-full h-96" />
          <Skeleton className="w-full h-32" />
          <Skeleton className="w-full h-64" />
        </div>
      </div>
    );
  }

  // Validar se o dia existe
  if (currentDay < 1 || currentDay > totalDays) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <EmptyState
          title="Dia inválido"
          description={`A viagem tem apenas ${totalDays} dia(s).`}
          action={{
            label: "Voltar para viagem",
            onClick: handleBackToTrip,
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com navegação */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToTrip}
            className="rounded-full"
            aria-label="Voltar para detalhes da viagem"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">
              {trip?.destination || "Viagem"}
            </h1>
            <p className="text-sm text-gray-600">
              Dia {currentDay} de {totalDays}
            </p>
          </div>
        </div>

        {/* Navegação entre dias */}
        <DayNavigation
          navigationState={navigation}
          onPrevious={navigation.goToPreviousDay}
          onNext={navigation.goToNextDay}
          dayDate={dayDate}
        />
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* Galeria de fotos (primeira atração ou placeholder) */}
        {attractions.length > 0 && attractions[0].photos && attractions[0].photos.length > 0 ? (
          <section aria-label="Galeria de fotos do dia">
            <DayGallery
              photos={attractions[0].photos}
              attractionName={attractions[0].name}
            />
          </section>
        ) : (
          <div className="w-full h-96 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-indigo-300 mx-auto mb-2" />
              <p className="text-indigo-700 font-medium">
                {trip?.destination || "Seu destino"}
              </p>
            </div>
          </div>
        )}

        {/* Info do destino */}
        {trip && (
          <section className="bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Dia {currentDay} em {trip.destination}
            </h2>

            {trip.country && (
              <p className="text-sm text-gray-600 mb-2">📍 {trip.country}</p>
            )}

            {/* Informações do dia da viagem Gemini se disponível */}
            {trip.itinerary && trip.itinerary[currentDay - 1] && (
              <div className="space-y-2 mt-4">
                <p className="text-sm text-gray-700">
                  {trip.itinerary[currentDay - 1].description}
                </p>
              </div>
            )}
          </section>
        )}

        {/* Timeline de atrações */}
        <section aria-label="Atrações do dia">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Atrações ({attractions.length})
            </h2>
          </div>

          {attractions.length > 0 ? (
            <DayTimeline
              attractions={attractions}
              onAttractionClick={(attraction) => {
                // TODO: Abrir modal com detalhes completos da atração
                console.log("Atração clicada:", attraction);
              }}
            />
          ) : (
            <EmptyState
              title="Sem atrações"
              description="Nenhuma atração planejada para este dia."
            />
          )}
        </section>

        {/* Mapa com localizações do dia */}
        {attractions.length > 0 && (
          <section aria-label="Mapa das atrações">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Mapa das Atrações
              </h2>
              <div className="bg-gray-100 rounded-lg h-80 flex items-center justify-center">
                <p className="text-gray-500">
                  🗺️ Integração com Mapbox será adicionada aqui
                </p>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

/**
 * Função auxiliar para gerar fotos de demonstração
 * Em produção, estas viriam do banco de dados ou API
 */
function generatePhotosForAttraction(attraction: any): PhotoData[] {
  // Mock data - em produção, viria do banco de dados
  const mockPhotos: PhotoData[] = [
    {
      id: `${attraction.id}-1`,
      url: `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&h=600&fit=crop`,
      alt: `${attraction.name} - foto 1`,
      attractionName: attraction.name,
      source: "unsplash",
    },
    {
      id: `${attraction.id}-2`,
      url: `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=600&fit=crop`,
      alt: `${attraction.name} - foto 2`,
      attractionName: attraction.name,
      source: "unsplash",
    },
  ];

  return mockPhotos;
}

export default DayDetailScreen;
