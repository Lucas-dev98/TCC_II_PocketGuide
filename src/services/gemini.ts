/**
 * Google Gemini API Service
 * Generates intelligent itineraries based on user preferences
 */

import { Attraction } from "../types";

interface GeminiPromptParams {
  destination: string;
  startDate: Date;
  endDate: Date;
  userTags: string[];
}

interface ValidatedAttraction {
  day: number;
  time: string;
  name: string;
  duration: number;
  reason: string;
  tip: string;
  location: {
    lat: number;
    lng: number;
  };
}

/**
 * Validate attraction data from Gemini response
 */
const validateAttraction = (attraction: any, index: number): ValidatedAttraction => {
  if (!attraction.day || !attraction.time || !attraction.name || !attraction.duration) {
    throw new Error(
      `Atração ${index} incompleta: campos obrigatórios faltando`
    );
  }

  if (attraction.day < 1 || attraction.day > 31) {
    throw new Error(`Dia inválido: ${attraction.day}`);
  }

  if (!/^\d{2}:\d{2}$/.test(attraction.time)) {
    throw new Error(`Hora inválida: ${attraction.time}`);
  }

  if (
    !attraction.location ||
    typeof attraction.location.lat !== "number" ||
    typeof attraction.location.lng !== "number"
  ) {
    throw new Error(`Localização inválida na atração ${index}`);
  }

  if (
    attraction.location.lat < -90 ||
    attraction.location.lat > 90
  ) {
    throw new Error(`Latitude inválida: ${attraction.location.lat}`);
  }

  if (
    attraction.location.lng < -180 ||
    attraction.location.lng > 180
  ) {
    throw new Error(`Longitude inválida: ${attraction.location.lng}`);
  }

  return {
    day: attraction.day,
    time: attraction.time,
    name: String(attraction.name),
    duration: Number(attraction.duration),
    reason: String(attraction.reason || ""),
    tip: String(attraction.tip || ""),
    location: {
      lat: attraction.location.lat,
      lng: attraction.location.lng,
    },
  };
};

/**
 * Generate an itinerary using Google Gemini API
 */
export const generateItineraryWithGemini = async (
  params: GeminiPromptParams
): Promise<Attraction[]> => {
  const { destination, startDate, endDate, userTags } = params;

  // Calculate number of days
  const daysDifference = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const prompt = `Você é um especialista em roteiros de viagem com experiência em ${destination}.

Crie um roteiro de ${daysDifference} dias em ${destination} para um viajante com:
- Interesses: ${userTags.join(", ")}
- Data de início: ${startDate.toLocaleDateString("pt-BR")}
- Data de término: ${endDate.toLocaleDateString("pt-BR")}

INSTRUÇÕES:
1. Crie ${daysDifference} dias de roteiro completo
2. Distribua as atrações igualmente entre os dias (4-6 por dia)
3. Cada atração deve ter um horário realista (09:00-20:00)
4. Considere tempo de deslocamento entre atrações
5. Priorize atrações alinhadas com os interesses do viajante
6. Inclua pelo menos 1 experiência gastronômica por dia
7. Adicione dicas práticas e realistas
8. Locais devem ter coordenadas geográficas precisas

FORMATO: Retorne APENAS um array JSON válido, sem explicações adicionais.
Cada item deve ter EXATAMENTE estes campos:

[
  {
    "day": number,
    "time": "HH:00" ou "HH:30",
    "name": "string",
    "duration": number (em minutos),
    "reason": "string (por que visitar)",
    "tip": "string (dica prática)",
    "location": {
      "lat": number (precisão: 2-4 casas decimais),
      "lng": number (precisão: 2-4 casas decimais)
    }
  }
]

RESPONDA AGORA:`;

  try {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_KEY não configurada em .env - adicione EXPO_PUBLIC_GEMINI_KEY"
      );
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Gemini API error: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error("Resposta vazia da API Gemini");
    }

    // Clean JSON if it has markdown code blocks
    let jsonString = responseText.trim();
    if (jsonString.includes("```json")) {
      jsonString = jsonString.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonString.includes("```")) {
      jsonString = jsonString.replace(/```\n?/g, "");
    }

    // Parse JSON
    const attractions: ValidatedAttraction[] = JSON.parse(jsonString);

    // Validate response
    if (!Array.isArray(attractions)) {
      throw new Error("Resposta não é um array");
    }

    if (attractions.length === 0) {
      throw new Error("Roteiro vazio retornado pela IA");
    }

    // Validate each attraction
    const validatedAttractions: Attraction[] = attractions.map(
      (attr, index) => {
        const validated = validateAttraction(attr, index);
        return {
          ...validated,
          id: `attr_${Date.now()}_${index}`,
          day: validated.day,
          time: validated.time,
          name: validated.name,
          duration: validated.duration,
          reason: validated.reason,
          tip: validated.tip,
          location: validated.location,
        } as Attraction;
      }
    );

    return validatedAttractions;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(
        `Erro ao fazer parse da resposta JSON: ${error.message}`
      );
    }
    throw error;
  }
};
