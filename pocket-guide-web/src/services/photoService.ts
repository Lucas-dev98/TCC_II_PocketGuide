import { debug } from '@/utils/debug';
import { retryService } from './retryService';

export interface PhotoSource {
  url: string;
  source: 'unsplash' | 'pexels' | 'fallback';
  width: number;
  height: number;
  // Attribution metadata for Unsplash compliance
  photographer?: string;
  photographerUrl?: string;
  unsplashLink?: string;
  photoId?: string;
  downloadLocation?: string;
}

interface UnsplashImage {
  urls: {
    regular: string;
  };
  user: {
    name: string;
    username?: string;
    links?: {
      html?: string;
    };
  };
  links?: {
    download_location?: string;
  };
  id?: string;
}

interface UnsplashResponse {
  results: UnsplashImage[];
  total: number;
}

const ATTRACTION_SEARCH_QUERIES: { [key: string]: string } = {
  // ========== ROME LANDMARKS ==========
  'colosseum': 'colosseum rome ancient architecture history',
  'colosseo': 'colosseum rome ancient architecture history',
  'coliseu': 'colosseum rome ancient architecture history',
  'roman forum': 'roman forum rome archaeological ruins',
  'foro romano': 'roman forum rome archaeological ruins',
  'palatine hill': 'palatine hill rome ancient ruins',
  'monte palatino': 'palatine hill rome ancient ruins',
  'monti': 'monti neighborhood rome charming street',
  'trevi fountain': 'trevi fountain rome baroque water',
  'fontana di trevi': 'trevi fountain rome baroque water',
  'vatican': 'vatican city basilica museum art',
  'vatican city': 'vatican city basilica museum',
  'basilica di san pietro': 'st peter basilica vatican dome',
  'st peter': 'st peter basilica vatican dome',
  'pantheon': 'pantheon rome dome architecture ancient',
  'cappella sistina': 'sistine chapel vatican ceiling paintings',
  'sistine chapel': 'sistine chapel vatican ceiling',
  'spanish steps': 'spanish steps rome fountain square',
  'castel sant angelo': 'castel sant angelo rome river bridge',
  'trastevere': 'trastevere rome neighborhood charming',
  'colonna di marco aurelio': 'column marcus aurelius rome',
  'campo de fiori': 'campo de fiori rome square market',
  'piazza venezia': 'piazza venezia rome monument',

  // ========== EUROPEAN LANDMARKS ==========
  'eiffel tower': 'eiffel tower paris romantic view evening',
  'eiffel': 'eiffel tower paris monument',
  'notre dame': 'notre dame cathedral paris gothic architecture',
  'big ben': 'big ben clock tower london gothic',
  'tower bridge': 'tower bridge london architecture night',
  'tower of london': 'tower of london historic castle',
  'buckingham palace': 'buckingham palace london royal',
  'sagrada familia': 'sagrada familia barcelona cathedral',
  'park güell': 'park guell barcelona architecture nature',
  'alhambra': 'alhambra granada islamic architecture',
  'prado museum': 'prado museum madrid art',
  'retiro park': 'retiro park madrid urban nature',
  'brandenburg gate': 'brandenburg gate berlin history',
  'reichstag': 'reichstag berlin dome parliament',
  'amsterdam canal': 'amsterdam canal water boats historic',
  'anne frank house': 'anne frank house amsterdam historic',
  'lisbon castle': 'castle lisbon viewpoint architecture',
  'belém tower': 'belem tower lisbon historic riverside',
  'acropolis': 'acropolis athens ancient greece',
  'parthenon': 'parthenon athens ancient greek temple',
  'blue mosque': 'blue mosque istanbul ottoman dome',
  'hagia sophia': 'hagia sophia istanbul historic',
  'grand bazaar': 'grand bazaar istanbul market shops',

  // ========== BRAZILIAN LANDMARKS ==========
  'cristo redentor': 'cristo redentor rio de janeiro statue view',
  'christ the redeemer': 'christ redeemer rio de janeiro statue',
  'pão de açúcar': 'pao de acucar sugarloaf mountain rio',
  'sugarloaf mountain': 'sugarloaf mountain rio de janeiro cable car',
  'copacabana': 'copacabana beach rio de janeiro iconic',
  'ipanema': 'ipanema beach rio de janeiro sunset',
  'guanabara bay': 'guanabara bay rio de janeiro landscape',
  'maracanã': 'maracana stadium rio de janeiro',
  'iguazu falls': 'iguazu waterfalls brazil argentina nature',
  'lençóis maranhenses': 'lencois maranhenses lagoons sand',
  'pantanal': 'pantanal wetland wildlife nature brazil',
  'amazon': 'amazon rainforest jungle nature wildlife',
  'amazonas': 'amazon rainforest jungle nature wildlife',
  'salvador bahia': 'salvador bahia historic colonial',
  'recife': 'recife pernambuco historic colonial',
  'manaus': 'manaus amazon theater historic',
  'ouro preto': 'ouro preto minas gerais colonial',
  'tiradentes': 'tiradentes minas gerais historic',
  'gramado': 'gramado rio grande do sul lake nature',

  // ========== RESTAURANTS & DINING - BY CUISINE ==========
  'italian restaurant': 'italian restaurant trattoria rustic dining',
  'pizzeria': 'pizzeria pizza wood oven authentic',
  'sushi restaurant': 'sushi bar japanese authentic cuisine',
  'japanese restaurant': 'japanese restaurant traditional sushi',
  'french restaurant': 'french restaurant elegant fine dining',
  'spanish restaurant': 'spanish restaurant paella seafood',
  'portuguese restaurant': 'portuguese restaurant bacalau seafood',
  'greek restaurant': 'greek restaurant mediterranean mezze',
  'turkish restaurant': 'turkish restaurant kebab meze authentic',
  'brazilian churrascaria': 'churrascaria steakhouse brazilian',
  'brazilian restaurant': 'brazilian restaurant feijoada cuisine',
  'mexican restaurant': 'mexican restaurant tacos authentic',
  'thai restaurant': 'thai restaurant spicy noodles curry',
  'chinese restaurant': 'chinese restaurant dim sum authentic',
  'indian restaurant': 'indian restaurant curry naan',
  'lebanese restaurant': 'lebanese restaurant hummus mezze',
  'korean restaurant': 'korean restaurant bbq authentic',
  'vietnamese restaurant': 'vietnamese restaurant pho noodles',
  'argentinian restaurant': 'argentinian restaurant steak asado',
  'peruvian restaurant': 'peruvian restaurant ceviche authentic',
  'colombian restaurant': 'colombian restaurant arepas bandeja',
  'cuban restaurant': 'cuban restaurant ropa vieja plantains',
  'portuguese food': 'portuguese food bacalau sardine traditional',
  'spanish food': 'spanish food paella tapas gazpacho',
  'greek food': 'greek food feta olives mediterranean',

  // ========== RESTAURANTS & DINING - BY TIME ==========
  'café da manhã': 'breakfast cafe pastry bakery morning light',
  'breakfast': 'breakfast restaurant cafe pastry morning',
  'coffee shop': 'coffee shop espresso aesthetic morning',
  'brunch': 'brunch restaurant breakfast lunch',
  'lunch restaurant': 'lunch restaurant meal casual dining',
  'almoço': 'lunch restaurant meal casual',
  'dinner restaurant': 'dinner restaurant elegant evening dining',
  'jantar': 'dinner restaurant elegant evening',
  'fine dining': 'fine dining elegant restaurant upscale',
  'street food': 'street food market vendors local',
  'comida de rua': 'street food market local vendors',
  'food truck': 'food truck street casual meals',
  'casual dining': 'casual dining restaurant relaxed',
  'fast food': 'fast food quick service meal',
  'tapas bar': 'tapas bar restaurant spain small plates',
  'wine bar': 'wine bar vineyard tasting spain italy',
  'pub': 'pub bar restaurant cozy beer',
  'cocktail bar': 'cocktail bar mixology evening',
  'rooftop restaurant': 'rooftop restaurant city view evening',
  'beachfront restaurant': 'beachfront restaurant ocean view dining',
  'garden restaurant': 'garden restaurant outdoor nature flowers',

  // ========== MUSEUMS & GALLERIES ==========
  'art museum': 'art museum gallery paintings sculptures',
  'history museum': 'history museum exhibits artifacts',
  'science museum': 'science museum interactive technology',
  'natural history museum': 'natural history museum fossils',
  'contemporary art': 'contemporary art gallery modern',
  'modern museum': 'modern museum contemporary art',
  'modern art': 'modern art museum abstract paintings',
  'impressionist museum': 'impressionist museum monet renoir',
  'sculpture garden': 'sculpture garden outdoor art nature',
  'photography gallery': 'photography gallery exhibit',
  'design museum': 'design museum modern interior',
  'archaeology museum': 'archaeology museum ancient artifacts',
  'church museum': 'church museum religious art historic',
  'monastery': 'monastery religious historic architecture',
  'temple': 'temple religious ancient architecture',
  'cathedral': 'cathedral gothic architecture religious',
  'basilica': 'basilica religious dome architecture',
  'synagogue': 'synagogue religious jewish architecture',
  'mosque': 'mosque islamic architecture dome',
  'palace': 'palace royal architecture historic',
  'castle': 'castle medieval fortress architecture',
  'fortress': 'fortress military walls stone',

  // ========== NATURE & OUTDOOR ==========
  'hiking trail': 'hiking trail mountain nature scenic',
  'trilha': 'hiking trail mountain landscape',
  'mountain': 'mountain peak landscape altitude view',
  'montanha': 'mountain peak landscape vista',
  'waterfall': 'waterfall cascade water nature scenic',
  'cachoeira': 'waterfall cascade water nature',
  'beach': 'beach sand coast sunny vacation',
  'praia': 'beach sand coast vacation',
  'tropical beach': 'tropical beach paradise caribbean',
  'sundown beach': 'beach sunset orange sky evening',
  'black sand beach': 'black sand beach volcanic',
  'lake': 'lake water nature mountain reflection',
  'lagoa': 'lake lagoon water nature',
  'river': 'river landscape flowing water nature',
  'rio': 'river flowing water nature landscape',
  'amazon river': 'amazon river jungle landscape',
  'national park': 'national park nature wildlife',
  'parque nacional': 'national park nature wildlife',
  'forest': 'forest trees nature woodland green',
  'floresta': 'forest trees green nature',
  'rainforest': 'rainforest jungle canopy nature',
  'jungle': 'jungle dense green vegetation wildlife',
  'wetland': 'wetland nature wildlife water',
  'desert': 'desert sand dunes landscape',
  'deserto': 'desert sand dunes landscape',
  'canyon': 'canyon rock formation landscape',
  'volcano': 'volcano mountain landscape nature',
  'cavern': 'cavern cave underground rock',
  'grotto': 'grotto cave water limestone',
  'botanical garden': 'botanical garden flowers plants green',
  'jardin botanico': 'botanical garden flowers plants',
  'park nature': 'park garden outdoor trees flowers',
  'urban park': 'urban park city nature green',

  // ========== SHOPPING & MARKETS ==========
  'shopping mall': 'shopping mall stores retail modern',
  'market': 'market street vendors local colorful',
  'mercado': 'market street vendors local',
  'street market': 'street market vendors local artisan',
  'souvenir shop': 'souvenir shop local crafts tourism',
  'loja de souvenir': 'souvenir shop local crafts',
  'boutique': 'boutique fashion shop upscale',
  'vintage shop': 'vintage shop retro clothing antique',
  'antique store': 'antique store vintage furniture',
  'craft market': 'craft market artisan handmade',
  'book store': 'bookstore library books shelves',
  'bookshop': 'bookshop library books shelves',
  'flower market': 'flower market colorful flowers beautiful',
  'fish market': 'fish market fresh seafood',
  'spice market': 'spice market colorful authentic',
  'night market': 'night market street food vendor',
  'weekend market': 'weekend market local vendors',

  // ========== CULTURE & ENTERTAINMENT ==========
  'theater': 'theater cultural performance stage',
  'teatro': 'theater performance stage cultural',
  'cinema': 'cinema movie theater modern interior',
  'concert hall': 'concert hall music stage performance',
  'music venue': 'music venue live performance band',
  'opera house': 'opera house classical music architecture',
  'show': 'live show performance stage entertainment',
  'festival': 'festival cultural celebration outdoor',
  'carnival': 'carnival festival celebration colorful',
  'street art': 'street art mural urban colorful',
  'graffiti': 'street art graffiti urban',
  'mural': 'mural wall art colorful',
  'cultural center': 'cultural center exhibition venue',
  'library': 'library books architecture historic',
  'biblioteca': 'library books architecture',
  'university': 'university campus historic architecture',
  'school': 'school historic architecture building',

  // ========== LEISURE & WELLNESS ==========
  'spa': 'spa wellness massage treatment relax',
  'wellness': 'wellness spa health retreat treatment',
  'yoga': 'yoga class wellness studio meditation',
  'meditation center': 'meditation center zen peaceful',
  'hot spring': 'hot spring thermal water relax',
  'sauna': 'sauna wellness steam bath',
  'swimming pool': 'swimming pool resort vacation',
  'gym': 'gym fitness modern equipment',
  'sports center': 'sports center fitness facilities',
  'amusement park': 'amusement park rides fun family',
  'theme park': 'theme park attractions rides',
  'water park': 'water park slides pools family',
  'adventure park': 'adventure park activities outdoor',
  'golf course': 'golf course grass green landscape',
  'tennis court': 'tennis court sports facility',
  'beach resort': 'beach resort vacation ocean',
  'resort': 'resort vacation luxury accommodation',
  'boutique hotel': 'boutique hotel luxury upscale',
  'hostel': 'hostel accommodation casual backpackers',
  'airbnb': 'airbnb accommodation local home',

  // ========== NIGHTLIFE ==========
  'bar': 'bar nightlife drinks ambiance',
  'nightclub': 'nightclub night music dancing crowd',
  'club': 'nightclub dancing music night',
  'dance club': 'dance club music nightlife dancing',
  'lounge': 'lounge bar elegant drinks',
  'rooftop bar': 'rooftop bar night city view drinks',
  'beach bar': 'beach bar ocean sunset drinks',
  'irish pub': 'irish pub beer traditional cozy',
  'karaoke': 'karaoke bar singing entertainment',
  'jazz bar': 'jazz bar music live elegant',
  'casino': 'casino night entertainment luxury',

  // ========== TOP DESTINATIONS (CONTEXTUALIZED QUERIES) ==========
  '[paris] eiffel': 'eiffel tower paris romantic monument night lights',
  '[paris] notre dame': 'notre dame cathedral paris gothic architecture',
  '[paris] louvre': 'louvre museum paris art masterpiece',
  '[london] big ben': 'big ben clock tower london gothic parliament',
  '[london] tower bridge': 'tower bridge london architecture night light',
  '[london] buckingham': 'buckingham palace london royal guard',
  '[barcelona] sagrada': 'sagrada familia barcelona gaudi cathedral art',
  '[barcelona] park guell': 'park guell barcelona gaudi colorful architecture',
  '[rome] colosseum': 'colosseum rome ancient amphitheater history',
  '[rome] vatican': 'vatican city rome basilica art museum',
  '[rome] trevi': 'trevi fountain rome baroque coin water',
  '[amsterdam] canal': 'amsterdam canal water historic boat',
  '[amsterdam] anne frank': 'anne frank house amsterdam historic jewish',
  '[lisbon] castle': 'castle lisbon viewpoint historic',
  '[lisbon] belem': 'belem tower lisbon riverside historic',
  '[athens] acropolis': 'acropolis athens ancient greek monument',
  '[istanbul] blue mosque': 'blue mosque istanbul ottoman architecture',
  '[istanbul] hagia sophia': 'hagia sophia istanbul historic islamic',
  '[istanbul] grand bazaar': 'grand bazaar istanbul market shopping',
  '[rio] cristo redentor': 'cristo redentor rio de janeiro statue view',
  '[rio] copacabana': 'copacabana beach rio de janeiro iconic sunset',
  '[rio] ipanema': 'ipanema beach rio de janeiro sunset',
  '[sao paulo] teatro': 'teatro municipal sao paulo architecture',
  '[salvador] historic': 'salvador bahia historic colonial architecture',
  '[manaus] amazon theater': 'amazonian theater manaus opera historic',

  // ========== FALLBACK GENERIC SEARCHES ==========
  'restaurante': 'restaurant dining cuisine local',
  'restaurant': 'restaurant dining cuisine local authentic',
  'comida': 'food cuisine meal restaurant',
  'museu': 'museum art gallery exhibition',
  'museo': 'museum art gallery exhibition',
  'museum': 'museum art gallery exhibition educational',
  'nature': 'nature landscape outdoor scenery beautiful',
  'natureza': 'nature landscape outdoor scenery',
  'park': 'park garden outdoor nature green',
  'parque': 'park garden outdoor nature',
  'shopping': 'shopping mall stores retail',
  'compras': 'shopping stores retail mall',
  'leisure': 'leisure vacation activity relaxation',
  'travel': 'travel tourism destination adventure',
  'viagem': 'travel tourism destination adventure',
  'trip': 'travel adventure tourism vacation',
  'attraction': 'tourist attraction landmark destination scenic',
  'atração': 'tourist attraction landmark destination',
  'tour': 'guided tour sightseeing tourist experience',
  'passeio': 'guided tour sightseeing tourist',
  'walk': 'walking tour city exploration discovery',
  'caminhada': 'walking tour city exploration',
  'landmark': 'landmark monument historic architecture',
  'marco': 'landmark monument historic architecture',
  'historic': 'historic site old architecture heritage',
  'histórico': 'historic site old architecture',
};

const FALLBACK_GRADIENTS: { [key: string]: { gradient: string; emoji: string } } = {
  // Landmarks & Architecture
  'colosseum': { gradient: 'from-amber-600 to-orange-600', emoji: '🏛️' },
  'landmark': { gradient: 'from-slate-600 to-gray-700', emoji: '🗺️' },
  'cathedral': { gradient: 'from-indigo-700 to-purple-600', emoji: '⛪' },
  'mosque': { gradient: 'from-teal-600 to-cyan-600', emoji: '🕌' },
  'temple': { gradient: 'from-orange-600 to-red-700', emoji: '🏯' },
  'castle': { gradient: 'from-gray-700 to-slate-900', emoji: '🏰' },
  'palace': { gradient: 'from-yellow-500 to-orange-500', emoji: '👑' },
  
  // Food & Dining
  'restaurant': { gradient: 'from-red-600 to-rose-600', emoji: '🍽️' },
  'pizza': { gradient: 'from-orange-500 to-red-600', emoji: '🍕' },
  'sushi': { gradient: 'from-pink-500 to-red-500', emoji: '🍣' },
  'pasta': { gradient: 'from-yellow-600 to-orange-600', emoji: '🍝' },
  'café': { gradient: 'from-amber-700 to-amber-600', emoji: '☕' },
  'coffee': { gradient: 'from-amber-800 to-amber-700', emoji: '☕' },
  'brunch': { gradient: 'from-yellow-400 to-orange-300', emoji: '🥐' },
  'wine': { gradient: 'from-red-700 to-purple-700', emoji: '🍷' },
  'gelato': { gradient: 'from-pink-400 to-purple-400', emoji: '🍦' },
  'dinner': { gradient: 'from-purple-600 to-indigo-700', emoji: '🌙' },
  
  // Nature & Outdoor
  'park': { gradient: 'from-green-600 to-emerald-700', emoji: '🌳' },
  'beach': { gradient: 'from-blue-400 to-cyan-400', emoji: '🏖️' },
  'mountain': { gradient: 'from-slate-600 to-slate-700', emoji: '⛰️' },
  'hiking': { gradient: 'from-green-700 to-emerald-800', emoji: '🥾' },
  'waterfall': { gradient: 'from-blue-500 to-cyan-600', emoji: '💧' },
  'lake': { gradient: 'from-blue-500 to-teal-600', emoji: '🏞️' },
  'forest': { gradient: 'from-green-800 to-green-900', emoji: '🌲' },
  'jungle': { gradient: 'from-green-700 to-lime-700', emoji: '🦁' },
  'desert': { gradient: 'from-yellow-600 to-orange-700', emoji: '🏜️' },
  'volcano': { gradient: 'from-red-600 to-orange-700', emoji: '🌋' },
  
  // Museums & Culture
  'museum': { gradient: 'from-purple-600 to-indigo-700', emoji: '🎨' },
  'gallery': { gradient: 'from-purple-500 to-pink-600', emoji: '🖼️' },
  'theater': { gradient: 'from-red-700 to-purple-800', emoji: '🎭' },
  'cinema': { gradient: 'from-gray-800 to-black', emoji: '🎬' },
  'concert': { gradient: 'from-purple-500 to-pink-500', emoji: '🎵' },
  
  // Shopping
  'shopping': { gradient: 'from-pink-500 to-rose-600', emoji: '🛍️' },
  'market': { gradient: 'from-yellow-500 to-orange-500', emoji: '🏪' },
  'souvenir': { gradient: 'from-rose-400 to-pink-500', emoji: '🎁' },
  'boutique': { gradient: 'from-purple-400 to-pink-500', emoji: '👜' },
  
  // Leisure & Wellness
  'spa': { gradient: 'from-green-400 to-teal-500', emoji: '💆' },
  'yoga': { gradient: 'from-pink-300 to-purple-400', emoji: '🧘' },
  'wellness': { gradient: 'from-teal-400 to-green-500', emoji: '🌿' },
  'resort': { gradient: 'from-cyan-400 to-blue-500', emoji: '🏝️' },
  'amusement': { gradient: 'from-red-500 to-yellow-500', emoji: '🎡' },
  
  // Entertainment & Nightlife
  'nightlife': { gradient: 'from-purple-700 to-pink-700', emoji: '🌃' },
  'bar': { gradient: 'from-amber-800 to-orange-900', emoji: '🍹' },
  'club': { gradient: 'from-purple-800 to-black', emoji: '💃' },
  'festival': { gradient: 'from-pink-500 to-yellow-500', emoji: '🎉' },
  'carnival': { gradient: 'from-red-500 to-yellow-400', emoji: '🎊' },
  
  // Generic/Fallback
  'default': { gradient: 'from-blue-600 to-indigo-700', emoji: '📍' },
};

export class PhotoService {
  private static readonly UNSPLASH_API_KEY = import.meta.env.VITE_UNSPLASH_API_KEY || '';
  private static readonly UNSPLASH_BASE_URL = 'https://api.unsplash.com';
  private static readonly CACHE = new Map<string, PhotoSource>();
  private static downloadedPhotos = new Map<string, any>(); // Track photos with metadata

  static async generatePhotoUrl(attractionName: string): Promise<PhotoSource> {
    try {
      const cacheKey = attractionName.toLowerCase();
      if (this.CACHE.has(cacheKey)) {
        return this.CACHE.get(cacheKey)!;
      }

      if (this.UNSPLASH_API_KEY) {
        debug.log(`🔍 Buscando imagem Unsplash para: "${attractionName}"`);
        const photo = await this.fetchFromUnsplash(attractionName);
        if (photo) {
          this.CACHE.set(cacheKey, photo);
          return photo;
        }
      } else {
        debug.log(`⚠️ Sem chave Unsplash API - usando fallback para: "${attractionName}"`);
      }

      debug.log(`📸 Usando fallback gradient para: "${attractionName}"`);
      return this.getFallbackPhoto(attractionName);
    } catch (error) {
      debug.error(`❌ Erro gerando foto para "${attractionName}":`, error);
      return this.getFallbackPhoto(attractionName);
    }
  }

  /**
   * Track photo download to Unsplash API
   * Required for production-level access
   * @param photoId - Unsplash photo ID
   * @param downloadLocation - Unsplash download endpoint URL
   */
  static async trackPhotoDownload(photoId: string, downloadLocation: string): Promise<void> {
    if (!photoId || !downloadLocation) {
      debug.warn('⚠️ Photo ID or download location missing - cannot track download');
      return;
    }

    try {
      debug.log(`📊 Rastreando download de foto: ${photoId}`);
      
      const response = await retryService.fetchWithRetry(downloadLocation, {
        headers: {
          'User-Agent': 'PocketGuide/1.0',
        },
      });

      if (response.ok) {
        debug.log(`✅ Download rastreado com sucesso: ${photoId}`);
        this.downloadedPhotos.set(photoId, {
          tracked: true,
          timestamp: new Date().toISOString(),
        });
      } else {
        debug.warn(`⚠️ Falha ao rastrear download: ${response.statusText}`);
      }
    } catch (error) {
      debug.error(`❌ Erro ao rastrear download:`, error);
    }
  }

  private static async fetchFromUnsplash(attractionName: string): Promise<PhotoSource | null> {
    try {
      const query = this.getSearchQuery(attractionName);
      debug.log(`   → Query de busca: "${query}"`);

      // Buscar múltiplas imagens e selecionar a melhor (mais likes/relevante)
      const url = new URL(`${this.UNSPLASH_BASE_URL}/search/photos`);
      url.searchParams.set('query', query);
      url.searchParams.set('client_id', this.UNSPLASH_API_KEY);
      url.searchParams.set('per_page', '10'); // Buscar 10 para selecionar melhor
      url.searchParams.set('orientation', 'landscape');
      url.searchParams.set('order_by', 'relevant'); // Ordenar por relevância
      url.searchParams.set('content_filter', 'high'); // Filtro de conteúdo seguro

      const response = await retryService.fetchWithRetry(url.toString(), {
        headers: {
          'User-Agent': 'PocketGuide/1.0',
        },
      });

      if (!response.ok) {
        debug.warn(`⚠️ Resposta Unsplash: ${response.status} ${response.statusText}`);
        return null;
      }

      const data: UnsplashResponse = await response.json();

      if (data.results.length === 0) {
        debug.warn(`⚠️ Nenhuma imagem encontrada para: "${query}"`);
        return null;
      }

      // Selecionar a imagem melhor classificada (por likes e downloads)
      const bestImage = this.selectBestImage(data.results);
      
      const photo: PhotoSource = {
        url: bestImage.urls.regular,
        source: 'unsplash',
        width: 1200,
        height: 600,
        // Attribution metadata for production compliance
        photographer: bestImage.user.name,
        photographerUrl: bestImage.user.links?.html || `https://unsplash.com/@${bestImage.user.username}`,
        photoId: bestImage.id,
        downloadLocation: bestImage.links?.download_location,
        unsplashLink: `https://unsplash.com/photos/${bestImage.id}`,
      };

      debug.log(`✅ Imagem encontrada: ${bestImage.user.name}`);
      return photo;
    } catch (error) {
      debug.error(`❌ Erro ao buscar Unsplash:`, error);
      return null;
    }
  }

  private static selectBestImage(images: UnsplashImage[]): UnsplashImage {
    // Filtrar imagens com boa qualidade (mais likes/downloads)
    const scored = images.map((img: any) => ({
      image: img,
      score: (img.likes || 0) * 2 + (img.downloads || 0) * 1.5,
    }));

    // Ordenar por score e pegar a melhor
    scored.sort((a, b) => b.score - a.score);
    
    // Retornar primeira com score decente ou a primeira se nenhuma tiver
    return scored[0]?.image || images[0];
  }

  private static getSearchQuery(attractionName: string): string {
    const lowerName = attractionName.toLowerCase().trim();

    if (ATTRACTION_SEARCH_QUERIES[lowerName]) {
      return ATTRACTION_SEARCH_QUERIES[lowerName];
    }

    for (const [key, query] of Object.entries(ATTRACTION_SEARCH_QUERIES)) {
      if (lowerName.includes(key)) {
        return query;
      }
    }

    return attractionName;
  }

  private static getFallbackPhoto(attractionName: string): PhotoSource {
    const lowerName = attractionName.toLowerCase();
    
    const fallback = FALLBACK_GRADIENTS[lowerName] || FALLBACK_GRADIENTS['landmark'];
    const svg = this.generateGradientSvg(fallback.gradient, fallback.emoji, 1200, 600);
    const dataUrl = `data:image/svg+xml;base64,${btoa(svg)}`;

    return {
      url: dataUrl,
      source: 'fallback',
      width: 1200,
      height: 600,
    };
  }

  private static generateGradientSvg(
    gradient: string,
    emoji: string,
    width: number,
    height: number
  ): string {
    const colors = this.getGradientColors(gradient);
    const [fromColor, toColor] = colors;

    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${fromColor};stop-opacity:1" /><stop offset="100%" style="stop-color:${toColor};stop-opacity:1" /></linearGradient></defs><rect width="${width}" height="${height}" fill="url(#grad)"/><text x="50%" y="50%" font-size="120" text-anchor="middle" dominant-baseline="central" font-family="Arial">${emoji}</text></svg>`;
  }

  private static getGradientColors(gradient: string): [string, string] {
    const colorMap: { [key: string]: string } = {
      'red-500': '#ef4444',
      'red-600': '#dc2626',
      'orange-500': '#f97316',
      'orange-600': '#ea580c',
      'amber-600': '#b45309',
      'yellow-600': '#ca8a04',
      'green-600': '#16a34a',
      'emerald-700': '#047857',
      'teal-600': '#0d9488',
      'blue-400': '#60a5fa',
      'blue-600': '#2563eb',
      'indigo-700': '#4338ca',
      'purple-600': '#9333ea',
      'pink-600': '#db2777',
      'rose-600': '#e11d48',
      'slate-600': '#475569',
      'gray-700': '#374151',
    };

    const matches = gradient.match(/from-(\S+)\s+to-(\S+)/);
    if (!matches) {
      return ['#475569', '#334155'];
    }

    const from = colorMap[matches[1]] || '#475569';
    const to = colorMap[matches[2]] || '#334155';

    return [from, to];
  }
}

export default PhotoService;
