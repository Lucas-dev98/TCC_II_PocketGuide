/**
 * photoService.ts
 * Gerencia geração de URLs de fotos com múltiplas estratégias
 * Usa Unsplash com fallbacks robustos
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
    // Estratégia 1: Unsplash Source API (mais confiável e simples)
    try {
      const query = this.getSearchQuery(attractionName);
      const width = 1200;
      const height = 600;
      
      // Usar source.unsplash.com que é mais confiável
      // Adiciona um parâmetro unique baseado no índice para variar as imagens
      const sig = Math.floor(Math.random() * 10000) + index;
      const url = `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(query)}&sig=${sig}`;
      
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
   * Retorna IDs de fotos pré-selecionadas do Unsplash
   * Estas são IDs reais de fotos públicas com permissão
   * NOTA: Já não usado - usando source.unsplash.com ao invés
   */
  static getPhotoIds(): string[] {
    // Mantido para compatibilidade, mas não é usado mais
    return [
      '1488646953-5b8cb4a31e4b',
      '1488549897206-d61d8fb8e7ae',
      '1503391614556-6f75a16b8e3c',
    ];
  }

  /**
   * Retorna foto placeholder quando Unsplash falha
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
   * Hash simples para gerar cores consistentes
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
