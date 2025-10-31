#!/usr/bin/env node

/**
 * Script para testar o endpoint /api/ai/analyze
 *
 * Uso: node test-fuzzy-api.js
 */

const BASE_URL = process.env.API_URL || "http://localhost:3000";

// Dados de teste
const testCases = [
  {
    name: "Muito triste e com medo",
    data: {
      sadness: 8,
      joy: 2,
      anger: 1,
      fear: 7,
      surprise: 2,
    },
  },
  {
    name: "Muito alegre e energizado",
    data: {
      sadness: 1,
      joy: 9,
      anger: 2,
      fear: 1,
      surprise: 3,
    },
  },
  {
    name: "Equilibrado",
    data: {
      sadness: 5,
      joy: 5,
      anger: 5,
      fear: 5,
      surprise: 5,
    },
  },
  {
    name: "Raivoso e surpreso",
    data: {
      sadness: 2,
      joy: 3,
      anger: 9,
      fear: 2,
      surprise: 8,
    },
  },
];

/**
 * Simula autenticação (você precisa ter um token válido)
 */
function getAuthToken() {
  // Em produção, você faria login para obter um token
  // Por enquanto, retornamos um token mock (será rejeitado no backend)
  return process.env.AUTH_TOKEN || "mock-token";
}

/**
 * Faz requisição para a API
 */
async function testFuzzyApi(testCase) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`🧪 Teste: ${testCase.name}`);
  console.log(`${"=".repeat(60)}`);
  console.log("📤 Dados enviados:", JSON.stringify(testCase.data, null, 2));

  try {
    const response = await fetch(`${BASE_URL}/api/ai/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(testCase.data),
    });

    const responseData = await response.json();

    console.log(`\n📥 Status: ${response.status}`);
    console.log("📥 Resposta:", JSON.stringify(responseData, null, 2));

    if (response.ok && responseData.success) {
      console.log("✅ TESTE PASSOU");
      console.log(
        `   - Recomendação: ${responseData.data.fuzzy_output.recommendation}`
      );
      console.log(
        `   - Confiança: ${(
          responseData.data.fuzzy_output.confidence * 100
        ).toFixed(0)}%`
      );
      console.log(
        `   - Gêneros: ${responseData.data.fuzzy_output.genres.join(", ")}`
      );
      console.log(
        `   - Faixas encontradas: ${responseData.data.fuzzy_output.top_tracks.length}`
      );
    } else {
      console.log("❌ TESTE FALHOU");
      if (response.status === 401) {
        console.log("   → Erro de autenticação. Faça login primeiro.");
      }
    }
  } catch (error) {
    console.log("❌ ERRO NA REQUISIÇÃO");
    console.log(`   → ${error.message}`);
    console.log(
      `\n💡 Dica: Verifique se o servidor está rodando em ${BASE_URL}`
    );
    console.log("   → Execute: npm run dev");
  }
}

/**
 * Roda todos os testes
 */
async function runAllTests() {
  console.log("🚀 Iniciando testes de integração Fuzzy\n");
  console.log(`📍 URL: ${BASE_URL}`);
  console.log(`🔐 Token: ${getAuthToken().substring(0, 20)}...`);

  for (const testCase of testCases) {
    await testFuzzyApi(testCase);
    // Pequeno delay entre requisições
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log("✅ Testes finalizados!");
  console.log(`${"=".repeat(60)}\n`);
}

// Executar
runAllTests().catch(console.error);
