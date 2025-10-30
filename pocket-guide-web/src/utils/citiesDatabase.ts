/**
 * Database de cidades principais para autocomplete
 * Fallback quando Mapbox não responde
 */

export interface City {
  name: string;
  country: string;
  aliases?: string[]; // Variações do nome da cidade
}

export const CITIES_DATABASE: City[] = [
  // Brasil
  { name: 'São Paulo', country: 'Brasil', aliases: ['Sao Paulo', 'SP'] },
  { name: 'Rio de Janeiro', country: 'Brasil', aliases: ['Rio', 'RJ'] },
  { name: 'Belo Horizonte', country: 'Brasil', aliases: ['BH', 'Belo Horizonte'] },
  { name: 'Brasília', country: 'Brasil', aliases: ['Brasilia', 'DF'] },
  { name: 'Salvador', country: 'Brasil', aliases: ['Bahia'] },
  { name: 'Fortaleza', country: 'Brasil', aliases: ['CE'] },
  { name: 'Manaus', country: 'Brasil', aliases: ['AM'] },
  { name: 'Recife', country: 'Brasil', aliases: ['PE'] },
  { name: 'Porto Alegre', country: 'Brasil', aliases: ['RS'] },
  { name: 'Curitiba', country: 'Brasil', aliases: ['PR'] },
  { name: 'Belém', country: 'Brasil', aliases: ['Belem', 'PA'] },
  { name: 'Goiânia', country: 'Brasil', aliases: ['Goiania', 'GO'] },
  { name: 'Maceió', country: 'Brasil', aliases: ['Maceio', 'AL'] },
  { name: 'Natal', country: 'Brasil', aliases: ['RN'] },
  { name: 'Teresina', country: 'Brasil', aliases: ['PI'] },
  { name: 'João Pessoa', country: 'Brasil', aliases: ['Joao Pessoa', 'PB'] },
  { name: 'São Luís', country: 'Brasil', aliases: ['Sao Luis', 'MA'] },
  { name: 'Campo Grande', country: 'Brasil', aliases: ['MS'] },
  { name: 'Florianópolis', country: 'Brasil', aliases: ['Florianopolis', 'SC'] },
  { name: 'Palmas', country: 'Brasil', aliases: ['TO'] },
  { name: 'Boa Vista', country: 'Brasil', aliases: ['RR'] },
  { name: 'Rio Branco', country: 'Brasil', aliases: ['AC'] },
  { name: 'Macapá', country: 'Brasil', aliases: ['Macapa', 'AP'] },
  { name: 'Cuiabá', country: 'Brasil', aliases: ['Cuiaba', 'MT'] },
  { name: 'Blumenau', country: 'Brasil' },
  { name: 'Foz do Iguaçu', country: 'Brasil', aliases: ['Foz do Iguazu', 'Foz'] },
  { name: 'Ouro Preto', country: 'Brasil' },
  { name: 'Paraty', country: 'Brasil' },
  { name: 'Buzios', country: 'Brasil', aliases: ['Búzios'] },
  { name: 'Angra dos Reis', country: 'Brasil' },
  { name: 'Tiradentes', country: 'Brasil' },
  { name: 'Diamantina', country: 'Brasil' },
  { name: 'Marreco', country: 'Brasil' },
  { name: 'Lençóis', country: 'Brasil', aliases: ['Lencois'] },
  { name: 'Maragogi', country: 'Brasil' },
  { name: 'Jericoacoara', country: 'Brasil' },
  { name: 'Pipa', country: 'Brasil' },
  { name: 'Fernando de Noronha', country: 'Brasil' },
  { name: 'Alter do Chão', country: 'Brasil' },
  { name: 'Barreirinhas', country: 'Brasil' },
  { name: 'Bonito', country: 'Brasil' },
  { name: 'Extrema', country: 'Brasil' },
  { name: 'Vila Velha', country: 'Brasil', aliases: ['Vila Velha, ES'] },
  { name: 'Vitória', country: 'Brasil', aliases: ['Vitoria'] },

  // Portugal
  { name: 'Lisboa', country: 'Portugal', aliases: ['Lisbon', 'Lisbora'] },
  { name: 'Porto', country: 'Portugal' },
  { name: 'Covilhã', country: 'Portugal', aliases: ['Covilha'] },
  { name: 'Aveiro', country: 'Portugal' },
  { name: 'Évora', country: 'Portugal', aliases: ['Evora'] },
  { name: 'Braga', country: 'Portugal' },
  { name: 'Fátima', country: 'Portugal', aliases: ['Fatima'] },
  { name: 'Cascais', country: 'Portugal' },
  { name: 'Sintra', country: 'Portugal' },

  // Espanha
  { name: 'Barcelona', country: 'Espanha', aliases: ['Spain'] },
  { name: 'Madrid', country: 'Espanha' },
  { name: 'Sevilha', country: 'Espanha', aliases: ['Seville'] },
  { name: 'Valência', country: 'Espanha', aliases: ['Valencia'] },
  { name: 'Bilbao', country: 'Espanha' },
  { name: 'Palma de Maiorca', country: 'Espanha', aliases: ['Palma'] },
  { name: 'San Sebastián', country: 'Espanha', aliases: ['San Sebastian'] },
  { name: 'Córdoba', country: 'Espanha', aliases: ['Cordoba'] },
  { name: 'Malagá', country: 'Espanha', aliases: ['Malaga'] },
  { name: 'Toledo', country: 'Espanha' },
  { name: 'Salamanca', country: 'Espanha' },
  { name: 'Segóvia', country: 'Espanha', aliases: ['Segovia'] },
  { name: 'Ávila', country: 'Espanha', aliases: ['Avila'] },

  // Itália
  { name: 'Roma', country: 'Itália', aliases: ['Rome'] },
  { name: 'Milão', country: 'Itália', aliases: ['Milan', 'Milano'] },
  { name: 'Florença', country: 'Itália', aliases: ['Florence', 'Firenze'] },
  { name: 'Veneza', country: 'Itália', aliases: ['Venice', 'Venezia'] },
  { name: 'Nápoles', country: 'Itália', aliases: ['Naples', 'Napoli'] },
  { name: 'Bolonha', country: 'Itália', aliases: ['Bologna'] },
  { name: 'Gênova', country: 'Itália', aliases: ['Genoa', 'Genova'] },
  { name: 'Torino', country: 'Itália', aliases: ['Turin'] },
  { name: 'Amalfi', country: 'Itália' },
  { name: 'Positano', country: 'Itália' },
  { name: 'Capri', country: 'Itália' },

  // França
  { name: 'Paris', country: 'França' },
  { name: 'Lyon', country: 'França' },
  { name: 'Marseille', country: 'França', aliases: ['Marselha'] },
  { name: 'Toulouse', country: 'França' },
  { name: 'Bordeaux', country: 'França', aliases: ['Bordéu'] },
  { name: 'Lille', country: 'França' },
  { name: 'Nice', country: 'França', aliases: ['Niça'] },
  { name: 'Cannes', country: 'França' },
  { name: 'Nantes', country: 'França' },
  { name: 'Strasbourg', country: 'França', aliases: ['Strasburgo'] },
  { name: 'Versailles', country: 'França', aliases: ['Versalhes'] },
  { name: 'Versailles', country: 'França', aliases: ['Versalhes'] },

  // Alemanha
  { name: 'Berlim', country: 'Alemanha', aliases: ['Berlin'] },
  { name: 'Munique', country: 'Alemanha', aliases: ['Munich', 'München'] },
  { name: 'Hamburgo', country: 'Alemanha', aliases: ['Hamburg'] },
  { name: 'Colônia', country: 'Alemanha', aliases: ['Cologne', 'Köln'] },
  { name: 'Frankfurt', country: 'Alemanha' },
  { name: 'Düsseldorf', country: 'Alemanha' },
  { name: 'Dortmund', country: 'Alemanha' },
  { name: 'Stuttgart', country: 'Alemanha' },

  // Reino Unido
  { name: 'Londres', country: 'Reino Unido', aliases: ['London'] },
  { name: 'Manchester', country: 'Reino Unido' },
  { name: 'Liverpool', country: 'Reino Unido' },
  { name: 'Birmingham', country: 'Reino Unido' },
  { name: 'Oxford', country: 'Reino Unido' },
  { name: 'Cambridge', country: 'Reino Unido' },
  { name: 'Bath', country: 'Reino Unido' },
  { name: 'York', country: 'Reino Unido' },
  { name: 'Edimburgo', country: 'Reino Unido', aliases: ['Edinburgh'] },
  { name: 'Dublin', country: 'Irlanda' },

  // EUA
  { name: 'Nova York', country: 'Estados Unidos', aliases: ['New York', 'NYC'] },
  { name: 'Los Angeles', country: 'Estados Unidos', aliases: ['LA'] },
  { name: 'Chicago', country: 'Estados Unidos' },
  { name: 'Miami', country: 'Estados Unidos' },
  { name: 'San Francisco', country: 'Estados Unidos' },
  { name: 'Las Vegas', country: 'Estados Unidos', aliases: ['Vegas'] },
  { name: 'Washington', country: 'Estados Unidos', aliases: ['DC'] },
  { name: 'Boston', country: 'Estados Unidos' },
  { name: 'Seattle', country: 'Estados Unidos' },
  { name: 'Austin', country: 'Estados Unidos' },
  { name: 'Denver', country: 'Estados Unidos' },
  { name: 'Orlando', country: 'Estados Unidos' },

  // Colômbia
  { name: 'Bogotá', country: 'Colômbia', aliases: ['Bogota'] },
  { name: 'Medellín', country: 'Colômbia', aliases: ['Medellin'] },
  { name: 'Cartagena', country: 'Colômbia' },
  { name: 'Santa Marta', country: 'Colômbia' },
  { name: 'Cali', country: 'Colômbia' },

  // Peru
  { name: 'Lima', country: 'Peru' },
  { name: 'Cusco', country: 'Peru', aliases: ['Cuzco'] },
  { name: 'Machu Picchu', country: 'Peru', aliases: ['Machupicchu'] },
  { name: 'Arequipa', country: 'Peru' },
  { name: 'Iquitos', country: 'Peru', aliases: ['Iquitos'] },

  // Chile
  { name: 'Santiago', country: 'Chile' },
  { name: 'Valparaíso', country: 'Chile', aliases: ['Valparaiso'] },
  { name: 'Atacama', country: 'Chile' },
  { name: 'Puerto Montt', country: 'Chile' },

  // Argentina
  { name: 'Buenos Aires', country: 'Argentina' },
  { name: 'Córdoba', country: 'Argentina', aliases: ['Cordoba'] },
  { name: 'Mendoza', country: 'Argentina' },
  { name: 'Salta', country: 'Argentina' },

  // Japão
  { name: 'Tóquio', country: 'Japão', aliases: ['Tokyo', 'Tokio'] },
  { name: 'Kyoto', country: 'Japão', aliases: ['Quioto'] },
  { name: 'Osaka', country: 'Japão' },
  { name: 'Hiroshima', country: 'Japão' },
  { name: 'Nagoya', country: 'Japão' },

  // Tailândia
  { name: 'Bangkok', country: 'Tailândia', aliases: ['Banguecoque'] },
  { name: 'Chiang Mai', country: 'Tailândia' },
  { name: 'Phuket', country: 'Tailândia' },

  // Vietnã
  { name: 'Hanói', country: 'Vietnã', aliases: ['Hanoi', 'Hanoy'] },
  { name: 'Ho Chi Minh', country: 'Vietnã', aliases: ['Saigon'] },

  // Austrália
  { name: 'Sydney', country: 'Austrália', aliases: ['Sydney'] },
  { name: 'Melbourne', country: 'Austrália' },
  { name: 'Brisbane', country: 'Austrália' },
  { name: 'Perth', country: 'Austrália' },

  // Nova Zelândia
  { name: 'Auckland', country: 'Nova Zelândia' },
  { name: 'Wellington', country: 'Nova Zelândia' },
  { name: 'Christchurch', country: 'Nova Zelândia' },

  // Egito
  { name: 'Cairo', country: 'Egito', aliases: ['Cairo'] },
  { name: 'Alexandria', country: 'Egito', aliases: ['Alexandria'] },

  // Marrocos
  { name: 'Marrakech', country: 'Marrocos', aliases: ['Marraquexe'] },
  { name: 'Fés', country: 'Marrocos', aliases: ['Fez'] },
  { name: 'Casablanca', country: 'Marrocos' },
  { name: 'Tânger', country: 'Marrocos', aliases: ['Tanger'] },

  // Grécia
  { name: 'Atenas', country: 'Grécia', aliases: ['Athens', 'Atena'] },
  { name: 'Santorini', country: 'Grécia' },
  { name: 'Mykonos', country: 'Grécia' },
  { name: 'Creta', country: 'Grécia', aliases: ['Crete'] },

  // Turquia
  { name: 'Istambul', country: 'Turquia', aliases: ['Istanbul'] },
  { name: 'Capadócia', country: 'Turquia', aliases: ['Cappadocia'] },
  { name: 'Éfeso', country: 'Turquia', aliases: ['Ephesus'] },

  // México
  { name: 'Cidade do México', country: 'México', aliases: ['Mexico City', 'Ciudad de México'] },
  { name: 'Cancún', country: 'México', aliases: ['Cancun'] },
  { name: 'Playa del Carmen', country: 'México' },
  { name: 'Cozumel', country: 'México' },
];

/**
 * Busca cidades no banco de dados local
 */
export function searchCitiesLocal(query: string): City[] {
  if (!query.trim()) return [];

  const searchTerm = query.toLowerCase().trim();

  return CITIES_DATABASE.filter(city => {
    // Buscar no nome principal
    if (city.name.toLowerCase().includes(searchTerm)) {
      return true;
    }

    // Buscar nos aliases
    if (city.aliases?.some(alias => alias.toLowerCase().includes(searchTerm))) {
      return true;
    }

    return false;
  }).slice(0, 10); // Limitar a 10 resultados
}

/**
 * Busca o país de uma cidade no banco de dados local
 */
export function getCountryFromCityLocal(cityName: string): string | null {
  const city = CITIES_DATABASE.find(c => 
    c.name.toLowerCase() === cityName.toLowerCase() ||
    c.aliases?.some(alias => alias.toLowerCase() === cityName.toLowerCase())
  );
  
  return city?.country || null;
}
