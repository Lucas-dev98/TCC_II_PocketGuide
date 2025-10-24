/**
 * Teste de Mapas - Verifica qual está funcionando
 * Para usar: cole este código no Console do navegador (F12)
 */

// ============================================
// 1. TESTAR GOOGLE MAPS
// ============================================
console.log('🗺️ TESTE DE MAPAS');
console.log('=====================================');

// Verificar se Google Maps API Key existe
const googleMapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
console.log('1️⃣ Google Maps API Key:', googleMapsKey === 'your_google_maps_api_key' ? '❌ FALTA' : '✅ CONFIGURADA');

// ============================================
// 2. TESTAR MAPBOX
// ============================================
const mapboxKey = import.meta.env.VITE_MAPBOX_API_KEY;
console.log('2️⃣ Mapbox API Key:', mapboxKey ? '✅ CONFIGURADA' : '❌ FALTA');
console.log('   Valor:', mapboxKey?.substring(0, 20) + '...');

// ============================================
// 3. TESTAR NOMINATIM (OpenStreetMap)
// ============================================
console.log('3️⃣ OpenStreetMap/Nominatim: ✅ GRATUITO (sem API key)');

// ============================================
// RESUMO
// ============================================
console.log('\n📊 RESUMO:');
console.log('- Google Maps:', googleMapsKey === 'your_google_maps_api_key' ? '❌ Não configurado' : '✅ Pronto');
console.log('- Mapbox:', mapboxKey ? '✅ Pronto' : '❌ Não configurado');
console.log('- OpenStreetMap:', '✅ Sempre disponível (grátis)');

console.log('\n💡 RECOMENDAÇÃO:');
console.log('Use Mapbox (tem chave configurada e é gratuito até 50k requests/mês)');
console.log('Backup: OpenStreetMap (completamente grátis)');
