import React, { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
import { Button, Skeleton, EmptyState, useToast, Card } from "@/components";
import { MainLayout } from "@/components/Layout";
import { DayNavigation } from "@/components/DayNavigation";
import { DayGallery } from "@/components/DayGallery";
import { DayTimeline } from "@/components/DayTimeline";
import { RouteSummary } from "@/components/RouteSummary";
import { useDayNavigation } from "@/hooks/useDayNavigation";
import { useNavigation } from "@/hooks/useNavigation";
import useI18n from "@/hooks/useI18n";
import { useTripsStore } from "@/store/tripsStore";
import { AttractionDetail, PhotoData, Trip } from "@/types";
import { debug } from "@/utils/debug";
import PhotoService from "@/services/photoService";

// Lazy load MapboxMap to reduce initial bundle size
const MapboxMap = lazy(() => import("@/components/MapboxMap").then(m => ({ default: m.MapboxMap })));

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
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [attractions, setAttractions] = useState<AttractionDetail[]>([]);
  const [photosLoading, setPhotosLoading] = useState(true);
  
  // Usar Zustand store
  const { trips } = useTripsStore();

  // Hook de navegação
  const {
    calculateRoute,
    clearRoute,
    currentRoute,
    currentOrigin,
    currentDestination,
    isLoadingRoute,
  } = useNavigation();

  // Validar parâmetros
  if (!tripId || !dayNumber) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <EmptyState
          title={t('dayDetail.invalidDay')}
          description={t('validation.required')}
          action={{
            label: t('dayDetail.backToTrip'),
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
      debug.log("🔍 Buscando trip com ID:", tripId);
      debug.log("📋 Trips na store:", trips);
      
      const foundTrip = trips.find((t: Trip) => t.id === tripId);
      if (foundTrip) {
        debug.log("✅ Trip encontrada:", foundTrip);
        debug.log("📍 Itinerary:", foundTrip.itinerary);
        debug.log("📍 Attractions:", foundTrip.attractions);
        
        setTrip(foundTrip);
        setLoading(false);
      } else {
        debug.warn("⚠️ Trip não encontrada com ID:", tripId, "em", trips.length, "trips");
        setLoading(false);
      }
    } catch (error) {
      debug.error("❌ Erro ao buscar viagem:", error);
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
        
        debug.log("🎯 Extraindo atrações do dia", currentDay);
        debug.log("📦 attractionsData:", attractionsData);
        debug.log("📋 trip?.itinerary:", trip?.itinerary);

        let filtered: AttractionDetail[] = [];

        // Se houver attractions diretas, usar essas
        if (attractionsData && attractionsData.length > 0) {
          debug.log("✅ Encontrado trip.attractions direto");
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
          
          debug.log("📸 Atrações filtradas da lista:", filtered);
          if (isMounted) {
            setAttractions(filtered);
          }
          return;
        }

        // Se não houver, tentar extrair do itinerary
        if (!trip?.itinerary) {
          debug.warn("❌ Nenhum itinerary encontrado");
          if (isMounted) {
            setAttractions([]);
          }
          return;
        }

        let itineraryArray: any[] = [];
        
        // Tentar vários formatos
        if (Array.isArray(trip.itinerary)) {
          debug.log("📌 Formato 1: itinerary é array direto");
          itineraryArray = trip.itinerary;
        } else if (typeof trip.itinerary === 'object') {
          // Verificar se tem propriedade itinerary (Gemini format)
          if (Array.isArray(trip.itinerary.itinerary)) {
            debug.log("📌 Formato 2: itinerary.itinerary é array");
            itineraryArray = trip.itinerary.itinerary;
          }
          // Verificar se tem propriedade days
          else if (Array.isArray(trip.itinerary.days)) {
            debug.log("📌 Formato 3: itinerary.days é array");
            itineraryArray = trip.itinerary.days;
          }
          // Verificar se tem propriedade attractions
          else if (Array.isArray(trip.itinerary.attractions)) {
            debug.log("📌 Formato 4: itinerary.attractions é array");
            itineraryArray = trip.itinerary.attractions;
          }
          // Se nenhuma propriedade conhecida, talvez seja um mapa de dias
          else {
            debug.log("📌 Tentando extrair chaves como dias");
            const keys = Object.keys(trip.itinerary);
            debug.log("   Chaves encontradas:", keys);
            
            // Se tem chaves como "1", "2", "3" (dias como números string)
            if (keys.some(k => /^\d+$/.test(k))) {
              itineraryArray = keys
                .filter(k => /^\d+$/.test(k))
                .sort((a, b) => parseInt(a) - parseInt(b))
                .map(k => trip.itinerary[k]);
              debug.log("   Extraído como mapa de dias");
            }
          }
        }
        
        debug.log(`📌 itineraryArray tem ${itineraryArray.length} items`);
        
        if (!itineraryArray || itineraryArray.length === 0) {
          debug.warn(`❌ Não conseguiu extrair array do itinerary para dia ${currentDay}`);
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
          debug.log(`ℹ️ Nenhuma atração com dia=${currentDay}. Tentando índice ${currentDay - 1}...`);
          // Tipo 2: Array de dias (cada item é um dia)
          if (currentDay <= itineraryArray.length) {
            dayAttractions = itineraryArray[currentDay - 1]?.attractions || [];
          }
        }
        
        debug.log(`✅ Encontradas ${dayAttractions.length} atrações para dia ${currentDay}`);
        
        if (dayAttractions.length === 0) {
          debug.warn(`⚠️ Nenhuma atração encontrada para dia ${currentDay}`);
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
        
        debug.log("✅ Atrações finais extraídas e ordenadas:", filtered);
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 p-4">
          <Skeleton className="w-32 h-10" />
        </div>
        <div className="max-w-6xl mx-auto p-4 space-y-6">
          <Skeleton className="w-full h-96" />
          <Skeleton className="w-full h-40" />
          <Skeleton className="w-full h-80" />
        </div>
      </div>
    );
  }

  // Validar se o dia existe
  if (currentDay < 1 || currentDay > totalDays) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <Card className="max-w-md shadow-lg border-slate-200 dark:border-slate-700">
          <Card.Body>
            <EmptyState
              title={t('dayDetail.invalidDay')}
              description={t('dayDetail.tripHasOnlyDays', { days: totalDays })}
              action={{
                label: t('dayDetail.backToTripDetails'),
                onClick: handleBackToTrip,
              }}
            />
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      {/* Header com navegação */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToTrip}
            className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label={t('dayDetail.backToTripDetails')}
          >
            <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </Button>
          <div className="flex-1">
            <h1 className="text-h2 font-bold text-slate-900 dark:text-white">
              {trip?.destination || "Viagem"}
            </h1>
            <p className="text-small text-slate-600 dark:text-slate-300">
              {t('dayDetail.dayOf', { current: currentDay, total: totalDays })}
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
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Galeria de fotos (primeira atração ou placeholder) */}
        <section aria-label="Galeria de fotos do dia">
          {attractions.length > 0 && attractions[0].photos && attractions[0].photos.length > 0 ? (
            <DayGallery
              photos={attractions[0].photos}
              attractionName={attractions[0].name}
            />
          ) : (
            <div className="w-full h-96 bg-gradient-to-br from-indigo-100 to-blue-50 dark:from-indigo-900 dark:to-blue-900 rounded-lg shadow-md flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-indigo-400 dark:text-indigo-300 mx-auto mb-3" />
                <p className="text-indigo-700 dark:text-indigo-200 font-semibold text-lg">
                  {trip?.destination || "Seu destino"}
                </p>
                <p className="text-indigo-600 dark:text-indigo-300 text-sm mt-1">
                  {t('dayDetail.exploreAttractions')}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Info do destino */}
        {trip && (
          <Card className="shadow-md border-slate-200 dark:border-slate-700">
            <Card.Header
              title={t('dayDetail.dayIn', { day: currentDay, destination: trip.destination })}
              subtitle={trip.country}
            />
            <Card.Body>
              {/* Informações do dia da viagem Gemini se disponível */}
              {trip.itinerary && trip.itinerary[currentDay - 1] && (
                <div className="space-y-3">
                  <p className="text-small text-slate-700 dark:text-slate-300 leading-relaxed">
                    {trip.itinerary[currentDay - 1].description}
                  </p>
                </div>
              )}
              {!trip.itinerary && (
                <p className="text-small text-slate-600 dark:text-slate-300">
                  {t('dayDetail.explorePlanned')}
                </p>
              )}
            </Card.Body>
          </Card>
        )}

        {/* Timeline de atrações */}
        <section aria-label={t('dayDetail.attractions')}>
          <div className="mb-6">
            <h2 className="text-h2 font-bold text-slate-900 dark:text-white">
              {t('dayDetail.attractionsTitle')}
            </h2>
            <p className="text-small text-slate-600 dark:text-slate-300 mt-1">
              {t('dayDetail.attractionsPlanned', { count: attractions.length })}
            </p>
          </div>

          {attractions.length > 0 ? (
            <>
              {photosLoading && (
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent" />
                  <p className="text-small text-blue-700 dark:text-blue-300">
                    {t('dayDetail.loadingPhotos')}
                  </p>
                </div>
              )}
              <DayTimeline
                attractions={attractions}
                onAttractionClick={(attraction) => {
                  debug.log("Atração clicada:", attraction);
                }}
                onNavigate={(destination, destinationIndex) => {
                  console.log('🧭 DayDetailScreen.onNavigate called:', {
                    destination: destination.name,
                    destinationIndex,
                    attractionsCount: attractions.length,
                  });

                  // Use o índice diretamente em vez de procurar
                  const originAttraction = destinationIndex > 0 
                    ? attractions[destinationIndex - 1] 
                    : null;

                  console.log('🧭 Origin attraction:', {
                    found: !!originAttraction,
                    name: originAttraction?.name,
                    location: originAttraction?.location,
                    index: destinationIndex - 1,
                  });

                  if (originAttraction) {
                    console.log('✅ Calling calculateRoute...');
                    calculateRoute(originAttraction, destination, 'driving');
                  } else {
                    console.warn('❌ No origin attraction found at index:', destinationIndex - 1);
                    showError(t('navigation.noOriginPoint') || 'Nenhum ponto de partida');
                  }
                }}
              />
            </>
          ) : (
            <Card className="shadow-md border-slate-200 dark:border-slate-700">
              <Card.Body>
                <EmptyState
                  title={t('dayDetail.noAttractionsPlanned')}
                  description={t('dayDetail.noAttractionAdded')}
                  action={{
                    label: t('dayDetail.backToTripDetails'),
                    onClick: handleBackToTrip,
                  }}
                />
              </Card.Body>
            </Card>
          )}
        </section>

        {/* Resumo da Rota */}
        {currentRoute && currentOrigin && currentDestination && (
          <RouteSummary
            route={currentRoute}
            origin={currentOrigin.name || currentOrigin.location?.address}
            destination={currentDestination.name || currentDestination.location?.address}
            isLoading={isLoadingRoute}
            onClose={clearRoute}
          />
        )}

        {/* Mapa com localizações do dia */}
        {attractions.length > 0 && (
          <Card className="shadow-md border-slate-200 dark:border-slate-700">
            <Card.Header title={t('dayDetail.routeMap')} />
            <Card.Body>
              <Suspense fallback={<Skeleton className="w-full h-96 rounded-lg" />}>
                <MapboxMap
                  attractions={attractions.map((a) => ({
                    name: a.name,
                    reason: a.reason,
                    lat: a.location?.lat || 0,
                    lng: a.location?.lng || 0,
                  }))}
                  height="400px"
                  onAttractionSelect={(attraction) => {
                    debug.log("Localização selecionada:", attraction);
                  }}
                  route={currentRoute}
                  routeOrigin={currentOrigin?.location}
                  routeDestination={currentDestination?.location}
                />
              </Suspense>
            </Card.Body>
          </Card>
        )}
      </main>
      </div>
    </MainLayout>
  );
};

/**
 * Gera URLs de fotos para uma atração (função assíncrona)
 */
async function generatePhotosForAttraction(attraction: any): Promise<PhotoData[]> {
  debug.log(`📸 Gerando fotos para atração: "${attraction.name}"`);

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
        width: photoSource.width,
        height: photoSource.height,
        // Attribution metadata for Unsplash compliance
        photographer: photoSource.photographer,
        photographerUrl: photoSource.photographerUrl,
        unsplashLink: photoSource.unsplashLink,
        photoId: photoSource.photoId,
        downloadLocation: photoSource.downloadLocation,
      });
      
      debug.log(`✅ Foto ${i + 1} gerada para "${attraction.name}":`);
      debug.log(`   URL: ${photoSource.url}`);
      debug.log(`   Source: ${photoSource.source}`);
      debug.log(`   Photographer: ${photoSource.photographer}`);
    } catch (error) {
      debug.error(`❌ Erro gerando foto ${i + 1} para "${attraction.name}":`, error);
    }
  }

  if (photos.length === 0) {
    debug.warn(`⚠️ Nenhuma foto foi gerada para "${attraction.name}"`);
  }

  return photos;
}

export default DayDetailScreen;

