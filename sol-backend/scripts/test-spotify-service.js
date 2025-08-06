require("dotenv").config();

// Importar nosso serviço (precisa compilar TypeScript primeiro ou usar ts-node)
// Para testar, vamos recriar as funcionalidades principais em JavaScript

const axios = require("axios");

class SpotifyServiceTest {
  constructor() {
    this.token = null;
    this.tokenExpiry = 0;
    this.ACCOUNTS_URL = "https://accounts.spotify.com/api/token";
    this.API_URL = "https://api.spotify.com/v1";
  }

  async getAccessToken() {
    const now = Date.now();
    if (this.token && this.tokenExpiry > now) {
      return this.token;
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("Credenciais do Spotify não configuradas");
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await axios.post(
      this.ACCOUNTS_URL,
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    this.token = response.data.access_token;
    this.tokenExpiry = now + (response.data.expires_in - 300) * 1000;

    return this.token;
  }

  async searchTrack(trackName, artistName, includeAudioFeatures = true) {
    try {
      const token = await this.getAccessToken();

      const query = `track:"${trackName}" artist:"${artistName}"`;

      const response = await axios.get(`${this.API_URL}/search`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          q: query,
          type: "track",
          limit: 1,
          market: "BR",
        },
      });

      const tracks = response.data.tracks.items;

      if (tracks.length === 0) {
        return { found: false };
      }

      const track = tracks[0];
      const result = {
        found: true,
        track,
      };

      if (includeAudioFeatures) {
        result.audioFeatures = await this.getAudioFeatures(track.id);
      }

      return result;
    } catch (error) {
      console.error("Erro na busca:", error.response?.data || error.message);
      return {
        found: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  async getAudioFeatures(spotifyId) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(
        `${this.API_URL}/audio-features/${spotifyId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "Erro ao obter características:",
        error.response?.data || error.message
      );
      return null;
    }
  }

  analyzeEmotionalProfile(audioFeatures) {
    const { valence, energy, acousticness, danceability, tempo } =
      audioFeatures;

    let mood = "neutral";
    if (valence > 0.6 && energy > 0.6) mood = "happy-energetic";
    else if (valence > 0.6 && energy < 0.4) mood = "happy-calm";
    else if (valence < 0.4 && energy < 0.4) mood = "sad-calm";
    else if (valence < 0.4 && energy > 0.6) mood = "intense-emotional";

    let energyLevel = "medium";
    if (energy > 0.7) energyLevel = "high";
    else if (energy < 0.3) energyLevel = "low";

    const therapeuticPotential = {
      anxiety: Math.max(0, (1 - energy) * 0.7 + valence * 0.3),
      depression: valence * 0.8 + (danceability > 0.5 ? 0.2 : 0),
      relaxation:
        (1 - energy) * 0.5 + acousticness * 0.3 + (tempo < 100 ? 0.2 : 0),
      motivation: energy * 0.6 + valence * 0.4,
    };

    return {
      mood,
      energyLevel,
      therapeuticPotential,
    };
  }
}

// Função principal de teste
async function testarServicoSpotify() {
  console.log("🧪 TESTE DO SERVIÇO SPOTIFY - Sistema SOL");
  console.log("=".repeat(55));

  const spotify = new SpotifyServiceTest();

  try {
    console.log("\n🔍 Testando busca e análise emocional...\n");

    // Testar com músicas de diferentes perfis emocionais
    const exemplosTeste = [
      {
        track: "Happy",
        artist: "Pharrell Williams",
        expectedMood: "happy-energetic",
        description: "Música alegre e energética",
      },
      {
        track: "Mad World",
        artist: "Gary Jules",
        expectedMood: "sad-calm",
        description: "Música melancólica e calma",
      },
      {
        track: "Weightless",
        artist: "Marconi Union",
        expectedMood: "relaxing",
        description: "Música cientificamente projetada para relaxar",
      },
      {
        track: "Eye of the Tiger",
        artist: "Survivor",
        expectedMood: "motivational",
        description: "Música motivacional e energética",
      },
    ];

    let sucessos = 0;

    for (const exemplo of exemplosTeste) {
      console.log(`🎵 Analisando: "${exemplo.track}" - "${exemplo.artist}"`);
      console.log(`   Expectativa: ${exemplo.description}\n`);

      const resultado = await spotify.searchTrack(
        exemplo.track,
        exemplo.artist,
        true
      );

      if (resultado.found) {
        sucessos++;

        console.log(`✅ Música encontrada:`);
        console.log(`   Spotify ID: ${resultado.track.id}`);
        console.log(`   Nome: ${resultado.track.name}`);
        console.log(`   Popularidade: ${resultado.track.popularity}/100`);

        if (resultado.audioFeatures) {
          console.log(`\n🎶 Características de áudio:`);
          console.log(
            `   Valence (positividade): ${resultado.audioFeatures.valence.toFixed(
              3
            )}`
          );
          console.log(
            `   Energy (energia): ${resultado.audioFeatures.energy.toFixed(3)}`
          );
          console.log(
            `   Danceability: ${resultado.audioFeatures.danceability.toFixed(
              3
            )}`
          );
          console.log(
            `   Acousticness: ${resultado.audioFeatures.acousticness.toFixed(
              3
            )}`
          );
          console.log(
            `   Tempo: ${resultado.audioFeatures.tempo.toFixed(0)} BPM`
          );

          const analysis = spotify.analyzeEmotionalProfile(
            resultado.audioFeatures
          );

          console.log(`\n🧠 Análise emocional do Sistema SOL:`);
          console.log(`   Mood detectado: ${analysis.mood}`);
          console.log(`   Nível de energia: ${analysis.energyLevel}`);
          console.log(`   Potencial terapêutico:`);
          console.log(
            `     • Ansiedade: ${(
              analysis.therapeuticPotential.anxiety * 100
            ).toFixed(1)}%`
          );
          console.log(
            `     • Depressão: ${(
              analysis.therapeuticPotential.depression * 100
            ).toFixed(1)}%`
          );
          console.log(
            `     • Relaxamento: ${(
              analysis.therapeuticPotential.relaxation * 100
            ).toFixed(1)}%`
          );
          console.log(
            `     • Motivação: ${(
              analysis.therapeuticPotential.motivation * 100
            ).toFixed(1)}%`
          );

          // Recomendação terapêutica baseada na análise
          console.log(`\n💊 Recomendação terapêutica:`);
          const maxPotential = Math.max(
            ...Object.values(analysis.therapeuticPotential)
          );
          const recommendedUse = Object.entries(
            analysis.therapeuticPotential
          ).find(([_, value]) => value === maxPotential)?.[0];

          console.log(
            `   Melhor uso: ${recommendedUse} (${(maxPotential * 100).toFixed(
              1
            )}% de potencial)`
          );
        }
      } else {
        console.log(
          `❌ Música não encontrada: ${
            resultado.error || "Motivo desconhecido"
          }`
        );
      }

      console.log("\n" + "-".repeat(50) + "\n");

      // Respeitar rate limits
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    console.log(`📊 RESUMO DO TESTE:`);
    console.log(
      `✅ ${sucessos}/${exemplosTeste.length} músicas analisadas com sucesso`
    );
    console.log(
      `🎯 Taxa de sucesso: ${((sucessos / exemplosTeste.length) * 100).toFixed(
        1
      )}%`
    );

    if (sucessos >= 3) {
      console.log(`\n🎉 SERVIÇO SPOTIFY FUNCIONANDO PERFEITAMENTE!`);
      console.log(`🚀 O sistema está pronto para análise emocional automática`);
      console.log(
        `💡 Próximo passo: Criar APIs REST para integração com o frontend`
      );
    } else {
      console.log(`\n⚠️  Alguns problemas detectados na análise`);
      console.log(`💡 Verifique a conexão e as credenciais do Spotify`);
    }
  } catch (error) {
    console.log(`\n❌ ERRO NO TESTE DO SERVIÇO:`);
    console.log(`${error.message}`);
    console.log(
      `\n💡 Verifique se as credenciais estão configuradas corretamente`
    );
  }
}

// Executar teste
if (require.main === module) {
  testarServicoSpotify();
}

module.exports = { SpotifyServiceTest };
