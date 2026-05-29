import React, { useEffect, useMemo, useState, lazy, Suspense, useRef } from "react";
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
import { useAuth } from "@/hooks/useAuth";
import useI18n from "@/hooks/useI18n";
import { useTripsStore } from "@/store/tripsStore";
import { AttractionDetail, PhotoData, Trip } from "@/types";
import { debug } from "@/utils/debug";
import PhotoService from "@/services/photoService";
import { searchCities } from "@/services/mapboxGeocoding";

// Lazy load MapboxMap to reduce initial bundle size
const MapboxMap = lazy(() => import("@/components/MapboxMap").then(m => ({ default: m.MapboxMap })));

/**
 * Converte número do mês (1-12) para estação em português
 */
function getSeasonFromMonth(month: number): 'primavera' | 'verão' | 'outono' | 'inverno' | undefined {
  if (!month || month < 1 || month > 12) return undefined;
  
  // Hemisfério sul (Brasil)
  if (month >= 9 && month <= 11) return 'primavera';
  if (month >= 12 || month <= 2) return 'verão';
  if (month >= 3 && month <= 5) return 'outono';
  if (month >= 6 && month <= 8) return 'inverno';
  
  return undefined;
}

function normalizeCategory(value?: string): 'restaurante' | 'museu' | 'natureza' | 'compras' | 'cultura' | 'outro' {
  const lower = String(value || '').toLowerCase();
  if (lower.includes('restaurant') || lower.includes('restaurante') || lower.includes('food')) return 'restaurante';
  if (lower.includes('museum') || lower.includes('museu')) return 'museu';
  if (lower.includes('nature') || lower.includes('parque')) return 'natureza';
  if (lower.includes('shop') || lower.includes('compra')) return 'compras';
  if (lower.includes('culture') || lower.includes('cultura')) return 'cultura';
  return 'outro';
}

function toFiniteNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number.parseFloat(value);
  return Number.NaN;
}

function isValidLatLng(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

function normalizeLatLngWithHint(
  rawLat: unknown,
  rawLng: unknown,
  destinationCenter?: [number, number]
): { lat: number; lng: number } | undefined {
  const lat = toFiniteNumber(rawLat);
  const lng = toFiniteNumber(rawLng);

  const normalValid = isValidLatLng(lat, lng);
  const swappedValid = isValidLatLng(lng, lat);

  if (!normalValid && !swappedValid) {
    return undefined;
  }

  if (!normalValid && swappedValid) {
    return { lat: lng, lng: lat };
  }

  if (!swappedValid) {
    return { lat, lng };
  }

  if (destinationCenter) {
    const [centerLng, centerLat] = destinationCenter;
    const distanceNormal = Math.hypot(lng - centerLng, lat - centerLat);
    const distanceSwapped = Math.hypot(lat - centerLng, lng - centerLat);
    if (distanceSwapped + 0.2 < distanceNormal) {
      return { lat: lng, lng: lat };
    }
  }

  return { lat, lng };
}

function extractValidLocation(
  item: any,
  destinationCenter?: [number, number]
): AttractionDetail['location'] | undefined {
  const rawLat = item?.location?.lat ?? item?.lat;
  const rawLng = item?.location?.lng ?? item?.lng;

  const normalized = normalizeLatLngWithHint(rawLat, rawLng, destinationCenter);
  if (!normalized) {
    return undefined;
  }

  return {
    lat: normalized.lat,
    lng: normalized.lng,
    address: item?.location?.address || item?.address,
    name: item?.location?.name || item?.name,
  };
}

function normalizeItineraryItems(itinerary: any): any[] {
  if (!itinerary) return [];

  if (Array.isArray(itinerary)) {
    if (itinerary.some((item) => item?.day !== undefined)) {
      return itinerary;
    }

    if (itinerary.some((item) => Array.isArray(item?.attractions))) {
      return itinerary.flatMap((day, index) => {
        const dayNumber = day?.day || index + 1;
        return (day?.attractions || []).map((attraction: any) => ({
          ...attraction,
          day: attraction?.day || dayNumber,
        }));
      });
    }

    return [];
  }

  if (typeof itinerary === 'object') {
    if (Array.isArray(itinerary.itinerary)) {
      return normalizeItineraryItems(itinerary.itinerary);
    }

    if (Array.isArray(itinerary.days)) {
      return normalizeItineraryItems(itinerary.days);
    }

    if (Array.isArray(itinerary.attractions)) {
      return normalizeItineraryItems(itinerary.attractions);
    }

    const numericKeys = Object.keys(itinerary).filter((key) => /^\d+$/.test(key));
    if (numericKeys.length > 0) {
      const normalizedDays = numericKeys
        .sort((a, b) => Number(a) - Number(b))
        .map((key) => itinerary[key]);
      return normalizeItineraryItems(normalizedDays);
    }
  }

  return [];
}

async function resolveAttractionLocation(
  attraction: AttractionDetail,
  destination: string,
  language: string,
  destinationCenter?: [number, number]
): Promise<AttractionDetail['location']> {
  if (attraction.location?.lat !== undefined && attraction.location?.lng !== undefined) {
    const normalized = normalizeLatLngWithHint(
      attraction.location.lat,
      attraction.location.lng,
      destinationCenter
    );
    if (normalized) {
      return {
        ...attraction.location,
        lat: normalized.lat,
        lng: normalized.lng,
      };
    }
  }

  const query = `${attraction.name}, ${destination}`;
  const suggestions = await searchCities(query, language.startsWith('pt') ? 'pt' : language.startsWith('es') ? 'es' : 'en');
  const best = suggestions.find((suggestion) => {
    const coords = suggestion.coordinates;
    return Array.isArray(coords) && coords.length === 2 && !(coords[0] === 0 && coords[1] === 0);
  });

  if (!best?.coordinates) {
    return attraction.location;
  }

  return {
    lat: best.coordinates[1],
    lng: best.coordinates[0],
    address: best.city,
    name: attraction.name,
  };
}

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
  const { t, language } = useI18n();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [attractions, setAttractions] = useState<AttractionDetail[]>([]);
  const [photosLoading, setPhotosLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([0, 0]);
  const [hasTriedLoadingTrips, setHasTriedLoadingTrips] = useState(false);
  
  // Ref para o mapa (scroll automático)
  const mapRef = useRef<HTMLDivElement>(null);
  
  // Usar Zustand store
  const { trips, loadTrips } = useTripsStore();

  // Hook de navegação
  const {
    calculateRoute,
    clearRoute,
    currentRoute,
    currentOrigin,
    currentDestination,
    isLoadingRoute,
    routingProfile,
  } = useNavigation();

  const handleRouteProfileChange = (profile: 'driving' | 'walking' | 'cycling') => {
    if (!currentOrigin || !currentDestination) {
      return;
    }

    calculateRoute(currentOrigin, currentDestination, profile);
  };

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
        setHasTriedLoadingTrips(false);
      } else {
        if (user?.uid && !hasTriedLoadingTrips) {
          debug.warn("⚠️ Trip não encontrada localmente. Carregando trips do backend/store...");
          setHasTriedLoadingTrips(true);
          loadTrips(user.uid)
            .catch((error) => {
              debug.error("❌ Erro ao sincronizar trips:", error);
            })
            .finally(() => {
              setLoading(false);
            });
        } else {
          debug.warn("⚠️ Trip não encontrada com ID:", tripId, "em", trips.length, "trips");
          setLoading(false);
        }
      }
    } catch (error) {
      debug.error("❌ Erro ao buscar viagem:", error);
      showError("Não foi possível carregar a viagem");
      setLoading(false);
    }
  }, [tripId, trips, user?.uid, hasTriedLoadingTrips, loadTrips, showError]);

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
        
        const attractionsData = trip?.attractions || [];
        const destinationSuggestions = await searchCities(
          trip.destination,
          language.startsWith('pt') ? 'pt' : language.startsWith('es') ? 'es' : 'en'
        );
        const destinationCenter = destinationSuggestions.find((suggestion) => {
          const coords = suggestion.coordinates;
          return Array.isArray(coords) && coords.length === 2 && !(coords[0] === 0 && coords[1] === 0);
        })?.coordinates;
        
        debug.log("🎯 Extraindo atrações do dia", currentDay);
        debug.log("📦 attractionsData:", attractionsData);
        debug.log("📋 trip?.itinerary:", trip?.itinerary);

        let filtered: AttractionDetail[] = [];

        // Se houver attractions diretas, usar essas
        if (attractionsData && attractionsData.length > 0) {
          debug.log("✅ Encontrado trip.attractions direto");
          const baseAttrs = attractionsData
            .filter((a) => a.day === currentDay)
            .map((a, index) => ({
              ...a,
              id: a.id || `${currentDay}-${index}-${a.name || 'attraction'}`,
              category: normalizeCategory((a as any).category || a.reason),
              location: extractValidLocation(a, destinationCenter),
            } as AttractionDetail));
          
          // Carregar fotos de forma assíncrona
          const season = trip.travelMonth ? getSeasonFromMonth(parseInt(trip.travelMonth)) : undefined;
          
          filtered = await Promise.all(
            baseAttrs.map(async (a) => {
              const location = await resolveAttractionLocation(a, trip.destination, language, destinationCenter);
              return {
                ...a,
                location,
                photos: await generatePhotosForAttraction(
                  a,
                  trip.destination,
                  season,
                  currentDay,
                  language
                ),
              };
            })
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

        const itineraryArray = normalizeItineraryItems(trip.itinerary);
        
        debug.log(`📌 itineraryArray tem ${itineraryArray.length} items`);
        
        if (!itineraryArray || itineraryArray.length === 0) {
          debug.warn(`❌ Não conseguiu extrair array do itinerary para dia ${currentDay}`);
          if (isMounted) {
            setAttractions([]);
          }
          return;
        }
        
        const dayAttractions = itineraryArray.filter((item: any) => Number(item.day || 1) === currentDay);
        
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
          .map((a: any, index: number) => ({
            id: a.id || `${currentDay}-${index}-${a.name || 'attraction'}`,
            day: currentDay,
            time: a.time || "00:00",
            name: a.name || a.title || "Sem nome",
            duration: a.duration || 60,
            reason: a.description || a.reason || "Atração do dia",
            tip: a.tip || a.suggestions || "",
            location: extractValidLocation(a, destinationCenter),
            order: a.order || 0,
            category: normalizeCategory(a.category || a.reason),
          } as AttractionDetail))
          .sort((a: any, b: any) => a.time.localeCompare(b.time));
        
        // Carregar fotos de forma assíncrona
        const season = trip.travelMonth ? getSeasonFromMonth(parseInt(trip.travelMonth)) : undefined;
        
        filtered = await Promise.all(
          baseAttrs.map(async (a) => {
            const location = await resolveAttractionLocation(a, trip.destination, language, destinationCenter);
            return {
              ...a,
              location,
              photos: await generatePhotosForAttraction(
                a,
                trip.destination,
                season,
                currentDay,
                language
              ),
            };
          })
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
  }, [trip, currentDay, language]);

  useEffect(() => {
    clearRoute();
  }, [tripId, currentDay, clearRoute]);

  // Centralizar o mapa no destino real quando não houver coordenadas válidas nas atrações
  useEffect(() => {
    let active = true;

    const resolveDestinationCenter = async () => {
      if (!trip?.destination) return;

      try {
        const suggestions = await searchCities(trip.destination, 'pt');
        const bestMatch = suggestions.find((suggestion) => {
          const coords = suggestion.coordinates;
          return Array.isArray(coords) && coords.length === 2 && !(coords[0] === 0 && coords[1] === 0);
        });

        if (active && bestMatch?.coordinates) {
          setMapCenter(bestMatch.coordinates);
          debug.log('🗺️ DayDetailScreen: map center resolved from destination', {
            destination: trip.destination,
            coordinates: bestMatch.coordinates,
          });
        }
      } catch (error) {
        debug.warn('⚠️ DayDetailScreen: could not resolve destination center', error);
      }
    };

    resolveDestinationCenter();

    return () => {
      active = false;
    };
  }, [trip?.destination]);

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

  // Scroll automático para o mapa quando uma rota é calculada
  useEffect(() => {
    if (currentRoute && mapRef.current) {
      console.log('🗺️ DayDetailScreen: Scrolling to map...');
      setTimeout(() => {
        mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300); // Pequeno delay para dar tempo da rota ser renderizada
    }
  }, [currentRoute]);

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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 overflow-x-hidden">
      {/* Header com navegação */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center gap-2 sm:gap-4 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToTrip}
            className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex-shrink-0"
            aria-label={t('dayDetail.backToTripDetails')}
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700 dark:text-slate-300" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-h2 font-bold text-slate-900 dark:text-white truncate">
              {trip?.destination || "Viagem"}
            </h1>
            <p className="text-xs sm:text-small text-slate-600 dark:text-slate-300 truncate">
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
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-8">
        {/* Galeria de fotos (primeira atração ou placeholder) */}
        <section aria-label="Galeria de fotos do dia">
          {attractions.length > 0 && attractions[0].photos && attractions[0].photos.length > 0 ? (
            <DayGallery
              photos={attractions[0].photos}
              attractionName={attractions[0].name}
            />
          ) : (
            <div className="w-full h-64 sm:h-96 bg-gradient-to-br from-indigo-100 to-blue-50 dark:from-indigo-900 dark:to-blue-900 rounded-lg shadow-md flex items-center justify-center">
              <div className="text-center px-4">
                <MapPin className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-400 dark:text-indigo-300 mx-auto mb-2 sm:mb-3" />
                <p className="text-indigo-700 dark:text-indigo-200 font-semibold text-base sm:text-lg">
                  {trip?.destination || "Seu destino"}
                </p>
                <p className="text-indigo-600 dark:text-indigo-300 text-xs sm:text-sm mt-1">
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
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-h2 font-bold text-slate-900 dark:text-white">
              {t('dayDetail.attractionsTitle')}
            </h2>
            <p className="text-xs sm:text-small text-slate-600 dark:text-slate-300 mt-1">
              {t('dayDetail.attractionsPlanned', { count: attractions.length })}
            </p>
          </div>

          {attractions.length > 0 ? (
            <>
              {photosLoading && (
                <div className="mb-4 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-2 sm:gap-3">
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-blue-500 border-t-transparent flex-shrink-0" />
                  <p className="text-xs sm:text-small text-blue-700 dark:text-blue-300">
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
                    destinationLocation: destination.location,
                  });

                  // Validar localização do destino
                  if (!destination.location || !destination.location.lat || !destination.location.lng) {
                    console.warn('⚠️ No location data available for destination');
                    showError(t('navigation.noOriginPoint') || 'Localização da atração não disponível');
                    return;
                  }

                  let originAttraction: AttractionDetail;

                  // Define origem com base na posição na timeline
                  if (destinationIndex === 0) {
                    // Primeira atração: criar ponto de origem com pequeno offset
                    const offset = 0.001; // ~111 metros
                    originAttraction = {
                      id: `origin-${Date.now()}`,
                      day: destination.day,
                      time: destination.time,
                      name: trip?.destination || 'Ponto Inicial',
                      duration: 0,
                      reason: 'Ponto de partida',
                      location: {
                        lat: destination.location.lat + offset,
                        lng: destination.location.lng + offset,
                        address: trip?.destination || 'Ponto de partida',
                        name: trip?.destination || 'Ponto de partida',
                      },
                      category: 'outro',
                    };
                    console.log('✅ Navigating TO first attraction (from offset point):', {
                      from: originAttraction.location,
                      to: destination.location,
                    });
                  } else {
                    // Atrações subsequentes: origem é a atração anterior
                    originAttraction = attractions[destinationIndex - 1];
                    
                    if (!originAttraction.location || !originAttraction.location.lat || !originAttraction.location.lng) {
                      console.warn('⚠️ Previous attraction has no location data');
                      showError(t('navigation.noOriginPoint') || 'Localização da atração anterior não disponível');
                      return;
                    }

                    console.log('✅ Navigating FROM previous attraction TO current:', {
                      from: originAttraction.name,
                      to: destination.name,
                      fromLocation: originAttraction.location,
                      toLocation: destination.location,
                    });
                  }

                  calculateRoute(originAttraction, destination, routingProfile);
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
            selectedProfile={routingProfile === 'driving-traffic' ? 'driving' : routingProfile}
            onProfileChange={handleRouteProfileChange}
            onClose={clearRoute}
          />
        )}

        {/* Mapa com localizações do dia */}
        {attractions.length > 0 && (
          <div ref={mapRef} className="w-full overflow-x-hidden">
            <Card className="shadow-md border-slate-200 dark:border-slate-700 w-full">
              <Card.Header title={t('dayDetail.routeMap')} />
              <Card.Body className="p-0 overflow-hidden">
                <Suspense fallback={<Skeleton className="w-full h-64 sm:h-96 rounded-lg" />}>
                  <MapboxMap
                    center={mapCenter}
                    attractions={attractions.map((a) => ({
                      name: a.name,
                      reason: a.reason,
                      location: a.location,
                      lat: a.location?.lat,
                      lng: a.location?.lng,
                    }))}
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
          </div>
        )}
      </main>
      </div>
    </MainLayout>
  );
};

/**
 * Gera URLs de fotos para uma atração (função assíncrona)
 */
async function generatePhotosForAttraction(
  attraction: any,
  destination?: string,
  season?: string,
  tripDay?: number,
  language?: string
): Promise<PhotoData[]> {
  debug.log(`📸 Gerando fotos para atração: "${attraction.name}" em ${destination || 'local desconhecido'}`);

  const photos: PhotoData[] = [];

  // Validar e fazer cast da season para o tipo correto
  const validSeasons = ['primavera', 'verão', 'outono', 'inverno'];
  const validatedSeason = season && validSeasons.includes(season.toLowerCase()) 
    ? (season.toLowerCase() as 'primavera' | 'verão' | 'outono' | 'inverno')
    : undefined;

  // Criar contexto com informações da viagem
  const photoContext = {
    destination: destination,
    reason: attraction.reason || attraction.description,
    category: attraction.category,
    time: attraction.time,
    tip: attraction.tip,
    season: validatedSeason,
    dayOfWeek: tripDay ? new Date().toLocaleDateString('pt-BR', { weekday: 'long' }).split('-')[0] : undefined,
    language,
  };

  // Gerar 2 URLs diferentes usando PhotoService
  for (let i = 0; i < 2; i++) {
    try {
      const photoSource = await PhotoService.generatePhotoUrl(attraction.name, photoContext);
      
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
      
      debug.log(`✅ Foto ${i + 1} gerada para "${attraction.name}" (${destination}):`);
      debug.log(`   URL: ${photoSource.url}`);
      debug.log(`   Source: ${photoSource.source}`);
      debug.log(`   Context: destination=${destination}, time=${attraction.time}, season=${validatedSeason}`);
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

