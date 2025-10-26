import { debug } from '@/utils/debug';

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
  'colosseum': 'colosseum rome',
  'colosseo': 'colosseum rome',
  'roman forum': 'roman forum rome',
  'palatine hill': 'palatine hill rome',
  'monti': 'monti rome',
  'trevi fountain': 'trevi fountain',
  'vatican': 'vatican city',
  'vatican city': 'vatican city',
  'restaurante': 'italian restaurant',
  'restaurant': 'italian restaurant',
  'pizza': 'pizza italian',
  'pasta': 'pasta italian',
  'café': 'coffee shop',
  'coffee': 'coffee shop',
  'lunch': 'food meal',
  'dinner': 'food dining',
  'breakfast': 'breakfast food',
  'museu': 'museum rome',
  'museo': 'museum rome',
  'museum': 'museum rome',
  'gallery': 'art gallery',
  'art': 'art exhibition',
  'nature': 'nature landscape',
  'natureza': 'nature landscape',
  'park': 'park nature',
  'garden': 'garden flowers',
  'beach': 'beach coast',
  'ocean': 'ocean seascape',
  'mountain': 'mountain landscape',
  'hiking': 'hiking trail',
  'shopping': 'shopping mall',
  'market': 'market street',
  'compra': 'shopping',
  'compras': 'shopping mall',
  'leisure': 'leisure activity',
  'entertainment': 'entertainment',
  'relax': 'relaxation spa',
  'spa': 'spa wellness',
  'landmark': 'landmark historic',
  'travel': 'travel destination',
  'trip': 'travel adventure',
  'attraction': 'tourist attraction',
  'tour': 'guided tour',
  'walk': 'walking tour',
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

      const url = new URL(`${this.UNSPLASH_BASE_URL}/search/photos`);
      url.searchParams.set('query', query);
      url.searchParams.set('client_id', this.UNSPLASH_API_KEY);
      url.searchParams.set('per_page', '1');
      url.searchParams.set('orientation', 'landscape');

      const response = await fetch(url.toString());

      if (!response.ok) {
        debug.warn(`⚠️ Resposta Unsplash: ${response.status} ${response.statusText}`);
        return null;
      }

      const data: UnsplashResponse = await response.json();

      if (data.results.length === 0) {
        debug.warn(`⚠️ Nenhuma imagem encontrada para: "${query}"`);
        return null;
      }

      const image = data.results[0];
      const photo: PhotoSource = {
        url: image.urls.regular,
        source: 'unsplash',
        width: 1200,
        height: 600,
      };

      debug.log(`✅ Imagem encontrada: ${image.user.name}`);
      return photo;
    } catch (error) {
      debug.error(`❌ Erro ao buscar Unsplash:`, error);
      return null;
    }
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
