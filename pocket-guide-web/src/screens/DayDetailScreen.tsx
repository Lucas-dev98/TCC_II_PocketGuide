import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
import { Button, Skeleton, EmptyState, useToast, MapboxMap } from "@/components";
import { DayNavigation } from "@/components/DayNavigation";
import { DayGallery } from "@/components/DayGallery";
import { DayTimeline } from "@/components/DayTimeline";
import { useDayNavigation } from "@/hooks/useDayNavigation";
import { useTripsStore } from "@/store/tripsStore";
import { AttractionDetail, PhotoData, Trip } from "@/types";
import PhotoService from "@/services/photoService";
import { dumpItineraryToConsole } from "@/services/debugItinerary";

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
  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [attractions, setAttractions] = useState<AttractionDetail[]>([]);
  const [photosLoading, setPhotosLoading] = useState(true);
  
  // Usar Zustand store
  const { trips } = useTripsStore();

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

  // Buscar dados da viagem da store
  useEffect(() => {
    try {
      console.log("🔍 Buscando trip com ID:", tripId);
      console.log("📋 Trips na store:", trips);
      
      const foundTrip = trips.find((t: Trip) => t.id === tripId);
      if (foundTrip) {
        console.log("✅ Trip encontrada:", foundTrip);
        console.log("📍 Itinerary:", foundTrip.itinerary);
        console.log("📍 Attractions:", foundTrip.attractions);
        
        // Debug: Dump complete itinerary structure
        dumpItineraryToConsole(foundTrip.itinerary);
        
        setTrip(foundTrip);
        setLoading(false);
      } else {
        console.warn("⚠️ Trip não encontrada com ID:", tripId, "em", trips.length, "trips");
        setLoading(false);
      }
    } catch (error) {
      console.error("❌ Erro ao buscar viagem:", error);
      showError("Não foi possível carregar a viagem");
      setLoading(false);
    }
  }, [tripId, trips, showError]);

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

  // Carregar atrações com fotos de forma assíncrona
  useEffect(() => {
    let isMounted = true;

    const loadAttractions = async () => {
      setPhotosLoading(true);
      try {
        if (!trip) {
          setPhotosLoading(false);
          return;
        }
        
        // Tentar buscar do itinerary primeiro, depois attractions
        const attractionsData = trip?.attractions || [];
        
        console.log("🎯 Extraindo atrações do dia", currentDay);
        console.log("📦 attractionsData:", attractionsData);
        console.log("📋 trip?.itinerary:", trip?.itinerary);

        let filtered: AttractionDetail[] = [];

        // Se houver attractions diretas, usar essas
        if (attractionsData && attractionsData.length > 0) {
          console.log("✅ Encontrado trip.attractions direto");
          const baseAttrs = attractionsData
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
            } as AttractionDetail));
          
          // Carregar fotos de forma assíncrona
          filtered = await Promise.all(
            baseAttrs.map(async (a) => ({
              ...a,
              photos: await generatePhotosForAttraction(a),
            }))
          );
          
          console.log("📸 Atrações filtradas da lista:", filtered);
          if (isMounted) {
            setAttractions(filtered);
          }
          return;
        }

        // Se não houver, tentar extrair do itinerary
        if (!trip?.itinerary) {
          console.warn("❌ Nenhum itinerary encontrado");
          if (isMounted) {
            setAttractions([]);
          }
          return;
        }

        let itineraryArray: any[] = [];
        
        // Tentar vários formatos
        if (Array.isArray(trip.itinerary)) {
          console.log("📌 Formato 1: itinerary é array direto");
          itineraryArray = trip.itinerary;
        } else if (typeof trip.itinerary === 'object') {
          // Verificar se tem propriedade itinerary (Gemini format)
          if (Array.isArray(trip.itinerary.itinerary)) {
            console.log("📌 Formato 2: itinerary.itinerary é array");
            itineraryArray = trip.itinerary.itinerary;
          }
          // Verificar se tem propriedade days
          else if (Array.isArray(trip.itinerary.days)) {
            console.log("📌 Formato 3: itinerary.days é array");
            itineraryArray = trip.itinerary.days;
          }
          // Verificar se tem propriedade attractions
          else if (Array.isArray(trip.itinerary.attractions)) {
            console.log("📌 Formato 4: itinerary.attractions é array");
            itineraryArray = trip.itinerary.attractions;
          }
          // Se nenhuma propriedade conhecida, talvez seja um mapa de dias
          else {
            console.log("📌 Tentando extrair chaves como dias");
            const keys = Object.keys(trip.itinerary);
            console.log("   Chaves encontradas:", keys);
            
            // Se tem chaves como "1", "2", "3" (dias como números string)
            if (keys.some(k => /^\d+$/.test(k))) {
              itineraryArray = keys
                .filter(k => /^\d+$/.test(k))
                .sort((a, b) => parseInt(a) - parseInt(b))
                .map(k => trip.itinerary[k]);
              console.log("   Extraído como mapa de dias");
            }
          }
        }
        
        console.log(`📌 itineraryArray tem ${itineraryArray.length} items`);
        
        if (!itineraryArray || itineraryArray.length === 0) {
          console.warn(`❌ Não conseguiu extrair array do itinerary para dia ${currentDay}`);
          if (isMounted) {
            setAttractions([]);
          }
          return;
        }
        
        // Agora filtrar por dia
        let dayAttractions: any[] = [];
        
        // Tipo 1: Array de atrações com propriedade 'day'
        dayAttractions = itineraryArray.filter((item: any) => item.day === currentDay);
        
        if (dayAttractions.length === 0) {
          console.log(`ℹ️ Nenhuma atração com dia=${currentDay}. Tentando índice ${currentDay - 1}...`);
          // Tipo 2: Array de dias (cada item é um dia)
          if (currentDay <= itineraryArray.length) {
            dayAttractions = itineraryArray[currentDay - 1]?.attractions || [];
          }
        }
        
        console.log(`✅ Encontradas ${dayAttractions.length} atrações para dia ${currentDay}`);
        
        if (dayAttractions.length === 0) {
          console.warn(`⚠️ Nenhuma atração encontrada para dia ${currentDay}`);
          if (isMounted) {
            setAttractions([]);
          }
          return;
        }
        
        // Extrair e ordenar atrações
        const baseAttrs = dayAttractions
          .map((a: any) => ({
            id: a.id || `${currentDay}-${Math.random()}`,
            day: currentDay,
            time: a.time || "00:00",
            name: a.name || a.title || "Sem nome",
            duration: a.duration || 60,
            reason: a.description || a.reason || "Atração do dia",
            tip: a.tip || a.suggestions || "",
            location: a.location || {
              lat: a.lat || 41.9028 + Math.random() * 0.01,
              lng: a.lng || 12.4964 + Math.random() * 0.01,
              address: "Roma, Itália",
              name: a.name || "Localização",
            },
            order: a.order || 0,
            category: a.category || "outro",
          } as AttractionDetail))
          .sort((a: any, b: any) => a.time.localeCompare(b.time));
        
        // Carregar fotos de forma assíncrona
        filtered = await Promise.all(
          baseAttrs.map(async (a) => ({
            ...a,
            photos: await generatePhotosForAttraction(a),
          }))
        );
        
        console.log("✅ Atrações finais extraídas e ordenadas:", filtered);
        if (isMounted) {
          setAttractions(filtered);
        }
      } finally {
        if (isMounted) {
          setPhotosLoading(false);
        }
      }
    };

    loadAttractions();

    return () => {
      isMounted = false;
    };
  }, [trip?.attractions, trip?.itinerary, currentDay]);

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
            <>
              {photosLoading && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
                  <p className="text-sm text-blue-600">Carregando fotos das atrações...</p>
                </div>
              )}
              <DayTimeline
                attractions={attractions}
                onAttractionClick={(attraction) => {
                  // TODO: Abrir modal com detalhes completos da atração
                  console.log("Atração clicada:", attraction);
                }}
              />
            </>
          ) : (
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <div className="mb-4">
                <EmptyState
                  title="Sem atrações"
                  description="Nenhuma atração planejada para este dia."
                />
              </div>
              
              {/* Debug info */}
              <div className="mt-6 text-xs text-gray-600 bg-white p-4 rounded border border-gray-200">
                <p className="font-mono font-bold mb-2">📊 Debug Info:</p>
                <p>Trip ID: {tripId}</p>
                <p>Day: {currentDay}</p>
                <p>Trip attractions: {trip?.attractions?.length || 0}</p>
                <p>Trip itinerary days: {trip?.itinerary?.length || 0}</p>
                {trip?.itinerary && trip.itinerary[currentDay - 1] && (
                  <div className="mt-2 bg-yellow-50 p-2 rounded">
                    <p>📌 Day {currentDay} itinerary:</p>
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(trip.itinerary[currentDay - 1], null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Mapa com localizações do dia */}
        {attractions.length > 0 && (
          <section aria-label="Mapa das atrações">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                🗺️ Rota do Dia
              </h2>
              <MapboxMap
                attractions={attractions.map((a) => ({
                  name: a.name,
                  reason: a.reason,
                  lat: a.location?.lat || 0,
                  lng: a.location?.lng || 0,
                }))}
                height="400px"
                onAttractionSelect={(attraction) => {
                  console.log("Localização selecionada:", attraction);
                }}
              />
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

/**
 * Função auxiliar para gerar fotos de demonstração
 * Usa PhotoService com múltiplas estratégias
 */
/**
 * Gera URLs de fotos para uma atração (função assíncrona)
 */
async function generatePhotosForAttraction(attraction: any): Promise<PhotoData[]> {
  console.log(`📸 Gerando fotos para atração: "${attraction.name}"`);

  const photos: PhotoData[] = [];

  // Gerar 2 URLs diferentes usando PhotoService
  for (let i = 0; i < 2; i++) {
    try {
      const photoSource = await PhotoService.generatePhotoUrl(attraction.name);
      
      photos.push({
        id: `${attraction.id || 'attraction'}-${i}`,
        url: photoSource.url,
        alt: `${attraction.name} - foto ${i + 1}`,
        attractionName: attraction.name,
        source: photoSource.source,
      });
      
      console.log(`✅ Foto ${i + 1} gerada para "${attraction.name}":`);
      console.log(`   URL: ${photoSource.url}`);
      console.log(`   Source: ${photoSource.source}`);
    } catch (error) {
      console.error(`❌ Erro gerando foto ${i + 1} para "${attraction.name}":`, error);
    }
  }

  if (photos.length === 0) {
    console.warn(`⚠️ Nenhuma foto foi gerada para "${attraction.name}"`);
  }

  return photos;
}

export default DayDetailScreen;

