/**
 * Mapeamento de Cidades para Países
 * Usado para autocomplete automático no CreateTripScreen
 */

interface CityCountryMap {
  [city: string]: string;
}

export const CITY_COUNTRY_MAP: CityCountryMap = {
  // Portugal
  'lisboa': 'Portugal',
  'lisbon': 'Portugal',
  'porto': 'Portugal',
  'covilhã': 'Portugal',
  'évora': 'Portugal',
  'faro': 'Portugal',
  'braga': 'Portugal',

  // Espanha
  'madrid': 'Espanha',
  'barcelona': 'Espanha',
  'valência': 'Espanha',
  'valencia': 'Espanha',
  'sevilha': 'Espanha',
  'seville': 'Espanha',
  'bilbao': 'Espanha',
  'málaga': 'Espanha',
  'malaga': 'Espanha',
  'granada': 'Espanha',
  'palma': 'Espanha',
  'toledo': 'Espanha',

  // Itália
  'roma': 'Itália',
  'rome': 'Itália',
  'milão': 'Itália',
  'milan': 'Itália',
  'veneza': 'Itália',
  'venice': 'Itália',
  'florença': 'Itália',
  'florence': 'Itália',
  'nápoles': 'Itália',
  'naples': 'Itália',
  'turim': 'Itália',
  'turin': 'Itália',
  'cinque terre': 'Itália',
  'amalfi': 'Itália',

  // França
  'paris': 'França',
  'lyon': 'França',
  'marselha': 'França',
  'marseille': 'França',
  'toulouse': 'França',
  'nice': 'França',
  'cannes': 'França',
  'bordéus': 'França',
  'bordeaux': 'França',
  'avignon': 'França',
  'versalhes': 'França',
  'versailles': 'França',
  'mont-saint-michel': 'França',

  // Alemanha
  'berlim': 'Alemanha',
  'berlin': 'Alemanha',
  'munique': 'Alemanha',
  'munich': 'Alemanha',
  'frankfurt': 'Alemanha',
  'colônia': 'Alemanha',
  'cologne': 'Alemanha',
  'hamburgo': 'Alemanha',
  'hamburg': 'Alemanha',
  'dresden': 'Alemanha',
  'nuremberg': 'Alemanha',

  // Áustria
  'viena': 'Áustria',
  'vienna': 'Áustria',
  'salzburgo': 'Áustria',
  'salzburg': 'Áustria',
  'innsbruck': 'Áustria',
  'graz': 'Áustria',

  // Suíça
  'zurique': 'Suíça',
  'zurich': 'Suíça',
  'genebra': 'Suíça',
  'geneva': 'Suíça',
  'lucerna': 'Suíça',
  'lucerne': 'Suíça',
  'berna': 'Suíça',
  'bern': 'Suíça',
  'interlaken': 'Suíça',

  // Holanda
  'amsterdã': 'Holanda',
  'amsterdam': 'Holanda',
  'roterdã': 'Holanda',
  'rotterdam': 'Holanda',
  'bruges': 'Holanda',
  'brugge': 'Holanda',
  'haia': 'Holanda',
  'the hague': 'Holanda',

  // Bélgica
  'bruxelas': 'Bélgica',
  'brussels': 'Bélgica',
  'antuérpia': 'Bélgica',
  'antwerp': 'Bélgica',
  'gent': 'Bélgica',
  'ghent': 'Bélgica',

  // Reino Unido
  'Londres': 'Reino Unido',
  'london': 'Reino Unido',
  'manchester': 'Reino Unido',
  'liverpool': 'Reino Unido',
  'edimburgo': 'Reino Unido',
  'edinburgh': 'Reino Unido',
  'bath': 'Reino Unido',
  'oxford': 'Reino Unido',
  'cambridge': 'Reino Unido',
  'stonehenge': 'Reino Unido',

  // Irlanda
  'dublin': 'Irlanda',
  'cork': 'Irlanda',
  'galway': 'Irlanda',
  'belfast': 'Irlanda do Norte',

  // Escandinávia
  'estocolmo': 'Suécia',
  'stockholm': 'Suécia',
  'gotemburgo': 'Suécia',
  'gothenburg': 'Suécia',
  'copenhague': 'Dinamarca',
  'copenhagen': 'Dinamarca',
  'aarhus': 'Dinamarca',
  'oslo': 'Noruega',
  'bergen': 'Noruega',
  'helsinque': 'Finlândia',
  'helsinki': 'Finlândia',
  'riga': 'Letônia',
  'vilnius': 'Lituânia',
  'tallinn': 'Estônia',

  // Europa do Leste
  'praga': 'República Tcheca',
  'prague': 'República Tcheca',
  'brno': 'República Tcheca',
  'varsóvia': 'Polônia',
  'warsaw': 'Polônia',
  'cracóvia': 'Polônia',
  'krakow': 'Polônia',
  'gdańsk': 'Polônia',
  'gdansk': 'Polônia',
  'budapeste': 'Hungria',
  'budapest': 'Hungria',
  'bucareste': 'Romênia',
  'bucharest': 'Romênia',
  'sofia': 'Bulgária',
  'belgrado': 'Sérbia',
  'belgrade': 'Sérvia',
  'zagreb': 'Croácia',
  'liubliana': 'Eslovênia',
  'ljubljana': 'Eslovênia',
  'bratislava': 'Eslováquia',

  // Grécia
  'atenas': 'Grécia',
  'athens': 'Grécia',
  'mykonos': 'Grécia',
  'santorini': 'Grécia',
  'creta': 'Grécia',
  'crete': 'Grécia',
  'rhodes': 'Grécia',
  'patros': 'Grécia',

  // Turquia
  'istambul': 'Turquia',
  'istanbul': 'Turquia',
  'capadócia': 'Turquia',
  'cappadocia': 'Turquia',
  'ancara': 'Turquia',
  'ankara': 'Turquia',
  'esmirna': 'Turquia',
  'izmir': 'Turquia',
  'éfeso': 'Turquia',
  'ephesus': 'Turquia',

  // Magrebe
  'casablanca': 'Marrocos',
  'marrakech': 'Marrocos',
  'fez': 'Marrocos',
  'essaouira': 'Marrocos',
  'tangier': 'Marrocos',
  'argel': 'Argélia',
  'algiers': 'Argélia',
  'orã': 'Argélia',
  'túnis': 'Tunísia',
  'tunisia': 'Tunísia',
  'sousse': 'Tunísia',

  // Egito
  'cairo': 'Egito',
  'giza': 'Egito',
  'luxor': 'Egito',
  'assuã': 'Egito',
  'aswan': 'Egito',
  'alexandria': 'Egito',

  // Oriente Médio
  'dubai': 'Emirados Árabes Unidos',
  'abu dhabi': 'Emirados Árabes Unidos',
  'doha': 'Qatar',
  'riade': 'Arábia Saudita',
  'riyadh': 'Arábia Saudita',
  'jeddah': 'Arábia Saudita',
  'teerã': 'Irã',
  'tehran': 'Irã',
  'jerusalém': 'Israel',
  'jerusalem': 'Israel',
  'tel aviv': 'Israel',
  'amã': 'Jordânia',
  'amman': 'Jordânia',
  'petra': 'Jordânia',
  'beirute': 'Líbano',
  'beirut': 'Líbano',

  // Ásia Meridional
  'deli': 'Índia',
  'delhi': 'Índia',
  'mumbai': 'Índia',
  'bangalore': 'Índia',
  'agra': 'Índia',
  'jaipur': 'Índia',
  'kolkata': 'Índia',
  'goa': 'Índia',
  'katmandu': 'Nepal',
  'kathmandu': 'Nepal',
  'colombo': 'Sri Lanka',
  'dhaka': 'Bangladesh',
  'islamabá': 'Paquistão',
  'islamabad': 'Paquistão',
  'lahore': 'Paquistão',
  'karachi': 'Paquistão',

  // Ásia Sudeste
  'bangkok': 'Tailândia',
  'phuket': 'Tailândia',
  'chiang mai': 'Tailândia',
  'hanói': 'Vietnã',
  'hanoi': 'Vietnã',
  'cidade de ho chi minh': 'Vietnã',
  'ho chi minh': 'Vietnã',
  'saigon': 'Vietnã',
  'hoi an': 'Vietnã',
  'da nang': 'Vietnã',
  'siem reap': 'Camboja',
  'phnom penh': 'Camboja',
  'yangon': 'Mianmar',
  'mandalay': 'Mianmar',
  'kuala lumpur': 'Malásia',
  'penang': 'Malásia',
  'singapura': 'Singapura',
  'singapore': 'Singapura',
  'jakarta': 'Indonésia',
  'bali': 'Indonésia',
  'denpasar': 'Indonésia',
  'yogyakarta': 'Indonésia',
  'manila': 'Filipinas',
  'cebu': 'Filipinas',
  'davao': 'Filipinas',
  'boracay': 'Filipinas',

  // Ásia Leste
  'tóquio': 'Japão',
  'tokyo': 'Japão',
  'kyoto': 'Japão',
  'osaka': 'Japão',
  'hiroshima': 'Japão',
  'nara': 'Japão',
  'fukuoka': 'Japão',
  'pequim': 'China',
  'beijing': 'China',
  'xangai': 'China',
  'shanghai': 'China',
  'guangzhou': 'China',
  'chongqing': 'China',
  'xi\'an': 'China',
  'chengdu': 'China',
  'hangzhou': 'China',
  'coreia do sul': 'Coreia do Sul',
  'seul': 'Coreia do Sul',
  'seoul': 'Coreia do Sul',
  'busan': 'Coreia do Sul',
  'incheon': 'Coreia do Sul',
  'daegu': 'Coreia do Sul',
  'coreia do norte': 'Coreia do Norte',
  'pyongyang': 'Coreia do Norte',
  'hong kong': 'Hong Kong',
  'macau': 'Macau',
  'macao': 'Macau',
  'taipei': 'Taiwan',
  'taichung': 'Taiwan',
  'tainan': 'Taiwan',

  // Ásia Central
  'astana': 'Cazaquistão',
  'nur-sultan': 'Cazaquistão',
  'almaty': 'Cazaquistão',
  'tashkent': 'Uzbequistão',
  'samarkanda': 'Uzbequistão',
  'samarkand': 'Uzbequistão',
  'bukhara': 'Uzbequistão',
  'bishkek': 'Quirguistão',
  'dushanbe': 'Tajiquistão',

  // América do Norte
  'nova york': 'Estados Unidos',
  'new york': 'Estados Unidos',
  'los angeles': 'Estados Unidos',
  'chicago': 'Estados Unidos',
  'miami': 'Estados Unidos',
  'orlando': 'Estados Unidos',
  'são francisco': 'Estados Unidos',
  'san francisco': 'Estados Unidos',
  'seattle': 'Estados Unidos',
  'boston': 'Estados Unidos',
  'filadélfia': 'Estados Unidos',
  'philadelphia': 'Estados Unidos',
  'washington': 'Estados Unidos',
  'denver': 'Estados Unidos',
  'houston': 'Estados Unidos',
  'dallas': 'Estados Unidos',
  'phoenix': 'Estados Unidos',
  'las vegas': 'Estados Unidos',
  'minneápolis': 'Estados Unidos',
  'minneapolis': 'Estados Unidos',
  'detroit': 'Estados Unidos',
  'nova orleans': 'Estados Unidos',
  'new orleans': 'Estados Unidos',
  'toronto': 'Canadá',
  'vancouver': 'Canadá',
  'montreal': 'Canadá',
  'calgary': 'Canadá',
  'ottawa': 'Canadá',
  'quebec': 'Canadá',
  'winnipeg': 'Canadá',
  'méxico': 'México',
  'mexico': 'México',
  'mexico city': 'México',
  'cancún': 'México',
  'cancun': 'México',
  'playa del carmen': 'México',
  'puerto vallarta': 'México',
  'los cabos': 'México',
  'oaxaca': 'México',
  'guadalajara': 'México',
  'monterrey': 'México',

  // América Central
  'cidade da guatemala': 'Guatemala',
  'guatemala city': 'Guatemala',
  'antigua': 'Guatemala',
  'san salvador': 'El Salvador',
  'tegucigalpa': 'Honduras',
  'managua': 'Nicarágua',
  'san josé': 'Costa Rica',
  'san jose': 'Costa Rica',
  'san blas': 'Panamá',
  'panamá': 'Panamá',
  'panama': 'Panamá',
  'panama city': 'Panamá',
  'cidade do panamá': 'Panamá',

  // Caribe
  'havana': 'Cuba',
  'varadero': 'Cuba',
  'santiago de cuba': 'Cuba',
  'são juan': 'Porto Rico',
  'san juan': 'Porto Rico',
  'santo domingo': 'República Dominicana',
  'punta cana': 'República Dominicana',
  'nassau': 'Bahamas',
  'kingston': 'Jamaica',
  'montego bay': 'Jamaica',
  'bridgetown': 'Barbados',
  'castries': 'Santa Lúcia',
  'willemstad': 'Curaçao',
  'philipsburg': 'Sint Maarten',

  // América do Sul
  'buenos aires': 'Argentina',
  'córdoba': 'Argentina',
  'mendoza': 'Argentina',
  'la plata': 'Argentina',
  'santiago': 'Chile',
  'valparaíso': 'Chile',
  'iquique': 'Chile',
  'pucón': 'Chile',
  'atacama': 'Chile',

  // Brasil
  'são paulo': 'Brasil',
  'rio de janeiro': 'Brasil',
  'belo horizonte': 'Brasil',
  'brasília': 'Brasil',
  'curitiba': 'Brasil',
  'porto alegre': 'Brasil',
  'salvador': 'Brasil',
  'fortaleza': 'Brasil',
  'manaus': 'Brasil',
  'belém': 'Brasil',
  'recife': 'Brasil',
  'maceió': 'Brasil',
  'natal': 'Brasil',
  'teresina': 'Brasil',
  'joão pessoa': 'Brasil',
  'são luís': 'Brasil',
  'goiânia': 'Brasil',
  'campo grande': 'Brasil',
  'florianópolis': 'Brasil',
  'blumenau': 'Brasil',

  // Colômbia
  'bogotá': 'Colômbia',
  'medellín': 'Colômbia',
  'cartagena': 'Colômbia',
  'cali': 'Colômbia',
  'santa marta': 'Colômbia',
  'tayrona': 'Colômbia',

  // Venezuela
  'caracas': 'Venezuela',
  'margarita': 'Venezuela',
  'canaima': 'Venezuela',

  // Guiana
  'georgetown': 'Guiana',
  'paramaribo': 'Surinã',
  'caiena': 'Guiana Francesa',
  'cayenne': 'Guiana Francesa',

  // Equador
  'quito': 'Equador',
  'guayaquil': 'Equador',
  'quenca': 'Equador',
  'cuenca': 'Equador',
  'galápagos': 'Equador',
  'galapagos': 'Equador',

  // Peru
  'lima': 'Peru',
  'cusco': 'Peru',
  'machu picchu': 'Peru',
  'arequipa': 'Peru',
  'trujillo': 'Peru',
  'puno': 'Peru',
  'iquitos': 'Peru',

  // Bolívia
  'la paz': 'Bolívia',
  'sucre': 'Bolívia',
  'cochabamba': 'Bolívia',
  'santa cruz': 'Bolívia',
  'potosí': 'Bolívia',

  // Paraguai
    // Paraguai
  'assunção': 'Paraguai',
  'encarnación': 'Paraguai',

  // Uruguai
  'montevidéu': 'Uruguai',
  'punta del este': 'Uruguai',
  'colonia del sacramento': 'Uruguai',

  // Oceania
  'sydney': 'Austrália',
  'melbourne': 'Austrália',
  'brisbane': 'Austrália',
  'perth': 'Austrália',
  'adelaide': 'Austrália',
  'cairns': 'Austrália',
  'hobart': 'Austrália',
  'auckland': 'Nova Zelândia',
  'wellington': 'Nova Zelândia',
  'christchurch': 'Nova Zelândia',
  'queenstown': 'Nova Zelândia',
  'fiji': 'Fiji',
  'nadi': 'Fiji',
  'honolulu': 'Estados Unidos',
  'samoa': 'Samoa',
  'apia': 'Samoa',
  'tonga': 'Tonga',
  'nuku\'alofa': 'Tonga',
}

/**
 * Função para buscar país a partir do local
 */
export function getCountryFromCity(city: string): string | null {
  const normalizedCity = city.toLowerCase().trim()
  return CITY_COUNTRY_MAP[normalizedCity] || null
}

/**
 * Função para buscar sugestões de cidades
 */
export function getCitySuggestions(input: string): string[] {
  if (!input || input.length < 2) return []
  
  const normalized = input.toLowerCase().trim()
  const suggestions = Object.keys(CITY_COUNTRY_MAP).filter(city =>
    city.startsWith(normalized)
  )
  
  return [...new Set(suggestions)].slice(0, 10)
}
