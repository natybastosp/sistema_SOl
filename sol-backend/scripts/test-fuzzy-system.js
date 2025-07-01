// Script de Teste do Sistema de Lógica Fuzzy - Versão Corrigida
const path = require("path");
const fs = require("fs");

// Usar caminho absoluto e verificar existência
const fuzzyModulePath = path.join(
  __dirname,
  "..",
  "src",
  "lib",
  "fuzzy",
  "emotionalMusicRecommendation.js"
);

console.log("🔍 Verificando módulo fuzzy...");
console.log(`📁 Procurando em: ${fuzzyModulePath}`);

if (!fs.existsSync(fuzzyModulePath)) {
  console.error("❌ Arquivo não encontrado!");
  console.log("📂 Estrutura atual de src/lib/fuzzy:");
  const fuzzyDir = path.join(__dirname, "..", "src", "lib", "fuzzy");
  if (fs.existsSync(fuzzyDir)) {
    const files = fs.readdirSync(fuzzyDir);
    files.forEach((file) => {
      const fullPath = path.join(fuzzyDir, file);
      const stats = fs.statSync(fullPath);
      console.log(`   ${file} (${stats.size} bytes)`);
    });
  }
  process.exit(1);
}

// Importar o módulo
const { generateFuzzyMusicRecommendation } = require(fuzzyModulePath);

// Casos de teste
const testCases = {
  balanced: {
    name: "Estado Equilibrado",
    description: "Pessoa se sentindo bem, sem grandes extremos emocionais",
    emotionalState: {
      anger: 0.1,
      fear: 0.2,
      joy: 0.6,
      sadness: 0.1,
      surprise: 0.3,
    },
    preferredGenres: ["pop", "jazz", "indie"],
  },
  very_sad: {
    name: "Tristeza Profunda",
    description: "Pessoa passando por momento de tristeza intensa",
    emotionalState: {
      anger: 0.2,
      fear: 0.4,
      joy: 0.1,
      sadness: 0.8,
      surprise: 0.1,
    },
    preferredGenres: ["rock", "classical", "ambient"],
  },
  anxious: {
    name: "Ansiedade Alta",
    description: "Pessoa com altos níveis de ansiedade e apreensão",
    emotionalState: {
      anger: 0.3,
      fear: 0.7,
      joy: 0.2,
      sadness: 0.4,
      surprise: 0.5,
    },
    preferredGenres: ["trilha sonora", "funk carioca", "lo-fi"],
  },
  very_happy: {
    name: "Alegria Intensa",
    description: "Pessoa em estado de alegria e felicidade elevadas",
    emotionalState: {
      anger: 0.1,
      fear: 0.1,
      joy: 0.9,
      sadness: 0.0,
      surprise: 0.6,
    },
    preferredGenres: ["dance", "reggae", "samba"],
  },
};

async function runFuzzyTests() {
  console.log("✅ Módulo fuzzy encontrado e carregado!");
  console.log("");
  console.log("🧠 SOL - Teste do Sistema de Lógica Fuzzy");
  console.log("==========================================");
  console.log("");

  for (const [testId, testCase] of Object.entries(testCases)) {
    console.log(`📋 CASO DE TESTE: ${testCase.name}`);
    console.log(`📖 Descrição: ${testCase.description}`);
    console.log("");

    // Mostrar estado emocional
    console.log("😊 Estado Emocional de Entrada:");
    Object.entries(testCase.emotionalState).forEach(([emotion, value]) => {
      const percentage = (value * 100).toFixed(1);
      const bar = "█".repeat(Math.round(value * 10));
      console.log(`   ${emotion.padEnd(8)}: ${percentage.padStart(5)}% ${bar}`);
    });
    console.log("");

    // Mostrar preferências musicais
    console.log("🎵 Preferências Musicais:");
    console.log(`   ${testCase.preferredGenres.join(", ")}`);
    console.log("");

    try {
      const startTime = Date.now();

      const recommendation = await generateFuzzyMusicRecommendation({
        userId: `test-${testId}`,
        currentEmotion: testCase.emotionalState,
        preferredGenres: testCase.preferredGenres,
        playlistSize: 8,
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log("🎯 RESULTADOS DA ANÁLISE FUZZY:");
      console.log(`   ⏱️  Tempo: ${duration}ms`);
      console.log(
        `   🎯 Confiança: ${(recommendation.data.confidence * 100).toFixed(1)}%`
      );
      console.log("");

      console.log("💡 EXPLICAÇÃO DO SISTEMA:");
      console.log(`   "${recommendation.data.explanation}"`);
      console.log("");

      if (
        recommendation.data.playlist &&
        recommendation.data.playlist.length > 0
      ) {
        console.log("🎵 AMOSTRA DA PLAYLIST:");
        recommendation.data.playlist.slice(0, 3).forEach((music, index) => {
          console.log(`   ${index + 1}. "${music.name}" - ${music.artist}`);
          console.log(
            `      Gênero: ${music.genre} | Score: ${(
              music.fuzzyScore * 100
            ).toFixed(1)}%`
          );
        });

        if (recommendation.data.playlist.length > 3) {
          console.log(
            `   ... e mais ${recommendation.data.playlist.length - 3} músicas`
          );
        }
      } else {
        console.log("⚠️  Nenhuma música encontrada para este estado emocional");
      }
    } catch (error) {
      console.error("❌ ERRO NO TESTE:", error.message);
    }

    console.log("");
    console.log("═".repeat(60));
    console.log("");
  }

  console.log("🎉 TESTE COMPLETO FINALIZADO!");
}

// Executar testes
if (require.main === module) {
  runFuzzyTests()
    .then(() => {
      console.log("🏁 Todos os testes concluídos!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Erro crítico:", error);
      process.exit(1);
    });
}
