/**
 * Debug helper para inspecionar estrutura do itinerary
 */

export function inspectItinerary(itinerary: any, depth: number = 3): string {
  if (!itinerary) return 'null/undefined';
  
  let result = '';
  
  // Mostrar tipo
  result += `Type: ${typeof itinerary}\n`;
  result += `Is Array: ${Array.isArray(itinerary)}\n`;
  
  if (typeof itinerary !== 'object') {
    return result;
  }
  
  // Mostrar chaves
  const keys = Object.keys(itinerary);
  result += `Keys: ${keys.join(', ')}\n`;
  
  if (depth === 0) return result;
  
  // Mostrar primeiros elementos
  for (const key of keys.slice(0, 3)) {
    const value = itinerary[key];
    result += `\n  ${key}: `;
    
    if (Array.isArray(value)) {
      result += `Array[${value.length}] `;
      if (value.length > 0) {
        result += `\n    First item: ${JSON.stringify(value[0], null, 2).substring(0, 200)}...`;
      }
    } else if (typeof value === 'object' && value !== null) {
      result += `Object { ${Object.keys(value).join(', ')} } `;
      result += `\n    ${JSON.stringify(value, null, 2).substring(0, 200)}...`;
    } else {
      result += `${value}`;
    }
  }
  
  return result;
}

export function dumpItineraryToConsole(itinerary: any): void {
  const formatted = `
====== ITINERARY DEBUG ======
${inspectItinerary(itinerary)}
====== END DEBUG ======
  `;
  
  console.log(formatted);
  console.table(itinerary);
}
