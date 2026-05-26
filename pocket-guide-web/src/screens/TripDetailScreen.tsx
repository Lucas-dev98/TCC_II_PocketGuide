import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useI18n from '../hooks/useI18n';
import { useAuth } from '../hooks/useAuth';
import { useTripsStore } from '../store/tripsStore';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { MapboxMap } from '../components/MapboxMap';
import { ShareButton } from '../components/ShareButton';
import { ExportButton } from '../components/ExportButton';
import { FavoriteButton } from '../components/FavoriteButton';
import { MainLayout } from '../components/Layout';
import { debug } from '../utils/debug';
import { BudgetPerDay } from '../types';
import PhotoService from '../services/photoService';
import {
  ArrowLeft,
  Calendar,
  Users,
  MapIcon,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { formatDate } from '../utils/formatDate';
import { searchCities } from '../services/mapboxGeocoding';

const mapCategoryForPhotoContext = (attraction: any): 'restaurante' | 'museu' | 'natureza' | 'compras' | 'cultura' | 'outro' => {
  const categoryValue = String(attraction?.category || '').toLowerCase();
  const descriptionValue = String(attraction?.description || attraction?.reason || '').toLowerCase();

  if (categoryValue.includes('food') || categoryValue.includes('restaurant') || descriptionValue.includes('restaurante')) {
    return 'restaurante';
  }
  if (categoryValue.includes('museum') || descriptionValue.includes('museu')) {
    return 'museu';
  }
  if (categoryValue.includes('nature') || descriptionValue.includes('parque')) {
    return 'natureza';
  }
  if (categoryValue.includes('shop') || descriptionValue.includes('compra')) {
    return 'compras';
  }
  if (categoryValue.includes('culture') || descriptionValue.includes('cultura')) {
    return 'cultura';
  }

  return 'outro';
};

const buildCardFallbackImage = (name: string): string => {
  const safeName = (name || 'Atração').replace(/[<>&"']/g, '').slice(0, 26);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#334155"/><stop offset="100%" stop-color="#1e293b"/></linearGradient></defs><rect width="400" height="300" fill="url(#g)"/><rect x="20" y="200" width="360" height="72" rx="10" fill="rgba(15,23,42,0.45)"/><text x="200" y="242" fill="#f8fafc" font-size="18" font-family="Arial,sans-serif" text-anchor="middle">${safeName}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

/**
 * Mapeia o tipo de orçamento (BudgetPerDay) para a chave de tradução
 */
const getBudgetLabel = (budget?: BudgetPerDay | string): string => {
  if (!budget) return 'N/A';
  
  const labels: Record<string, string> = {
    'ultra-economico': 'Ultra Econômico',
    'economico': 'Econômico',
    'medio': 'Médio',
    'premium': 'Premium',
    'luxo': 'Luxo',
    // Valores antigos para compatibilidade
    'econômico': 'Econômico',
    'médio': 'Médio',
  };

  return labels[budget] || 'N/A';
};

const parseCoordinate = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  const normalized = typeof value === 'string' ? value.replace(',', '.').trim() : value;
  const parsed = typeof normalized === 'number' ? normalized : Number.parseFloat(String(normalized));

  return Number.isFinite(parsed) ? parsed : undefined;
};

const normalizeAttractionCoordinates = (attraction: any) => {
  const locationLat = parseCoordinate(attraction?.location?.lat);
  const locationLng = parseCoordinate(attraction?.location?.lng);
  const directLat = parseCoordinate(attraction?.lat);
  const directLng = parseCoordinate(attraction?.lng);

  // Prefer nested location coordinates because they come from the structured geocoding payload.
  const lat = locationLat ?? directLat;
  const lng = locationLng ?? directLng;

  const normalizedLocation =
    lat !== undefined && lng !== undefined
      ? {
          ...(attraction?.location || {}),
          lat,
          lng,
        }
      : attraction?.location;

  return {
    lat,
    lng,
    location: normalizedLocation,
  };
};

/**
 * Transform Gemini itinerary format (array of activities with day property)
 * to display format (array of days with activities)
 */
const transformItinerary = (itinerary: any) => {
  debug.log('📍 transformItinerary input:', itinerary);
  
  if (!itinerary) {
    debug.warn('⚠️ transformItinerary: itinerary is null/undefined');
    return null;
  }
  
  // If it's already in the correct format
  if (itinerary.days && Array.isArray(itinerary.days)) {
    debug.log('✅ transformItinerary: Already in correct format (has days array)');
    return itinerary;
  }
  
  // If it's a direct array of ItineraryItem (returned from generateItinerary)
  if (Array.isArray(itinerary) && itinerary.length > 0 && itinerary[0].day !== undefined) {
    debug.log('✅ transformItinerary: Converting from array of ItineraryItem format');
    const activities = itinerary;
    debug.log(`📊 Found ${activities.length} activities`);
    
    const daysMap = new Map<number, any[]>();
    
    // Group activities by day
    activities.forEach((activity: any) => {
      const day = activity.day || 1;
      if (!daysMap.has(day)) {
        daysMap.set(day, []);
      }
      daysMap.get(day)!.push(activity);
    });
    
    debug.log(`📊 Grouped into ${daysMap.size} days`);
    
    // Convert to days array
    const days = Array.from({ length: daysMap.size }, (_, index) => {
      const dayNum = index + 1;
      const dayActivities = daysMap.get(dayNum) || [];
      
      return {
        title: `Dia ${dayNum}`,
        attractions: dayActivities.map((activity: any) => {
          const coords = normalizeAttractionCoordinates(activity);
          
          const transformed = {
            name: activity.name,
            description: activity.reason,
            time: activity.time,
            emoji: '📍',
            duration: activity.duration,
            category: activity.category,
            location: coords.location,
            lat: coords.lat,
            lng: coords.lng,
          };
          
          return transformed;
        }),
      };
    });
    
    const result = {
      days,
      tips: [],
      destination: undefined,
    };
    
    debug.log('✅ transformItinerary result:', result);
    return result;
  }
  
  // If it's the Gemini format: { itinerary: [...], tips: [...] }
  if (itinerary.itinerary && Array.isArray(itinerary.itinerary)) {
    debug.log('✅ transformItinerary: Converting from Gemini format');
    const activities = itinerary.itinerary;
    debug.log(`📊 Found ${activities.length} activities`);
    
    const daysMap = new Map<number, any[]>();
    
    // Group activities by day
    activities.forEach((activity: any) => {
      const day = activity.day || 1;
      if (!daysMap.has(day)) {
        daysMap.set(day, []);
      }
      daysMap.get(day)!.push(activity);
    });
    
    debug.log(`📊 Grouped into ${daysMap.size} days`);
    
    // Convert to days array
    const days = Array.from({ length: daysMap.size }, (_, index) => {
      const dayNum = index + 1;
      const dayActivities = daysMap.get(dayNum) || [];
      
      return {
        title: `Dia ${dayNum}`,
        attractions: dayActivities.map((activity: any) => {
          const coords = normalizeAttractionCoordinates(activity);
          
          const transformed = {
            name: activity.name,
            description: activity.reason,
            time: activity.time,
            emoji: '📍',
            duration: activity.duration,
            category: activity.category,
            location: coords.location,
            lat: coords.lat,
            lng: coords.lng,
          };
          
          return transformed;
        }),
      };
    });
    
    const result = {
      days,
      tips: itinerary.tips || [],
      destination: itinerary.destination,
    };
    
    debug.log('✅ transformItinerary result:', result);
    return result;
  }
  
  debug.warn('⚠️ transformItinerary: Unknown format', itinerary);
  return itinerary;
};

/**
 * TripDetailScreen - Detalhes da viagem e itinerário
 * 
 * Fluxo:
 * 1. Carregar dados da viagem pelo ID
 * 2. Exibir informações gerais
 * 3. Mostrar itinerário por dia
 * 4. Botão para editar/deletar
 * 5. Opção para visualizar no mapa
 */
export default function TripDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useI18n();
  const { user } = useAuth();
  const { trips, loadTrips, isLoading: isStoreLoading } = useTripsStore();
  const [isLoadingScreen, setIsLoadingScreen] = useState(true);
  const [_selectedAttractionIndex, setSelectedAttractionIndex] = useState<number>(0);
  const [attractionImages, setAttractionImages] = useState<Map<string, string>>(new Map());
  const [hasTriedLoadingTrips, setHasTriedLoadingTrips] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([0, 0]);

  const trip = id ? trips.find((t) => t.id === id) : null;

  debug.log('🔍 TripDetailScreen - Trip:', trip);
  debug.log('🔍 TripDetailScreen - Raw itinerary:', trip?.itinerary);
  debug.log('🔍 TripDetailScreen - isStoreLoading:', isStoreLoading, 'hasTriedLoadingTrips:', hasTriedLoadingTrips);
  debug.log('🔍 TripDetailScreen - Available trips in store:', trips.length, 'Trip IDs:', trips.map(t => t.id).join(', '));
  debug.log('🔍 TripDetailScreen - Looking for ID:', id, 'Found:', !!trip);

  // Load trips from Firestore if trip not found locally (only once)
  useEffect(() => {
    debug.log('🔄 useEffect running - checking if we need to load trips', { 
      tripExists: !!trip,
      id,
      userId: user?.uid,
      hasTriedLoadingTrips,
      shouldLoad: !trip && id && user?.uid && !hasTriedLoadingTrips
    });
    
    if (!trip && id && user?.uid && !hasTriedLoadingTrips) {
      debug.log('🔄 Trip not found locally, loading from Firestore...', { id, userId: user.uid, tripsCount: trips.length });
      setHasTriedLoadingTrips(true);
      loadTrips(user.uid).then(() => {
        debug.log('✅ Trips loaded from Firestore');
        // After loading, trips should be updated in the store
        // The component will re-render when Zustand state changes
      }).catch((error) => {
        debug.error('❌ Error loading trips:', error);
      });
    }
  }, [id, user?.uid, hasTriedLoadingTrips]);

  useEffect(() => {
    let isMounted = true;

    const resolveMapCenter = async () => {
      if (!trip?.destination) {
        setMapCenter([0, 0]);
        return;
      }

      try {
        const locale = language?.startsWith('pt') ? 'pt' : language?.startsWith('es') ? 'es' : 'en';
        const suggestions = await searchCities(trip.destination, locale);
        const best = suggestions.find((item) => {
          const coords = item.coordinates;
          return Array.isArray(coords) && coords.length === 2 && Number.isFinite(coords[0]) && Number.isFinite(coords[1]);
        });

        if (isMounted && best?.coordinates) {
          setMapCenter(best.coordinates);
        }
      } catch (error) {
        debug.warn('⚠️ TripDetailScreen: failed to resolve destination center', error);
      }
    };

    resolveMapCenter();

    return () => {
      isMounted = false;
    };
  }, [trip?.destination, language]);

  // This effect runs whenever trips changes to check if we found our trip
  useEffect(() => {
    if (id && trips.length > 0) {
      debug.log('🔍 DETAILED TRIP LOOKUP:', {
        searchingForId: id,
        searchingForIdType: typeof id,
        searchingForIdLength: id?.length,
        tripsCount: trips.length,
        allTrips: trips.map(t => ({
          id: t.id,
          idType: typeof t.id,
          idLength: t.id?.length,
          destination: t.destination,
          match: t.id === id,
        })),
      });

      const foundTrip = trips.find((t) => t.id === id);
      debug.log('🔄 Trips updated, looking for trip:', { id, tripsCount: trips.length, found: !!foundTrip, tripIds: trips.map(t => t.id).join(', ') });
      if (foundTrip) {
        debug.log('✅ Trip found after loading from Firestore!', { id, destination: foundTrip.destination });
      } else {
        debug.error('❌ Trip still not found after loading. This is a data mismatch issue.', { id, tripsCount: trips.length });
      }
    }
  }, [trips, id]);

  // Carregar imagens das atrações
  useEffect(() => {
    debug.log('🖼️ [useEffect] Iniciando carregamento de imagens...');
    debug.log('🖼️ trip:', trip?.id, 'itinerary:', !!trip?.itinerary);
    
    if (!trip?.itinerary) {
      debug.log('⚠️ Sem itinerary para carregar imagens');
      return;
    }

    let itinerary = trip.itinerary;
    
    // Se for string, fazer parse
    if (typeof itinerary === 'string') {
      try {
        itinerary = JSON.parse(itinerary);
      } catch (error) {
        debug.error('❌ Erro ao fazer parse do itinerary:', error);
        return;
      }
    }
    
    // Transformar se necessário
    itinerary = transformItinerary(itinerary);

    if (!itinerary?.days || itinerary.days.length === 0) {
      debug.log('⚠️ Itinerary sem dias');
      return;
    }

    debug.log(`🖼️ Processando ${itinerary.days.length} dias...`);

    // Carregar imagens de forma assíncrona
    const loadImages = async () => {
      const imageMap = new Map<string, string>();

      for (const day of itinerary.days) {
        if (!day.attractions || day.attractions.length === 0) {
          debug.log(`🖼️ Dia sem atrações`);
          continue;
        }
        
        debug.log(`🖼️ Dia com ${day.attractions.length} atrações`);
        
        for (const attraction of day.attractions) {
          const cacheKey = attraction.name.toLowerCase();
          
          // Se já tem em cache, pular
          if (imageMap.has(cacheKey)) {
            debug.log(`  ♻️ Já em cache: ${attraction.name}`);
            continue;
          }
          
          try {
            const photoSource = await PhotoService.generatePhotoUrl(attraction.name, {
              destination: trip.destination,
              category: mapCategoryForPhotoContext(attraction),
              reason: attraction.description,
              time: attraction.time,
              language,
            });
            imageMap.set(cacheKey, photoSource.url);
            debug.log(`  ✅ URL obtida para: ${attraction.name}`);
          } catch (error) {
            debug.warn(`  ❌ Erro ao obter imagem para: ${attraction.name}`, error);
          }
        }
      }

      debug.log(`🖼️ ✅ TOTAL: ${imageMap.size} imagens carregadas`);
      setAttractionImages(new Map(imageMap)); // Force update
    };

    loadImages();
  }, [trip?.id, trip?.itinerary, trip?.destination, language]);

  useEffect(() => {
    // Simular carregamento
    const timer = setTimeout(() => {
      setIsLoadingScreen(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  if (isLoadingScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show loading while trying to fetch trips from Firestore
  if (!trip && hasTriedLoadingTrips && isStoreLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 text-primary dark:text-primary hover:opacity-80 mb-4 font-medium transition-opacity"
            aria-label={t('tripDetail.backToTrips')}
          >
            <ArrowLeft className="w-4 h-4" />
            {t('tripDetail.backButton')}
          </button>

          <Card>
            <Card.Body className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-h3 font-semibold text-slate-900 dark:text-white mb-2">
                {t('tripDetail.tripNotFound')}
              </h2>
              <p className="text-body text-slate-600 dark:text-slate-300 mb-6">
                {t('tripDetail.tripDeletedDescription')}
              </p>
              <Button onClick={() => navigate('/home')}>
                {t('tripDetail.backToTrips')}
              </Button>
            </Card.Body>
          </Card>
        </div>
      </div>
    );
  }

  const daysCount = Math.ceil(
    (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  // Parse itinerary se for string JSON
  let rawItinerary =
    typeof trip.itinerary === 'string'
      ? JSON.parse(trip.itinerary)
      : trip.itinerary;

  debug.log('🔍 rawItinerary after parse:', rawItinerary);

  // Transform itinerary to the correct format
  const itinerary = transformItinerary(rawItinerary);
  
  debug.log('🔍 final itinerary after transform:', itinerary);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 pb-20 overflow-x-hidden">
      {/* Mobile Header - Hidden on Desktop */}
      <header className="lg:hidden bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate('/home')}
            type="button"
            className="flex items-center gap-2 text-primary dark:text-primary hover:opacity-80 mb-4 font-medium transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900 rounded"
            aria-label={t('tripDetail.backToTrips')}
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            {t('tripDetail.backButton')}
          </button>

          <h1 className="text-h1 font-bold mb-2 text-slate-900 dark:text-white">{trip.destination}</h1>
          <p className="text-body text-slate-600 dark:text-slate-300 mb-6">{trip.country}</p>

          {/* Action buttons - Share, Export, Favorite */}
          <div className="flex gap-2 sm:gap-3 mb-6 flex-wrap items-center">
            <ShareButton trip={trip} variant="filled" />
            <ExportButton trip={trip} variant="filled" />
            <FavoriteButton tripId={trip.id} variant="filled" />
          </div>

          {/* Quick info */}
          <div className="grid grid-cols-3 gap-4 mt-8" role="region" aria-label={t('tripDetail.quickInfo')}>
            <div>
              <p className="text-small text-slate-600 dark:text-slate-300 mb-1">{t('tripDetail.date')}</p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {t('tripDetail.days', { count: daysCount })}
              </p>
            </div>
            <div>
              <p className="text-small text-slate-600 dark:text-slate-300 mb-1">{t('tripDetail.budget')}</p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {getBudgetLabel(trip.budgetPerDay || trip.budget)}
              </p>
            </div>
            <div>
              <p className="text-small text-slate-600 dark:text-slate-300 mb-1">{t('tripDetail.interests')}</p>
              <p className="font-semibold text-slate-900 dark:text-white">{trip.interests?.length || 0}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:block bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">{trip.destination}</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">{trip.country}</p>

          {/* Action buttons - Share, Export, Favorite */}
          <div className="flex gap-2 sm:gap-3 mb-6 flex-wrap items-center">
            <ShareButton trip={trip} variant="filled" />
            <ExportButton trip={trip} variant="filled" />
            <FavoriteButton tripId={trip.id} variant="filled" />
          </div>

          {/* Quick info */}
          <div className="grid grid-cols-4 gap-4 mt-8" role="region" aria-label={t('tripDetail.quickInfo')}>
            <div>
              <p className="text-small text-slate-600 dark:text-slate-300 mb-1">{t('tripDetail.date')}</p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {t('tripDetail.days', { count: daysCount })}
              </p>
            </div>
            <div>
              <p className="text-small text-slate-600 dark:text-slate-300 mb-1">{t('tripDetail.budget')}</p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {getBudgetLabel(trip.budgetPerDay || trip.budget)}
              </p>
            </div>
            <div>
              <p className="text-small text-slate-600 dark:text-slate-300 mb-1">{t('tripDetail.interests')}</p>
              <p className="font-semibold text-slate-900 dark:text-white">{trip.interests?.length || 0}</p>
            </div>
            <div>
              <p className="text-small text-slate-600 dark:text-slate-300 mb-1">{t('tripDetail.period')}</p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {new Date(trip.startDate).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })} - {new Date(trip.endDate).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        {/* Trip Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Dates */}
          <Card elevation="lg">
            <Card.Body>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary dark:text-primary flex-shrink-0 mt-1" aria-hidden="true" />
                <div>
                  <p className="text-small text-slate-600 dark:text-slate-300 mb-1">
                    {t('tripDetail.tripDate')}
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {formatDate(trip.startDate)} até{' '}
                    {formatDate(trip.endDate)}
                  </p>
                  <p className="text-small text-slate-500 dark:text-slate-300 mt-1">
                    {t('tripDetail.daysOfAdventure', { count: daysCount })}
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Interests */}
          <Card elevation="lg">
            <Card.Body>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-primary dark:text-primary flex-shrink-0 mt-1" aria-hidden="true" />
                <div className="w-full">
                  <p className="text-small text-slate-600 dark:text-slate-300 mb-2">
                    {t('tripDetail.yourInterests')}
                  </p>
                  <div className="flex flex-wrap gap-2" role="list" aria-label={t('tripDetail.interestsList', { count: trip.interests?.length || 0 })}>
                    {trip.interests?.map((interest) => (
                      <span key={interest} role="listitem">
                        <Badge variant="primary">
                          {interest}
                        </Badge>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Map */}
        <Card elevation="lg" className="mb-8">
          <Card.Header>
            <h2 className="text-h2 font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapIcon className="w-6 h-6 text-primary dark:text-primary" />
              {t('tripDetail.tripMap')}
            </h2>
          </Card.Header>
          <Card.Body className="p-0">
            {itinerary && itinerary.days && itinerary.days.length > 0 ? (
              <>
                {(() => {
                  debug.log('\n🗺️ MAP DEBUG - Input itinerary.days[0]:', itinerary.days[0]);
                  debug.log('🗺️ MAP DEBUG - Input itinerary.days[0].attractions[0]:', itinerary.days[0]?.attractions?.[0]);
                  
                  const attractions = itinerary.days.flatMap((day: any) => {
                    return (day.attractions || []).map((attr: any) => {
                      debug.log('🗺️ MAP DEBUG - Raw attr object:', attr);
                      debug.log('  Keys:', Object.keys(attr));
                      debug.log('  lat value:', attr.lat, 'type:', typeof attr.lat);
                      debug.log('  lng value:', attr.lng, 'type:', typeof attr.lng);
                      
                      return {
                        name: attr.name,
                        reason: attr.description,
                        lat: attr.lat,
                        lng: attr.lng,
                      };
                    });
                  });
                  
                  debug.log('🗺️ MAP DEBUG - Final mapped attractions[0]:', attractions[0]);
                  return null;
                })()}
                <MapboxMap
                  center={mapCenter}
                  attractions={itinerary.days.flatMap((day: any) => 
                    (day.attractions || []).map((attr: any) => {
                      const coords = normalizeAttractionCoordinates(attr);

                      return {
                        name: attr.name,
                        reason: attr.description,
                        location: coords.location,
                        lat: coords.lat,
                        lng: coords.lng,
                      };
                    })
                  )}
                  onAttractionSelect={(attraction, index) => {
                    setSelectedAttractionIndex(index);
                    debug.log('🗺️ Atração selecionada no mapa:', attraction, 'índice:', index);
                  }}
                />
              </>
            ) : (
              <div className="p-8 text-center text-slate-500">
                <p>{t('tripDetail.mapNotAvailable')}</p>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Itinerary */}
        <Card elevation="lg" className="mb-8">
          <Card.Header>
            <h2 className="text-h2 font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapIcon className="w-6 h-6 text-primary dark:text-primary" aria-hidden="true" />
              {t('tripDetail.itinerary')}
            </h2>
          </Card.Header>

          <Card.Body>
            {itinerary && itinerary.days && itinerary.days.length > 0 ? (
              <div role="list" aria-label={t('tripDetail.itineraryDays', { count: itinerary.days.length })} className="space-y-6">
                {itinerary.days.map(
                  (day: any, index: number) => (
                    <div
                      key={index}
                      role="listitem"
                      className="pb-6 border-b border-slate-200 dark:border-slate-700 last:border-b-0 last:pb-0"
                    >
                      {/* Day header */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary dark:bg-primary flex items-center justify-center text-white font-bold" aria-hidden="true">
                              {index + 1}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 dark:text-white text-h3">
                                <span className="sr-only">{t('tripDetail.dayHeader', { day: index + 1 })} </span>
                                {day.title || `Dia ${index + 1}`}
                              </h3>
                              {day.date && (
                                <p className="text-small text-slate-500 dark:text-slate-300">
                                  {day.date}
                                </p>
                              )}
                            </div>
                          </div>
                          {/* Button to view day details */}
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate(`/trip/${trip.id}/day/${index + 1}`)}
                            className="whitespace-nowrap"
                            aria-label={t('tripDetail.viewDayDetails', { day: index + 1 })}
                          >
                            {t('tripDetail.viewFull')}
                          </Button>
                        </div>

                        {day.description && (
                          <p className="text-body text-slate-600 dark:text-slate-300 ml-13">
                            {day.description}
                          </p>
                        )}
                      </div>

                      {/* Attractions */}
                      {day.attractions && day.attractions.length > 0 && (
                        <div className="space-y-3 ml-4">
                          {/* Attractions Grid Preview */}
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                            {day.attractions.slice(0, 3).map((attraction: any, attrIndex: number) => {
                              // Obter URL do mapa de cache carregado
                              const cachedImageUrl = attractionImages.get(attraction.name.toLowerCase());
                              
                              const imageUrl = cachedImageUrl || buildCardFallbackImage(attraction.name);
                              
                              return (
                                <div
                                  key={attrIndex}
                                  className="relative rounded-lg overflow-hidden h-32 bg-slate-100 dark:bg-slate-700 hover:shadow-md transition-shadow group cursor-pointer"
                                  onClick={() => navigate(`/trip/${trip.id}/day/${index + 1}`)}
                                >
                                  {/* Image */}
                                  <img
                                    src={imageUrl}
                                    alt={attraction.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onLoad={() => {
                                      debug.log(`✅ Imagem carregada: ${attraction.name}`);
                                    }}
                                    onError={(e) => {
                                      debug.warn(`❌ Erro ao carregar: ${attraction.name}`);
                                      (e.target as HTMLImageElement).src = buildCardFallbackImage(attraction.name);
                                    }}
                                  />
                                  
                                  {/* Overlay gradient */}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                                    <div className="w-full">
                                      <p className="text-xs font-medium text-white line-clamp-2">
                                        {attraction.name}
                                      </p>
                                      <p className="text-caption text-white/80">
                                        ⏱️ {attraction.time}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                            {day.attractions.length > 3 && (
                              <div className="rounded-lg overflow-hidden h-32 bg-slate-100 dark:bg-slate-700 flex items-center justify-center group cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => navigate(`/trip/${trip.id}/day/${index + 1}`)}>
                                <div className="text-center">
                                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                                    +{day.attractions.length - 3}
                                  </p>
                                  <p className="text-caption text-slate-500 dark:text-slate-300">
                                    mais atrações
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Attractions List */}
                          {day.attractions.map(
                            (
                              attraction: any,
                              attrIndex: number
                            ) => (
                              <div
                                key={attrIndex}
                                className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
                              >
                                <div className="flex-shrink-0 text-xl" aria-hidden="true">
                                  {attraction.emoji || '📍'}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-slate-900 dark:text-white">
                                    {attraction.name}
                                  </p>
                                  {attraction.description && (
                                    <p className="text-small text-slate-600 dark:text-slate-300 mt-1">
                                      {attraction.description}
                                    </p>
                                  )}
                                  {attraction.time && (
                                    <p className="text-caption text-slate-500 dark:text-slate-300 mt-1">
                                      ⏱️ {attraction.time}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )}

                      {/* Meals */}
                      {day.meals && (
                        <div className="mt-4 space-y-2 ml-4">
                          {day.meals.breakfast && (
                            <p className="text-small text-slate-600 dark:text-slate-300">
                              🍳 <strong>Café:</strong> {day.meals.breakfast}
                            </p>
                          )}
                          {day.meals.lunch && (
                            <p className="text-small text-slate-600 dark:text-slate-300">
                              🍝 <strong>Almoço:</strong> {day.meals.lunch}
                            </p>
                          )}
                          {day.meals.dinner && (
                            <p className="text-small text-slate-600 dark:text-slate-300">
                              🍽️ <strong>Jantar:</strong> {day.meals.dinner}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" aria-hidden="true" />
                <p className="text-slate-600 dark:text-slate-300">
                  {t('tripDetail.itineraryNotGenerated')}
                </p>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Additional Info */}
        {trip.description && (
          <Card elevation="lg">
            <Card.Header>
              <h3 className="text-h3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary dark:text-primary" />
                {t('tripDetail.additionalInfo')}
              </h3>
            </Card.Header>

            <Card.Body>
              <p className="text-body text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {trip.description}
              </p>
            </Card.Body>
          </Card>
        )}
      </main>
      </div>
    </MainLayout>
  );
}
