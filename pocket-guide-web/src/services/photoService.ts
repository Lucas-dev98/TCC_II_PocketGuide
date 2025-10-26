export interface PhotoSource {
  url: string;
  source: 'unsplash' | 'placeholder';
  width: number;
  height: number;
}

const ATTRACTION_STYLES: { [key: string]: { gradient: string; emoji: string } } = {
  'colosseum': { gradient: 'from-amber-600 to-orange-600', emoji: '🏛️' },
  'colosseo': { gradient: 'from-amber-600 to-orange-600', emoji: '🏛️' },
  'roman forum': { gradient: 'from-amber-700 to-yellow-600', emoji: '🏛️' },
  'palatine hill': { gradient: 'from-green-600 to-emerald-600', emoji: '⛰️' },
  'monti': { gradient: 'from-slate-600 to-gray-700', emoji: '🏘️' },
  'trevi fountain': { gradient: 'from-blue-400 to-cyan-500', emoji: '⛲' },
  'vatican': { gradient: 'from-purple-600 to-pink-600', emoji: '⛪' },
  'vatican city': { gradient: 'from-purple-600 to-pink-600', emoji: '⛪' },
  'lunch': { gradient: 'from-red-500 to-orange-500', emoji: '🍝' },
  'restaurante': { gradient: 'from-red-600 to-rose-600', emoji: '🍽️' },
  'restaurant': { gradient: 'from-red-600 to-rose-600', emoji: '🍽️' },
  'pizza': { gradient: 'from-orange-500 to-red-600', emoji: '🍕' },
  'pasta': { gradient: 'from-yellow-600 to-orange-500', emoji: '🍝' },
  'café': { gradient: 'from-amber-700 to-yellow-700', emoji: '☕' },
  'coffee': { gradient: 'from-amber-700 to-yellow-700', emoji: '☕' },
  'food': { gradient: 'from-orange-500 to-red-500', emoji: '🍴' },
  'dinner': { gradient: 'from-indigo-600 to-purple-700', emoji: '🌙' },
  'breakfast': { gradient: 'from-yellow-500 to-orange-400', emoji: '🥐' },
  'museu': { gradient: 'from-purple-600 to-indigo-700', emoji: '🎨' },
  'museo': { gradient: 'from-purple-600 to-indigo-700', emoji: '🎨' },
  'museum': { gradient: 'from-purple-600 to-indigo-700', emoji: '🎨' },
  'gallery': { gradient: 'from-indigo-600 to-blue-700', emoji: '🖼️' },
  'art': { gradient: 'from-pink-600 to-purple-600', emoji: '🎭' },
  'natureza': { gradient: 'from-green-500 to-teal-600', emoji: '🌿' },
  'nature': { gradient: 'from-green-500 to-teal-600', emoji: '🌿' },
  'park': { gradient: 'from-green-600 to-emerald-700', emoji: '🌳' },
  'garden': { gradient: 'from-green-400 to-emerald-500', emoji: '🌺' },
  'beach': { gradient: 'from-blue-400 to-cyan-400', emoji: '🏖️' },
  'ocean': { gradient: 'from-blue-600 to-teal-600', emoji: '🌊' },
  'mountain': { gradient: 'from-gray-600 to-slate-700', emoji: '⛰️' },
  'hiking': { gradient: 'from-green-700 to-emerald-800', emoji: '🥾' },
  'shopping': { gradient: 'from-pink-500 to-rose-600', emoji: '🛍️' },
  'market': { gradient: 'from-yellow-500 to-orange-600', emoji: '🏪' },
  'compra': { gradient: 'from-pink-500 to-rose-600', emoji: '🛍️' },
  'compras': { gradient: 'from-pink-500 to-rose-600', emoji: '🛍️' },
  'leisure': { gradient: 'from-blue-500 to-purple-600', emoji: '🎪' },
  'entertainment': { gradient: 'from-pink-500 to-orange-500', emoji: '🎉' },
  'relax': { gradient: 'from-cyan-400 to-blue-500', emoji: '🧘' },
  'spa': { gradient: 'from-purple-500 to-pink-500', emoji: '🛀' },
  'landmark': { gradient: 'from-slate-600 to-gray-700', emoji: '🗺️' },
  'travel': { gradient: 'from-blue-600 to-indigo-700', emoji: '✈️' },
  'trip': { gradient: 'from-indigo-600 to-purple-700', emoji: '🧳' },
  'attraction': { gradient: 'from-amber-600 to-orange-600', emoji: '🎯' },
  'tour': { gradient: 'from-orange-600 to-red-600', emoji: '🚌' },
  'walk': { gradient: 'from-green-500 to-teal-500', emoji: '🚶' },
};

export class PhotoService {
  static generatePhotoUrl(attractionName: string): PhotoSource {
    try {
      const width = 1200;
      const height = 600;
      
      const style = this.getAttractionStyle(attractionName);
      const svg = this.generateGradientSvg(style.gradient, style.emoji, width, height);
      const dataUrl = `data:image/svg+xml;base64,${btoa(svg)}`;
      
      console.log(`📸 Gerando imagem para "${attractionName}": ${style.emoji}`);
      
      return {
        url: dataUrl,
        source: 'unsplash',
        width,
        height,
      };
    } catch (error) {
      console.warn(`⚠️ Erro gerando imagem para "${attractionName}":`, error);
      return this.getPlaceholderPhoto(attractionName);
    }
  }

  static getAttractionStyle(attractionName: string): { gradient: string; emoji: string } {
    const lowerName = attractionName.toLowerCase();
    
    if (ATTRACTION_STYLES[lowerName]) {
      return ATTRACTION_STYLES[lowerName];
    }
    
    for (const [key, style] of Object.entries(ATTRACTION_STYLES)) {
      if (lowerName.includes(key) || key.includes(lowerName.split(' ')[0])) {
        return style;
      }
    }
    
    return ATTRACTION_STYLES['landmark'] || { gradient: 'from-slate-600 to-gray-700', emoji: '🗺️' };
  }

  static generateGradientSvg(gradient: string, emoji: string, width: number, height: number): string {
    const colors = this.getGradientColors(gradient);
    const [fromColor, toColor] = colors;
    
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${fromColor};stop-opacity:1" /><stop offset="100%" style="stop-color:${toColor};stop-opacity:1" /></linearGradient></defs><rect width="${width}" height="${height}" fill="url(#grad)"/><text x="50%" y="50%" font-size="120" text-anchor="middle" dominant-baseline="central" font-family="Arial">${emoji}</text></svg>`;
  }

  static getGradientColors(gradient: string): [string, string] {
    const colorMap: { [key: string]: string } = {
      'red-500': '#ef4444',
      'red-600': '#dc2626',
      'orange-400': '#fb923c',
      'orange-500': '#f97316',
      'orange-600': '#ea580c',
      'amber-600': '#b45309',
      'amber-700': '#92400e',
      'yellow-500': '#eab308',
      'yellow-600': '#ca8a04',
      'yellow-700': '#a16207',
      'green-400': '#4ade80',
      'green-500': '#22c55e',
      'green-600': '#16a34a',
      'green-700': '#15803d',
      'emerald-500': '#10b981',
      'emerald-600': '#059669',
      'emerald-700': '#047857',
      'emerald-800': '#065f46',
      'teal-500': '#14b8a6',
      'teal-600': '#0d9488',
      'cyan-400': '#22d3ee',
      'cyan-500': '#06b6d4',
      'blue-400': '#60a5fa',
      'blue-500': '#3b82f6',
      'blue-600': '#2563eb',
      'blue-700': '#1d4ed8',
      'indigo-600': '#4f46e5',
      'indigo-700': '#4338ca',
      'purple-500': '#a855f7',
      'purple-600': '#9333ea',
      'purple-700': '#7e22ce',
      'pink-500': '#ec4899',
      'pink-600': '#db2777',
      'rose-600': '#e11d48',
      'slate-600': '#475569',
      'slate-700': '#334155',
      'gray-600': '#4b5563',
      'gray-700': '#374151',
    };
    
    const matches = gradient.match(/from-(\S+)\s+to-(\S+)/);
    if (!matches) {
      return ['#475569', '#374151'];
    }
    
    const from = colorMap[matches[1]] || '#475569';
    const to = colorMap[matches[2]] || '#374151';
    
    return [from, to];
  }

  static getPlaceholderPhoto(attractionName: string): PhotoSource {
    const hash = this.hashCode(attractionName);
    const colors = ['3B82F6', '8B5CF6', 'EC4899', 'F97316', '14B8A6', 'EAB308'];
    const color = colors[Math.abs(hash) % colors.length];

    return {
      url: `https://ui-avatars.com/api/?name=${encodeURIComponent(attractionName)}&background=${color}&color=fff&size=1200`,
      source: 'placeholder',
      width: 1200,
      height: 600,
    };
  }

  static hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  }
}

export default PhotoService;
