import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTripsStore } from '../store/tripsStore';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { MapboxMap } from '../components/MapboxMap';
import {
  ArrowLeft,
  Calendar,
  Users,
  MapIcon,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { formatDate } from '../utils/formatDate';

/**
 * Gera URL de imagem do Unsplash baseado no nome da atração
 */
const getAttractionImage = (attractionName: string, index: number): string => {
  const queries: { [key: string]: string } = {
    colosseum: 'colosseum rome',
    'roman forum': 'roman forum',
    'palatine hill': 'palatine hill',
    monti: 'rome monti neighborhood',
    lunch: 'italian food rome',
    restaurante: 'restaurant rome',
    museu: 'museum',
    natureza: 'nature landscape',
    compra: 'shopping city',
  };

  let query = 'attraction landmark';
  const lowerName = attractionName.toLowerCase();
  
  for (const [key, value] of Object.entries(queries)) {
    if (lowerName.includes(key)) {
      query = value;
      break;
    }
  }

  // Usar Unsplash random com query
  const randomParam = Math.floor(Math.random() * 100) + index;
  return `https://source.unsplash.com/400x300/?${encodeURIComponent(query)}&sig=${randomParam}`;
};

/**
 * Transform Gemini itinerary format (array of activities with day property)
 * to display format (array of days with activities)
 */
const transformItinerary = (itinerary: any) => {
  console.log('📍 transformItinerary input:', itinerary);
  
  if (!itinerary) {
    console.warn('⚠️ transformItinerary: itinerary is null/undefined');
    return null;
  }
  
  // If it's already in the correct format
  if (itinerary.days && Array.isArray(itinerary.days)) {
    console.log('✅ transformItinerary: Already in correct format (has days array)');
    return itinerary;
  }
  
  // If it's the Gemini format: { itinerary: [...], tips: [...] }
  if (itinerary.itinerary && Array.isArray(itinerary.itinerary)) {
    console.log('✅ transformItinerary: Converting from Gemini format');
    const activities = itinerary.itinerary;
    console.log(`📊 Found ${activities.length} activities`);
    
    // Debug: Show first activity raw data
    console.log('🔍 First raw activity from Gemini:', activities[0]);
    
    const daysMap = new Map<number, any[]>();
    
    // Group activities by day
    activities.forEach((activity: any) => {
      const day = activity.day || 1;
      if (!daysMap.has(day)) {
        daysMap.set(day, []);
      }
      daysMap.get(day)!.push(activity);
    });
    
    console.log(`📊 Grouped into ${daysMap.size} days`);
    
    // Convert to days array
    const days = Array.from({ length: daysMap.size }, (_, index) => {
      const dayNum = index + 1;
      const dayActivities = daysMap.get(dayNum) || [];
      
      return {
        title: `Dia ${dayNum}`,
        attractions: dayActivities.map((activity: any) => {
          // Extract lat/lng from either direct properties or location object
          const lat = activity.lat || activity.location?.lat;
          const lng = activity.lng || activity.location?.lng;
          
          const transformed = {
            name: activity.name,
            description: activity.reason,
            time: activity.time,
            emoji: '📍',
            duration: activity.duration,
            category: activity.category,
            location: activity.location,
            lat: lat,
            lng: lng,
          };
          
          // Debug first attraction of first day
          if (dayNum === 1 && dayActivities[0] === activity) {
            console.log('🔍 First transformed attraction (Day 1):', transformed);
            console.log('  - activity.lat:', activity.lat, 'activity.location?.lat:', activity.location?.lat);
            console.log('  - Resolved lat:', lat, 'lng:', lng);
          }
          
          return transformed;
        }),
      };
    });
    
    const result = {
      days,
      tips: itinerary.tips || [],
      destination: itinerary.destination,
    };
    
    console.log('✅ transformItinerary result:', result);
    console.log('✅ First day attractions after transform:', result.days[0]?.attractions);
    return result;
  }
  
  console.warn('⚠️ transformItinerary: Unknown format', itinerary);
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
  const { trips } = useTripsStore();
  const [isLoadingScreen, setIsLoadingScreen] = useState(true);
  const [_selectedAttractionIndex, setSelectedAttractionIndex] = useState<number>(0);

  const trip = id ? trips.find((t) => t.id === id) : null;

  console.log('🔍 TripDetailScreen - Trip:', trip);
  console.log('🔍 TripDetailScreen - Raw itinerary:', trip?.itinerary);

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

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 text-primary dark:text-primary hover:opacity-80 mb-4 font-medium transition-opacity"
            aria-label="Voltar para viagens"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>

          <Card>
            <Card.Body className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-h3 font-semibold text-slate-900 dark:text-white mb-2">
                Viagem não encontrada
              </h2>
              <p className="text-body text-slate-600 dark:text-slate-400 mb-6">
                Esta viagem pode ter sido deletada
              </p>
              <Button onClick={() => navigate('/home')}>
                Voltar para Minhas Viagens
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

  console.log('🔍 rawItinerary after parse:', rawItinerary);

  // Transform itinerary to the correct format
  const itinerary = transformItinerary(rawItinerary);
  
  console.log('🔍 final itinerary after transform:', itinerary);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 pb-12">
      {/* Header com fundo gradiente */}
      <header className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate('/home')}
            type="button"
            className="flex items-center gap-2 text-primary dark:text-primary hover:opacity-80 mb-4 font-medium transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900 rounded"
            aria-label="Voltar para a lista de viagens"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Voltar
          </button>

          <h1 className="text-h1 font-bold mb-2 text-slate-900 dark:text-white">{trip.destination}</h1>
          <p className="text-body text-slate-600 dark:text-slate-400 mb-6">{trip.country}</p>

          {/* Quick info */}
          <div className="grid grid-cols-3 gap-4 mt-8" role="region" aria-label="Informações rápidas da viagem">
            <div>
              <p className="text-small text-slate-600 dark:text-slate-400 mb-1">Data</p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {daysCount} dias
              </p>
            </div>
            <div>
              <p className="text-small text-slate-600 dark:text-slate-400 mb-1">Orçamento</p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {trip.budget === 'econômico'
                  ? '💰 Econômico'
                  : trip.budget === 'médio'
                    ? '💳 Médio'
                    : '💎 Luxo'}
              </p>
            </div>
            <div>
              <p className="text-small text-slate-600 dark:text-slate-400 mb-1">Interesses</p>
              <p className="font-semibold text-slate-900 dark:text-white">{trip.interests?.length || 0}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Trip Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Dates */}
          <Card elevation="lg">
            <Card.Body>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary dark:text-primary flex-shrink-0 mt-1" aria-hidden="true" />
                <div>
                  <p className="text-small text-slate-600 dark:text-slate-400 mb-1">
                    Data da viagem
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {formatDate(trip.startDate)} até{' '}
                    {formatDate(trip.endDate)}
                  </p>
                  <p className="text-small text-slate-500 dark:text-slate-400 mt-1">
                    {daysCount} dias de aventura
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
                  <p className="text-small text-slate-600 dark:text-slate-400 mb-2">
                    Seus interesses
                  </p>
                  <div className="flex flex-wrap gap-2" role="list" aria-label={`Lista de ${trip.interests?.length || 0} interesse(s)`}>
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
              Mapa da Viagem
            </h2>
          </Card.Header>
          <Card.Body className="p-0">
            {itinerary && itinerary.days && itinerary.days.length > 0 ? (
              <>
                {(() => {
                  console.log('\n🗺️ MAP DEBUG - Input itinerary.days[0]:', itinerary.days[0]);
                  console.log('🗺️ MAP DEBUG - Input itinerary.days[0].attractions[0]:', itinerary.days[0]?.attractions?.[0]);
                  
                  const attractions = itinerary.days.flatMap((day: any) => {
                    return (day.attractions || []).map((attr: any) => {
                      console.log('🗺️ MAP DEBUG - Raw attr object:', attr);
                      console.log('  Keys:', Object.keys(attr));
                      console.log('  lat value:', attr.lat, 'type:', typeof attr.lat);
                      console.log('  lng value:', attr.lng, 'type:', typeof attr.lng);
                      
                      return {
                        name: attr.name,
                        reason: attr.description,
                        lat: attr.lat,
                        lng: attr.lng,
                      };
                    });
                  });
                  
                  console.log('🗺️ MAP DEBUG - Final mapped attractions[0]:', attractions[0]);
                  return null;
                })()}
                <MapboxMap
                  attractions={itinerary.days.flatMap((day: any) => 
                    (day.attractions || []).map((attr: any) => ({
                      name: attr.name,
                      reason: attr.description,
                      lat: attr.lat !== undefined ? attr.lat : attr.location?.lat,
                      lng: attr.lng !== undefined ? attr.lng : attr.location?.lng,
                    }))
                  )}
                  height="400px"
                  onAttractionSelect={(attraction, index) => {
                    setSelectedAttractionIndex(index);
                    console.log('🗺️ Atração selecionada no mapa:', attraction, 'índice:', index);
                  }}
                />
              </>
            ) : (
              <div className="p-8 text-center text-slate-500">
                <p>Mapa não disponível para este itinerário</p>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Itinerary */}
        <Card elevation="lg" className="mb-8">
          <Card.Header>
            <h2 className="text-h2 font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapIcon className="w-6 h-6 text-primary dark:text-primary" aria-hidden="true" />
              Seu Itinerário
            </h2>
          </Card.Header>

          <Card.Body>
            {itinerary && itinerary.days && itinerary.days.length > 0 ? (
              <div role="list" aria-label={`Itinerário de ${itinerary.days.length} dia(s)`} className="space-y-6">
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
                                <span className="sr-only">Dia {index + 1}: </span>
                                {day.title || `Dia ${index + 1}`}
                              </h3>
                              {day.date && (
                                <p className="text-small text-slate-500 dark:text-slate-400">
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
                            aria-label={`Ver detalhes do dia ${index + 1}`}
                          >
                            Ver completo
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
                            {day.attractions.slice(0, 3).map((attraction: any, attrIndex: number) => (
                              <div
                                key={attrIndex}
                                className="relative rounded-lg overflow-hidden h-32 bg-slate-100 dark:bg-slate-700 hover:shadow-md transition-shadow group cursor-pointer"
                                onClick={() => navigate(`/trip/${trip.id}/day/${index + 1}`)}
                              >
                                {/* Image with fallback */}
                                <img
                                  src={getAttractionImage(attraction.name, attrIndex)}
                                  alt={attraction.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    // Fallback se a imagem falhar
                                    (e.target as HTMLImageElement).style.display = 'none';
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
                            ))}
                            {day.attractions.length > 3 && (
                              <div className="rounded-lg overflow-hidden h-32 bg-slate-100 dark:bg-slate-700 flex items-center justify-center group cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => navigate(`/trip/${trip.id}/day/${index + 1}`)}>
                                <div className="text-center">
                                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                                    +{day.attractions.length - 3}
                                  </p>
                                  <p className="text-caption text-slate-500 dark:text-slate-400">
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
                                    <p className="text-small text-slate-600 dark:text-slate-400 mt-1">
                                      {attraction.description}
                                    </p>
                                  )}
                                  {attraction.time && (
                                    <p className="text-caption text-slate-500 dark:text-slate-500 mt-1">
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
                <p className="text-slate-600 dark:text-slate-400">
                  Itinerário ainda não foi gerado
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
                Informações Adicionais
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
  );
}
