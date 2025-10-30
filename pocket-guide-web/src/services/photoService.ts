import { debug } from '@/utils/debug';
import { retryService } from './retryService';

export interface PhotoSource {
  url: string;
  source: 'unsplash' | 'pexels' | 'fallback';
  width: number;
  height: number;
}

interface UnsplashImage {
  urls: {
    regular: string;
  };
  user: {
    name: string;
  };
}

interface UnsplashResponse {
  results: UnsplashImage[];
  total: number;
}

const ATTRACTION_SEARCH_QUERIES: { [key: string]: string } = {
  // Rome Landmarks
  'colosseum': 'colosseum rome architecture',
  'colosseo': 'colosseum rome architecture',
  'coliseu': 'colosseum rome architecture',
  'roman forum': 'roman forum rome ancient',
  'foro romano': 'roman forum rome ancient',
  'palatine hill': 'palatine hill rome ruins',
  'monte palatino': 'palatine hill rome ruins',
  'monti': 'monti neighborhood rome street',
  'trevi fountain': 'trevi fountain rome water',
  'fontana di trevi': 'trevi fountain rome',
  'vatican': 'vatican city vatican museum art',
  'vatican city': 'vatican city vatican museum',
  'basilica di san pietro': 'st peter basilica vatican',
  'st peter': 'st peter basilica vatican',
  'pantheon': 'pantheon rome ancient architecture',
  'cappella sistina': 'sistine chapel vatican',
  'sistine chapel': 'sistine chapel vatican ceiling',

  // Food & Dining
  'restaurante': 'italian restaurant cuisine dining',
  'restaurant': 'italian restaurant cuisine dining',
  'pizzeria': 'pizzeria pizza restaurant italy',
  'pizza': 'authentic italian pizza wood oven',
  'pasta': 'authentic italian pasta cooking',
  'trattoria': 'trattoria italian restaurant dining',
  'café': 'italian coffee shop espresso',
  'coffee': 'italian espresso coffee shop',
  'gelato': 'gelato italian ice cream dessert',
  'gelati': 'gelato italian ice cream dessert',
  'lunch': 'italian lunch meal restaurant',
  'dinner': 'italian dinner meal restaurant',
  'breakfast': 'italian breakfast food morning',
  'wine': 'italian wine vineyard tasting',

  // Museums & Art
  'museu': 'museum art gallery exhibition',
  'museo': 'museum art gallery exhibition',
  'museum': 'museum art gallery exhibition',
  'gallery': 'art gallery exhibition paintings',
  'galeria': 'art gallery exhibition paintings',
  'art': 'art exhibition paintings sculptures',
  'arte': 'art exhibition paintings sculptures',
  'exhibit': 'art exhibition museum gallery',

  // Nature & Parks
  'nature': 'nature landscape outdoor scenery',
  'natureza': 'nature landscape outdoor scenery',
  'park': 'park nature garden outdoor',
  'parque': 'park nature garden outdoor',
  'garden': 'garden flowers botanical plants',
  'jardim': 'garden flowers botanical plants',
  'forest': 'forest nature trees woodland',
  'floresta': 'forest nature trees woodland',
  'beach': 'beach sand coast seaside',
  'praia': 'beach sand coast seaside',
  'ocean': 'ocean seascape water horizon',
  'oceano': 'ocean seascape water horizon',
  'mountain': 'mountain landscape peak altitude',
  'montanha': 'mountain landscape peak altitude',
  'hiking': 'hiking trail mountain nature',
  'trilha': 'hiking trail mountain nature',
  'waterfall': 'waterfall water nature scenic',
  'cachoeira': 'waterfall water nature scenic',

  // Shopping & Markets
  'shopping': 'shopping mall stores retail',
  'market': 'market street vendors local',
  'mercado': 'market street vendors local',
  'compra': 'shopping mall stores retail',
  'compras': 'shopping mall stores retail',
  'shop': 'shopping street stores retail',
  'loja': 'shopping street stores retail',

  // Leisure & Entertainment
  'leisure': 'leisure activity relaxation vacation',
  'entertainment': 'entertainment show performance cultural',
  'relax': 'relaxation spa wellness retreat',
  'spa': 'spa wellness massage treatment',
  'bem-estar': 'wellness spa health retreat',
  'night life': 'nightlife bar club entertainment',
  'noitada': 'nightlife bar club entertainment',

  // Historic & Tourist
  'landmark': 'landmark historic monument architectural',
  'marco': 'landmark historic monument architectural',
  'monumento': 'monument historic architectural landmark',
  'historic': 'historic site old architecture',
  'histórico': 'historic site old architecture',
  'travel': 'travel destination tourism scenic',
  'viagem': 'travel destination tourism scenic',
  'trip': 'travel adventure tourism destination',
  'attraction': 'tourist attraction landmark destination',
  'atração': 'tourist attraction landmark destination',
  'tour': 'guided tour sightseeing tourist',
  'passeio': 'guided tour sightseeing tourist',
  'walk': 'walking tour city street exploration',
  'caminhada': 'walking tour city street exploration',

  // Specific locations
  'eiffel': 'eiffel tower paris monument',
  'paris': 'paris city architecture landmark',
  'london': 'london city bridge landmark',
  'barcelona': 'barcelona city architecture',
  'madrid': 'madrid city architecture',
  'berlin': 'berlin city landmark history',
  'amsterdam': 'amsterdam city canal architecture',
  'lisbon': 'lisbon city architecture viewpoint',
  'athens': 'athens greece acropolis ancient',
  'istanbul': 'istanbul turkey mosque architecture',
};

const FALLBACK_GRADIENTS: { [key: string]: { gradient: string; emoji: string } } = {
  'colosseum': { gradient: 'from-amber-600 to-orange-600', emoji: '🏛️' },
  'restaurant': { gradient: 'from-red-600 to-rose-600', emoji: '🍽️' },
  'pizza': { gradient: 'from-orange-500 to-red-600', emoji: '🍕' },
  'museum': { gradient: 'from-purple-600 to-indigo-700', emoji: '🎨' },
  'park': { gradient: 'from-green-600 to-emerald-700', emoji: '🌳' },
  'beach': { gradient: 'from-blue-400 to-cyan-400', emoji: '🏖️' },
  'landmark': { gradient: 'from-slate-600 to-gray-700', emoji: '🗺️' },
};

export class PhotoService {
  private static readonly UNSPLASH_API_KEY = import.meta.env.VITE_UNSPLASH_API_KEY || '';
  private static readonly UNSPLASH_BASE_URL = 'https://api.unsplash.com';
  private static readonly CACHE = new Map<string, PhotoSource>();

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
