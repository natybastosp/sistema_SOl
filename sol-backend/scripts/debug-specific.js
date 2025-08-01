// Debug específico para identificar erro 500
const axios = require('axios');

async function debugSpecific() {
  console.log('🔍 Debug específico do erro 500...\n');

  const BASE_URL = 'http://localhost:3000';

  try {
    // 1. Testar endpoint GET primeiro (mais simples)
    console.log('1️⃣ Testando GET /api/auth/register...');
    
    const getResponse = await axios.get(`${BASE_URL}/api/auth/register`);
    console.log('✅ GET funciona:', getResponse.status);
    console.log('📄 Resposta:', JSON.stringify(getResponse.data, null, 2));

    // 2. Testar POST com dados válidos
    console.log('\n2️⃣ Testando POST /api/auth/register...');
    
    const postData = {
      name: 'Debug User',
      email: `debug${Date.now()}@teste.com`,
      password: 'senha123',
      musicPreferences: ['Rock']
    };

    console.log('📝 Enviando dados:', JSON.stringify(postData, null, 2));

    const postResponse = await axios.post(`${BASE_URL}/api/auth/register`, postData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ POST funcionou:', postResponse.status);
    console.log('📄 Resposta:', JSON.stringify(postResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Erro capturado:');
    
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Data:`, error.response.data);
      
      if (error.response.status === 500) {
        console.log('\n🚨 ERRO 500 - Erro interno do servidor');
        console.log('📋 Possíveis causas:');
        console.log('1. Arquivo de rota não existe');
        console.log('2. Prisma não configurado');
        console.log('3. Dependências faltando');
        console.log('4. Erro no código da rota');
      }
    } else {
      console.log('❌ Erro:', error.message);
    }
  }
}

debugSpecific();
