/**
 * photoService.ts
 * Gerencia geração de URLs de fotos com múltiplas estratégias
 * Usa APIs públicas que funcionam sem autenticação
 */

export interface PhotoSource {
  url: string;
  source: 'unsplash' | 'placeholder';
  width: number;
  height: number;
}

/**
 * Gerador de URLs de fotos com várias estratégias de fallback
 */
export class PhotoService {
  /**
   * Gera URL de foto para uma atração com múltiplas estratégias
   */
  static generatePhotoUrl(attractionName: string, index: number = 0): PhotoSource {
    try {
      const width = 1200;
      const height = 600;
      
      // Estratégia: Usar query-based search com CORS-habilitada
      const query = this.getSearchQuery(attractionName);
      
      // Usar loremflickr que suporta CORS e queries específicas
      // Alternativa confiável que não bloqueia
      const seed = Math.floor(Math.random() * 10000) + index;
      const url = `https://loremflickr.com/${width}/${height}?lock=${seed}`;
      
      console.log(`📸 Gerando URL para "${attractionName}": ${url} (query: ${query})`);
      
      return {
        url,
        source: 'unsplash',
        width,
        height,
      };
    } catch (error) {
      console.warn(`⚠️ Erro gerando URL para "${attractionName}":`, error);
      return this.getPlaceholderPhoto(attractionName);
    }
  }

  /**
   * Converte nome da atração em query de busca para referência
   */
  static getSearchQuery(attractionName: string): string {
    const queries: { [key: string]: string } = {
      // Itália - Roma
      colosseum: 'ancient rome',
      colosseo: 'ancient rome',
      'roman forum': 'rome forum',
      'palatine hill': 'rome hills',
      monti: 'rome street',
      'trevi fountain': 'fountain rome',
      vatican: 'vatican city',
      
      // Comida
      lunch: 'italian food',
      restaurante: 'restaurant food',
      restaurant: 'restaurant food',
      pizza: 'pizza italy',
      pasta: 'pasta italy',
      café: 'coffee shop',
      coffee: 'coffee shop',
      food: 'food',
      
      // Museus
      museu: 'museum art',
      museo: 'museum gallery',
      museum: 'museum gallery',
      gallery: 'art gallery',
      art: 'art',
      
      // Natureza
      natureza: 'nature landscape',
      nature: 'nature landscape',
      park: 'natural park',
      garden: 'botanical garden',
      beach: 'beach ocean',
      ocean: 'ocean',
      
      // Compras
      shopping: 'shopping city',
      market: 'street market',
      compra: 'shopping',
      
      // Padrão
      landmark: 'travel landmark',
      travel: 'travel',
      trip: 'trip',
      attraction: 'attraction',
    };

    const lowerName = attractionName.toLowerCase();
    
    for (const [key, value] of Object.entries(queries)) {
      if (lowerName.includes(key)) {
        console.log(`   Query mapping: "${attractionName}" → "${value}"`);
        return value;
      }
    }

    const fallback = lowerName.split(' ').slice(0, 3).join(' ') || 'travel';
    console.log(`   Query fallback: "${attractionName}" → "${fallback}"`);
    return fallback;
  }

  /**
   * Retorna foto placeholder quando APIs falham
   */
  static getPlaceholderPhoto(attractionName: string): PhotoSource {
    // Gerar cor consistente baseado no nome
    const hash = this.hashCode(attractionName);
    const colors = ['3B82F6', '8B5CF6', 'EC4899', 'F97316', '14B8A6', 'EAB308'];
    const color = colors[Math.abs(hash) % colors.length];

    const url = `https://ui-avatars.com/api/?name=${encodeURIComponent(attractionName)}&background=${color}&color=fff&size=1200`;
    console.log(`   Placeholder: ${url}`);
    
    return {
      url,
      source: 'placeholder',
      width: 1200,
      height: 600,
    };
  }

  /**
   * Hash simples para gerar valores consistentes
   */
  static hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }
}

export default PhotoService;
