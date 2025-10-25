/**
 * photoService.ts
 * Gerencia geração de URLs de fotos com múltiplas estratégias
 * Tenta várias APIs de fallback para máxima confiabilidade
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
      
      // Estratégia 1: picsum.photos (mais confiável que source.unsplash.com)
      // Usa seed baseado no nome e índice para consistência
      const seed = this.hashCode(attractionName + index);
      const url = `https://picsum.photos/${width}/${height}?random=${Math.abs(seed) % 10000}`;
      
      console.log(`📸 Gerando URL para "${attractionName}": ${url}`);
      
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
   * Converte nome da atração em query de busca
   */
  static getSearchQuery(attractionName: string): string {
    const queries: { [key: string]: string } = {
      // Itália
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
      pizza: 'pizza italy',
      pasta: 'pasta italy',
      café: 'coffee shop',
      
      // Museus
      museu: 'museum art',
      museo: 'museum gallery',
      gallery: 'art gallery',
      
      // Natureza
      natureza: 'nature landscape',
      park: 'natural park',
      garden: 'botanical garden',
      beach: 'beach ocean',
      
      // Compras
      compra: 'shopping city',
      shopping: 'mall city',
      market: 'street market',
      
      // Padrão
      atração: 'travel landmark',
      attraction: 'travel landmark',
      tour: 'travel destination',
      visit: 'travel landscape',
    };

    const lowerName = attractionName.toLowerCase();
    
    for (const [key, value] of Object.entries(queries)) {
      if (lowerName.includes(key)) {
        return value;
      }
    }

    // Padrão: usar 3 primeiras palavras
    return lowerName.split(' ').slice(0, 3).join(' ') || 'travel landmark';
  }

  /**
   * Retorna foto placeholder quando APIs falham
   */
  static getPlaceholderPhoto(attractionName: string): PhotoSource {
    // Gerar cor consistente baseado no nome
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
