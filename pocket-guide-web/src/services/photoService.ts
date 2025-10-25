/**
 * photoService.ts
 * Gerencia geração de URLs de fotos com múltiplas estratégias
 * Usa Unsplash Source API com queries específicas de atrações
 */

export interface PhotoSource {
  url: string;
  source: 'unsplash' | 'placeholder';
  width: number;
  height: number;
}

/**
 * Mapeamento de tipos de atrações para queries de busca no Unsplash
 */
const ATTRACTION_QUERIES: { [key: string]: string[] } = {
  // Museus e Arte
  'museu': ['museum', 'gallery', 'art exhibition'],
  'museo': ['museum', 'gallery', 'art exhibition'],
  'museum': ['museum', 'gallery', 'art exhibition'],
  'gallery': ['gallery', 'art', 'paintings'],
  'art': ['art', 'painting', 'sculpture'],
  
  // Landmarks Romanos
  'colosseum': ['rome colosseum', 'roman architecture', 'ancient rome'],
  'colosseo': ['rome colosseum', 'roman architecture', 'ancient rome'],
  'roman': ['roman', 'ancient rome', 'ruins'],
  'forum': ['roman forum', 'ancient ruins', 'archaeology'],
  'palatine': ['palatine hill', 'ancient rome', 'hills'],
  'vatican': ['vatican', 'basilica', 'architecture'],
  'rome': ['rome city', 'italian city', 'travel'],
  
  // Comida e Restaurantes
    'pasta': ['pasta', 'italian food', 'cuisine'],
  'café': ['coffee shop', 'cafe', 'coffee'],
  'coffee': ['coffee', 'cafe', 'beverage'],
  'food': ['food', 'cuisine', 'restaurant'],
  'breakfast': ['breakfast', 'food', 'morning'],
  'lunch': ['lunch', 'food', 'meal'],
  'dinner': ['dinner', 'food', 'restaurant'],
  
  // Natureza e Parques
  'natureza': ['nature', 'landscape', 'outdoor'],
  'nature': ['nature', 'landscape', 'outdoor'],
  'park': ['park', 'nature', 'landscape'],
  'garden': ['garden', 'botanical', 'plants'],
  'beach': ['beach', 'sea', 'coast'],
  'ocean': ['ocean', 'sea', 'water'],
  'mountain': ['mountain', 'hiking', 'nature'],
  'forest': ['forest', 'trees', 'nature'],
  'lake': ['lake', 'water', 'nature'],
  
  // Compras e Mercados
  'shopping': ['shopping', 'store', 'market'],
  'market': ['market', 'street market', 'shopping'],
  'compra': ['shopping', 'store', 'products'],
  'shop': ['shop', 'store', 'shopping'],
  
  // Padrão
  'landmark': ['landmark', 'monument', 'travel'],
  'travel': ['travel', 'destination', 'tourism'],
  'trip': ['travel', 'vacation', 'tourism'],
  'attraction': ['attraction', 'landmark', 'tourism'],
  'city': ['city', 'urban', 'travel'],
  'street': ['street', 'city', 'urban'],
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
      
      // Obter query de busca para a atração
      const queries = this.getQueriesForAttraction(attractionName);
      const query = queries[index % queries.length];
      
      console.log(`📸 Gerando URL para "${attractionName}" (query: "${query}", índice: ${index})`);
      
      // Usar Unsplash Source API com query específica
      // Adiciona parâmetro random para variar as imagens
      const random = Math.floor(Math.random() * 10000);
      const url = `https://source.unsplash.com/1200x600/?${encodeURIComponent(query)}&${random}`;
      
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
   * Retorna queries de busca para uma atração
   */
  static getQueriesForAttraction(attractionName: string): string[] {
    const lowerName = attractionName.toLowerCase();
    
    // Procurar match exato ou parcial
    for (const [key, queries] of Object.entries(ATTRACTION_QUERIES)) {
      if (lowerName === key || lowerName.includes(key)) {
        console.log(`   ✅ Encontrado mapeamento para "${attractionName}": ${queries.join(', ')}`);
        return queries;
      }
    }
    
    // Se não encontrou, usar as 3 primeiras palavras como query
    const customQueries = lowerName
      .split(' ')
      .slice(0, 3)
      .filter(w => w.length > 2);
    
    if (customQueries.length > 0) {
      console.log(`   ℹ️ Query customizado para "${attractionName}": ${customQueries.join(', ')}`);
      return customQueries;
    }
    
    // Último fallback
    console.log(`   ⚠️ Nenhuma query encontrada, usando "travel"`);
    return ['travel', 'tourism', 'vacation'];
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
    console.log(`   📍 Placeholder para "${attractionName}": ${url}`);
    
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
