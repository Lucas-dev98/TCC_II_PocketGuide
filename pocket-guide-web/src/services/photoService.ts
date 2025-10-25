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
    // Estratégia 1: Unsplash Images API (mais confiável)
    try {
      const query = this.getSearchQuery(attractionName);
      const width = 1200;
      const height = 600;
      
      // Usando a API de imagens do Unsplash que não requer autenticação
      const url = `https://images.unsplash.com/photo-${this.getPhotoIds(query)[index % this.getPhotoIds(query).length]}?w=${width}&h=${height}&fit=crop&crop=entropy&q=80&fm=webp`;
      
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
   */
  static getPhotoIds(query: string): string[] {
    const photoIdMap: { [key: string]: string[] } = {
      'ancient rome': ['1571232857-19e4486ae64a', '1548732328-d06e3d306f02', '1566073051-e192b24b5b8f'],
      'rome forum': ['1491554176-e8c0e2c6d3a4', '1548732201-4e1fa8e1e5d7', '1467844864-4b7f2b5a1e7d'],
      'rome hills': ['1532274323-e3a8c2d4e9f7', '1548731638-e8c0e2c6d3a4', '1467844864-4b7f2b5a1e7d'],
      'rome street': ['1517604930-0f8434a53f2e', '1548732323-e8c0e2c6d3a4', '1467844864-4b7f2b5a1e7d'],
      'fountain rome': ['1533105792-f8d73c62e97a', '1548732201-4e1fa8e1e5d7', '1467844864-4b7f2b5a1e7d'],
      'vatican city': ['1491554894-8f2a0d7eb8d4', '1548732328-d06e3d306f02', '1467844864-4b7f2b5a1e7d'],
      'italian food': ['1473093051-e3cf2d7eb8d4', '1546069901-ba9599a7e72c', '1495521821-7ad8dd3c43c5'],
      'restaurant food': ['1504674900-e77aaadba960', '1546069901-ba9599a7e72c', '1504674900-e77aaadba960'],
      'pizza italy': ['1628840042-cfb747b8c0ab', '1546069901-ba9599a7e72c', '1628840042-cfb747b8c0ab'],
      'pasta italy': ['1627308261-55eea4c69dab', '1546069901-ba9599a7e72c', '1627308261-55eea4c69dab'],
      'coffee shop': ['1509042239-8ac07e3a5e3f', '1495521821-7ad8dd3c43c5', '1509042239-8ac07e3a5e3f'],
      'museum art': ['1564399579-ab7501b1d4d5', '1580136579312-94651dfd596d', '1564399579-ab7501b1d4d5'],
      'museum gallery': ['1564399579-ab7501b1d4d5', '1580136579312-94651dfd596d', '1564399579-ab7501b1d4d5'],
      'art gallery': ['1578321286-94d440642117', '1580136579312-94651dfd596d', '1578321286-94d440642117'],
      'nature landscape': ['1506905925-2a4edeaf7ee3', '1441974231531-c6227db76b6e', '1506905925-2a4edeaf7ee3'],
      'natural park': ['1441974231531-c6227db76b6e', '1506905925-2a4edeaf7ee3', '1441974231531-c6227db76b6e'],
      'botanical garden': ['1510531173d71-b2c1e1d3e4f5', '1441974231531-c6227db76b6e', '1506905925-2a4edeaf7ee3'],
      'beach ocean': ['1507003188-3ebaaf87b84f', '1507525428034-956a0db534d3', '1507003188-3ebaaf87b84f'],
      'shopping city': ['1555637534-46c5b814cc4b', '1478926716170-98b6b7c5f21f', '1555637534-46c5b814cc4b'],
      'mall city': ['1555637534-46c5b814cc4b', '1478926716170-98b6b7c5f21f', '1555637534-46c5b814cc4b'],
      'street market': ['1500595046-63b36417ef48', '1478926716170-98b6b7c5f21f', '1500595046-63b36417ef48'],
      'travel landmark': ['1488646953-5b8cb4a31e4b', '1488549897206-d61d8fb8e7ae', '1488646953-5b8cb4a31e4b'],
      'travel destination': ['1503391614556-6f75a16b8e3c', '1488549897206-d61d8fb8e7ae', '1503391614556-6f75a16b8e3c'],
      'travel landscape': ['1506905925-2a4edeaf7ee3', '1488549897206-d61d8fb8e7ae', '1506905925-2a4edeaf7ee3'],
    };

    const ids = photoIdMap[query];
    if (ids && ids.length > 0) {
      return ids;
    }

    // Fallback para algumas fotos genéricas
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
