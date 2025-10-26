#!/usr/bin/env node

/**
 * Script para testar a integração com Unsplash API
 * Uso: node test-unsplash.js
 */

const API_KEY = 'omoQEDqeYzSOiFWtAqGBCdz7jpDZGpaNZrthS_O-dlA';
const API_URL = 'https://api.unsplash.com';

async function testUnsplashAPI() {
  console.log('🧪 Testando Unsplash API Integration\n');
  console.log('📊 Configuração:');
  console.log(`   API Key: ${API_KEY.substring(0, 10)}...`);
  console.log(`   API URL: ${API_URL}`);
  console.log(`   Quota: 50/hora (modo demo)\n`);

  const testQueries = [
    'colosseum rome',
    'italian restaurant',
    'pizza italy',
    'museum rome',
    'nature landscape',
  ];

  console.log('🔍 Testando buscas:\n');

  for (const query of testQueries) {
    try {
      console.log(`   Buscando: "${query}"`);
      
      const url = new URL(`${API_URL}/search/photos`);
      url.searchParams.set('query', query);
      url.searchParams.set('client_id', API_KEY);
      url.searchParams.set('per_page', '1');
      url.searchParams.set('orientation', 'landscape');

      const response = await fetch(url.toString());

      if (!response.ok) {
        console.log(`   ❌ Erro: ${response.status} ${response.statusText}\n`);
        continue;
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const image = data.results[0];
        console.log(`   ✅ Encontrado!`);
        console.log(`      Fotógrafo: ${image.user.name}`);
        console.log(`      URL: ${image.urls.regular.substring(0, 50)}...\n`);
      } else {
        console.log(`   ⚠️ Nenhuma imagem encontrada\n`);
      }
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}\n`);
    }
  }

  console.log('✅ Teste concluído!');
  console.log('\n📝 Próximos passos:');
  console.log('   1. npm run dev (para testar no navegador)');
  console.log('   2. Abra http://localhost:5175');
  console.log('   3. Navegue para um dia com atrações');
  console.log('   4. Abra DevTools (F12) e veja os logs\n');
}

testUnsplashAPI().catch(console.error);
