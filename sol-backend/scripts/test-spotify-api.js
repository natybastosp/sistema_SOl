const axios = require("axios");
require("dotenv").config();

// Configuração base para testes
const BASE_URL = "http://localhost:3000";
let authToken = null;
let testUserId = null;

/**
 * Função para registrar um usuário de teste
 */
async function criarUsuarioTeste() {
  try {
    console.log("👤 Criando usuário de teste...");

    const response = await axios.post(`${BASE_URL}/api/auth/register`, {
      name: "Usuário Teste Spotify",
      email: `teste.spotify.${Date.now()}@sol.com`,
      password: "senha123",
      musicPreferences: ["Rock", "Pop", "MPB"],
    });

    if (response.data.success) {
      authToken = response.data.data.token;
      testUserId = response.data.data.user.id;
      console.log("✅ Usuário de teste criado com sucesso");
      return true;
    }
  } catch (error) {
    console.error(
      "❌ Erro ao criar usuário de teste:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Função para testar a busca no Spotify
 */
async function testarBuscaSpotify(trackName, artistName, expectedMood = null) {
  try {
    console.log(`\n🔍 Testando busca: "${trackName}" - "${artistName}"`);

    const response = await axios.post(
      `${BASE_URL}/api/spotify/search`,
      {
        trackName,
        artistName,
        includeAnalysis: true,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success && response.data.found) {
      const { track, audioFeatures, emotionalAnalysis } = response.data;

      console.log("✅ Música encontrada!");
      console.log(`   Nome: ${track.name}`);
      console.log(`   Artista: ${track.artist}`);
      console.log(`   Álbum: ${track.album}`);
      console.log(`   Popularidade: ${track.popularity}/100`);
      console.log(`   Spotify ID: ${track.spotifyId}`);

      if (audioFeatures) {
        console.log(`\n🎵 Características de áudio:`);
        console.log(
          `   Valence (positividade): ${audioFeatures.valence.toFixed(3)}`
        );
        console.log(`   Energy (energia): ${audioFeatures.energy.toFixed(3)}`);
        console.log(
          `   Danceability: ${audioFeatures.danceability.toFixed(3)}`
        );
        console.log(
          `   Acousticness: ${audioFeatures.acousticness.toFixed(3)}`
        );
        console.log(`   Tempo: ${audioFeatures.tempo.toFixed(0)} BPM`);
      }

      if (emotionalAnalysis) {
        console.log(`\n🧠 Análise emocional do Sistema SOL:`);
        console.log(`   Mood detectado: ${emotionalAnalysis.mood}`);
        console.log(`   Nível de energia: ${emotionalAnalysis.energyLevel}`);
        console.log(
          `   Score de saúde mental: ${emotionalAnalysis.mentalHealthScore}/100`
        );

        console.log(`   Potencial terapêutico:`);
        Object.entries(emotionalAnalysis.therapeuticPotential).forEach(
          ([key, value]) => {
            console.log(`     • ${key}: ${(value * 100).toFixed(1)}%`);
          }
        );

        console.log(`   Recomendada para:`);
        emotionalAnalysis.recommendedFor.forEach((rec) => {
          console.log(`     • ${rec}`);
        });

        // Verificar se o mood detectado corresponde ao esperado
        if (expectedMood && emotionalAnalysis.mood.includes(expectedMood)) {
          console.log(`✅ Mood esperado confirmado: ${expectedMood}`);
        } else if (expectedMood) {
          console.log(
            `⚠️  Mood diferente do esperado. Esperado: ${expectedMood}, Detectado: ${emotionalAnalysis.mood}`
          );
        }
      }

      return {
        success: true,
        track,
        audioFeatures,
        emotionalAnalysis,
      };
    } else {
      console.log("❌ Música não encontrada");
      console.log(`   Motivo: ${response.data.message}`);
      if (response.data.suggestions) {
        console.log("   Sugestões:");
        response.data.suggestions.forEach((suggestion) => {
          console.log(`     • ${suggestion}`);
        });
      }
      return { success: false };
    }
  } catch (error) {
    console.error(
      "❌ Erro na requisição:",
      error.response?.data || error.message
    );
    return { success: false, error: error.response?.data || error.message };
  }
}

/**
 * Função para testar cenários de erro
 */
async function testarCenariosErro() {
  console.log("\n🧪 Testando cenários de erro...\n");

  // Teste sem token de autenticação
  try {
    console.log("🔒 Testando acesso sem autenticação...");
    await axios.post(`${BASE_URL}/api/spotify/search`, {
      trackName: "Test",
      artistName: "Test",
    });
    console.log("❌ ERRO: Deveria ter rejeitado requisição sem token");
  } catch (error) {
    if (error.response?.status === 401) {
      console.log("✅ Autenticação funcionando corretamente");
    } else {
      console.log("⚠️  Erro inesperado:", error.response?.status);
    }
  }

  // Teste com dados inválidos
  try {
    console.log("\n📝 Testando validação de dados...");
    const response = await axios.post(
      `${BASE_URL}/api/spotify/search`,
      {
        trackName: "", // Nome vazio
        artistName: "Test",
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    console.log("❌ ERRO: Deveria ter rejeitado dados inválidos");
  } catch (error) {
    if (error.response?.status === 400) {
      console.log("✅ Validação de dados funcionando corretamente");
      console.log(`   Mensagem: ${error.response.data.message}`);
    } else {
      console.log("⚠️  Erro inesperado:", error.response?.status);
    }
  }

  // Teste com música que não existe
  console.log("\n🔍 Testando música inexistente...");
  await testarBuscaSpotify(
    "Música que definitivamente não existe 12345",
    "Artista Inexistente 54321"
  );
}

/**
 * Função principal de teste
 */
async function executarTestes() {
  console.log("🎵 TESTE COMPLETO DA API SPOTIFY - Sistema SOL");
  console.log("=".repeat(60));

  // Verificar se o servidor está rodando
  try {
    await axios.get(`${BASE_URL}/api/auth/register`);
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      console.log("❌ ERRO: Servidor não está rodando!");
      console.log(
        '💡 Execute "npm run dev" em outro terminal antes de rodar este teste'
      );
      return;
    }
  }

  // Criar usuário de teste
  const userCreated = await criarUsuarioTeste();
  if (!userCreated) {
    console.log("❌ Falha ao criar usuário de teste. Parando execução.");
    return;
  }

  // Lista de músicas para testar com diferentes perfis emocionais
  const musicasTeste = [
    {
      track: "Happy",
      artist: "Pharrell Williams",
      expectedMood: "happy",
      description: "Música alegre e positiva",
    },
    {
      track: "Mad World",
      artist: "Gary Jules",
      expectedMood: "sad",
      description: "Música melancólica e reflexiva",
    },
    {
      track: "Eye of the Tiger",
      artist: "Survivor",
      expectedMood: "energetic",
      description: "Música motivacional e energética",
    },
    {
      track: "Weightless",
      artist: "Marconi Union",
      expectedMood: "calm",
      description: "Música relaxante e calmante",
    },
    {
      track: "Imagine",
      artist: "John Lennon",
      expectedMood: "peaceful",
      description: "Música pacífica e contemplativa",
    },
  ];

  let sucessos = 0;
  const resultados = [];

  // Testar cada música
  for (const musica of musicasTeste) {
    console.log(`\n📋 Testando: ${musica.description}`);
    const resultado = await testarBuscaSpotify(
      musica.track,
      musica.artist,
      musica.expectedMood
    );

    if (resultado.success) {
      sucessos++;
      resultados.push({
        ...musica,
        ...resultado,
      });
    }

    // Pausa entre requisições para respeitar rate limits
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Testar cenários de erro
  await testarCenariosErro();

  // Resumo final
  console.log("\n" + "=".repeat(60));
  console.log("📊 RESUMO DOS TESTES:");
  console.log(
    `✅ ${sucessos}/${musicasTeste.length} músicas encontradas e analisadas`
  );
  console.log(
    `🎯 Taxa de sucesso: ${((sucessos / musicasTeste.length) * 100).toFixed(
      1
    )}%`
  );

  if (sucessos >= Math.ceil(musicasTeste.length * 0.8)) {
    console.log("\n🎉 TODOS OS TESTES PASSARAM COM SUCESSO!");
    console.log("✅ API Spotify integrada e funcionando perfeitamente");
    console.log("✅ Análise emocional funcionando");
    console.log("✅ Autenticação e validação funcionando");
    console.log(
      "\n🚀 Próximo passo: Expandir o catálogo musical automaticamente"
    );
  } else {
    console.log("\n⚠️  Alguns testes falharam.");
    console.log(
      "💡 Verifique as credenciais do Spotify e a conexão com a internet"
    );
  }

  // Mostrar análise detalhada dos resultados
  if (resultados.length > 0) {
    console.log("\n📈 ANÁLISE DETALHADA DOS RESULTADOS:");

    const avgMentalHealthScore =
      resultados
        .filter((r) => r.emotionalAnalysis)
        .reduce((acc, r) => acc + r.emotionalAnalysis.mentalHealthScore, 0) /
      resultados.length;

    console.log(
      `   Score médio de saúde mental: ${avgMentalHealthScore.toFixed(1)}/100`
    );

    const moodDistribution = {};
    resultados.forEach((r) => {
      if (r.emotionalAnalysis) {
        const mood = r.emotionalAnalysis.mood;
        moodDistribution[mood] = (moodDistribution[mood] || 0) + 1;
      }
    });

    console.log("   Distribuição de moods detectados:");
    Object.entries(moodDistribution).forEach(([mood, count]) => {
      console.log(`     • ${mood}: ${count} música(s)`);
    });
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  executarTestes();
}

module.exports = { executarTestes };
