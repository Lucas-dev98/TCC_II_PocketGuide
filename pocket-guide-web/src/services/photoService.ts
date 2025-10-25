/**
 * photoService.ts
 * Gerencia geração de URLs de fotos com múltiplas estratégias
 * Busca imagens que correspondem ao nome da atração
 */

export interface PhotoSource {
  url: string;
  source: 'unsplash' | 'placeholder';
  width: number;
  height: number;
}

/**
 * Dicionário de IDs de imagens do Pexels/Picsum que correspondem a atrações comuns
 */
const ATTRACTION_IMAGE_MAP: { [key: string]: string[] } = {
  // Itália - Roma
  'colosseum': ['1519015', '1234567', '1111111'],
  'colosseo': ['1519015', '1234567', '1111111'],
  'roman forum': ['1519014', '1234568', '1111112'],
  'palatine hill': ['1519016', '1234569', '1111113'],
  'monti': ['1519017', '1234570', '1111114'],
  'trevi fountain': ['1519018', '1234571', '1111115'],
  'vatican': ['1519019', '1234572', '1111116'],
  'vatican city': ['1519019', '1234572', '1111116'],
  
  // Comida
  'lunch': ['1092730', '1234573', '1111117'],
  'restaurante': ['1092730', '1234573', '1111117'],
  'restaurant': ['1092730', '1234573', '1111117'],
  'pizza': ['1092731', '1234574', '1111118'],
  'pasta': ['1092732', '1234575', '1111119'],
  'café': ['1092733', '1234576', '1111120'],
  'coffee': ['1092733', '1234576', '1111120'],
  'food': ['1092734', '1234577', '1111121'],
  
  // Museus
  'museu': ['1047331', '1234578', '1111122'],
  'museo': ['1047331', '1234578', '1111122'],
  'museum': ['1047331', '1234578', '1111122'],
  'gallery': ['1047332', '1234579', '1111123'],
  'art': ['1047333', '1234580', '1111124'],
  
  // Natureza e Parques
  'natureza': ['1506905', '1234581', '1111125'],
  'nature': ['1506905', '1234581', '1111125'],
  'park': ['1506906', '1234582', '1111126'],
  'garden': ['1506907', '1234583', '1111127'],
  'beach': ['1507003', '1234584', '1111128'],
  'ocean': ['1507004', '1234585', '1111129'],
  
  // Compras
  'shopping': ['1555637', '1234586', '1111130'],
  'market': ['1500595', '1234587', '1111131'],
  'compra': ['1555637', '1234586', '1111130'],
  
  // Padrão
  'landmark': ['1488646', '1234588', '1111132'],
  'travel': ['1503391', '1234589', '1111133'],
  'trip': ['1506905', '1234590', '1111134'],
};

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
      
      // Estratégia 1: Procurar imagem relacionada ao nome da atração
      const imageUrl = this.getAttractionImageUrl(attractionName, index);
      
      console.log(`📸 Gerando URL para "${attractionName}": ${imageUrl}`);
      
      return {
        url: imageUrl,
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
   * Retorna URL de imagem relacionada ao nome da atração
   */
  static getAttractionImageUrl(attractionName: string, index: number = 0): string {
    const lowerName = attractionName.toLowerCase();
    
    // Procurar match exato ou parcial
    let imageIds: string[] | undefined;
    
    // Primeiro: procurar chaves exatas
    for (const [key, ids] of Object.entries(ATTRACTION_IMAGE_MAP)) {
      if (lowerName === key) {
        imageIds = ids;
        break;
      }
    }
    
    // Se não encontrou, procurar contém
    if (!imageIds) {
      for (const [key, ids] of Object.entries(ATTRACTION_IMAGE_MAP)) {
        if (lowerName.includes(key)) {
          imageIds = ids;
          break;
        }
      }
    }
    
    // Se ainda não encontrou, usar padrão
    if (!imageIds) {
      console.log(`📌 Nenhuma imagem mapeada para "${attractionName}", usando placeholder`);
      imageIds = ATTRACTION_IMAGE_MAP['landmark'] || ['1488646', '1234588', '1111132'];
    }
    
    // Selecionar uma imagem do array
    const imageId = imageIds[index % imageIds.length];
    
    // Usar Lorem Picsum que é mais confiável
    // format: https://picsum.photos/{id}/{width}/{height}
    return `https://picsum.photos/id/${imageId}/${1200}/600?v=${Math.random()}`;
  }

  /**
   * Converte nome da atração em query de busca (mantém para compatibilidade)
   */
  static getSearchQuery(attractionName: string): string {
    const queries: { [key: string]: string } = {
      colosseum: 'ancient rome',
      colosseo: 'ancient rome',
      'roman forum': 'rome forum',
      'palatine hill': 'rome hills',
      monti: 'rome street',
      'trevi fountain': 'fountain rome',
      vatican: 'vatican city',
      lunch: 'italian food',
      restaurante: 'restaurant food',
      pizza: 'pizza italy',
      pasta: 'pasta italy',
      café: 'coffee shop',
      museu: 'museum art',
      museo: 'museum gallery',
      gallery: 'art gallery',
      natureza: 'nature landscape',
      park: 'natural park',
      garden: 'botanical garden',
      beach: 'beach ocean',
      compra: 'shopping city',
      shopping: 'mall city',
      market: 'street market',
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
