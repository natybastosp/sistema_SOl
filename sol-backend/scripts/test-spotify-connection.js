const axios = require("axios");
require("dotenv").config();

// Função para obter token de acesso do Spotify
async function getSpotifyToken() {
  // Verifica se as credenciais estão configuradas
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(`
❌ Credenciais do Spotify não configuradas!

Para configurar:
1. Acesse https://developer.spotify.com/dashboard
2. Crie um app
3. Copie o Client ID e Client Secret
4. Adicione no arquivo .env:
   SPOTIFY_CLIENT_ID="sua_client_id_aqui"
   SPOTIFY_CLIENT_SECRET="sua_client_secret_aqui"
    `);
  }

  // Encode das credenciais em Base64 (formato exigido pelo Spotify)
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    console.log("🔑 Obtendo token de acesso do Spotify...");

    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      "grant_type=client_credentials", // Tipo de autenticação para apps (não usuários)
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log("✅ Token obtido com sucesso!");
    console.log(`   Expira em: ${response.data.expires_in} segundos`);

    return response.data.access_token;
  } catch (error) {
    console.error("❌ Erro ao obter token:");

    if (error.response?.status === 400) {
      console.error(
        "   - Verifique suas credenciais CLIENT_ID e CLIENT_SECRET"
      );
    } else if (error.response?.status === 403) {
      console.error("   - Suas credenciais foram rejeitadas pelo Spotify");
    } else {
      console.error("   -", error.response?.data || error.message);
    }

    throw error;
  }
}

// Função para buscar informações de uma música específica
async function searchSpotifyTrack(token, trackName, artistName) {
  try {
    console.log(`\n🔍 Buscando: "${trackName}" - "${artistName}"`);

    // Construir query de busca otimizada
    const query = `track:"${trackName}" artist:"${artistName}"`;

    const response = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        q: query,
        type: "track",
        limit: 1, // Queremos apenas o resultado mais relevante
        market: "BR", // Mercado brasileiro
      },
    });

    const tracks = response.data.tracks.items;

    if (tracks.length > 0) {
      const track = tracks[0];

      console.log("✅ Música encontrada!");
      console.log(`   Spotify ID: ${track.id}`);
      console.log(`   Nome exato: ${track.name}`);
      console.log(`   Artista: ${track.artists[0].name}`);
      console.log(`   Álbum: ${track.album.name}`);
      console.log(`   Popularidade: ${track.popularity}/100`);
      console.log(
        `   Duração: ${Math.floor(track.duration_ms / 60000)}:${String(
          Math.floor((track.duration_ms % 60000) / 1000)
        ).padStart(2, "0")}`
      );
      console.log(
        `   Preview: ${track.preview_url ? "Disponível" : "Não disponível"}`
      );

      return {
        found: true,
        spotifyId: track.id,
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        duration: track.duration_ms,
        popularity: track.popularity,
        previewUrl: track.preview_url,
        uri: track.uri,
        spotifyUrl: track.external_urls.spotify,
      };
    } else {
      console.log("❌ Música não encontrada no Spotify");
      return { found: false };
    }
  } catch (error) {
    console.error("❌ Erro na busca:", error.response?.data || error.message);
    return { found: false, error: error.message };
  }
}

// Função para obter características de áudio (essencial para o seu sistema!)
async function getAudioFeatures(token, spotifyId) {
  try {
    console.log(`\n🎵 Obtendo características de áudio...`);

    const response = await axios.get(
      `https://api.spotify.com/v1/audio-features/${spotifyId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const features = response.data;

    console.log("✅ Características obtidas:");
    console.log(
      `   Danceability: ${features.danceability.toFixed(
        3
      )} (quão dançante é a música)`
    );
    console.log(
      `   Energy: ${features.energy.toFixed(3)} (energia/intensidade)`
    );
    console.log(
      `   Valence: ${features.valence.toFixed(3)} (positividade emocional)`
    );
    console.log(
      `   Acousticness: ${features.acousticness.toFixed(3)} (quão acústica é)`
    );
    console.log(
      `   Instrumentalness: ${features.instrumentalness.toFixed(3)} (sem vocal)`
    );
    console.log(
      `   Speechiness: ${features.speechiness.toFixed(3)} (falada vs cantada)`
    );
    console.log(
      `   Liveness: ${features.liveness.toFixed(3)} (gravação ao vivo)`
    );
    console.log(`   Loudness: ${features.loudness.toFixed(1)} dB (volume)`);
    console.log(
      `   Tempo: ${features.tempo.toFixed(0)} BPM (batidas por minuto)`
    );

    // Interpretação emocional básica
    console.log(`\n🧠 Interpretação emocional:`);
    if (features.valence > 0.6) {
      console.log(`   😊 Música com alta positividade emocional`);
    } else if (features.valence < 0.4) {
      console.log(`   😔 Música com baixa positividade (mais melancólica)`);
    } else {
      console.log(`   😐 Música com neutralidade emocional`);
    }

    if (features.energy > 0.7) {
      console.log(`   ⚡ Alta energia (estimulante)`);
    } else if (features.energy < 0.3) {
      console.log(`   🌙 Baixa energia (relaxante)`);
    }

    return features;
  } catch (error) {
    console.error(
      "❌ Erro ao obter características:",
      error.response?.data || error.message
    );
    return null;
  }
}

// Função principal de teste
async function testarConexaoSpotify() {
  console.log("🎵 TESTE DE CONEXÃO COM SPOTIFY API - Sistema SOL");
  console.log("=".repeat(60));

  try {
    // Passo 1: Obter token
    const token = await getSpotifyToken();

    // Passo 2: Testar busca com algumas músicas do seu banco de dados
    const exemplosTeste = [
      { track: "Bohemian Rhapsody", artist: "Queen" },
      { track: "Hotel California", artist: "Eagles" },
      { track: "Garota de Ipanema", artist: "Tom Jobim" },
      { track: "Imagine", artist: "John Lennon" },
    ];

    console.log(
      `\n📊 Testando busca com ${exemplosTeste.length} músicas de exemplo...`
    );

    let sucessos = 0;

    for (const exemplo of exemplosTeste) {
      const resultado = await searchSpotifyTrack(
        token,
        exemplo.track,
        exemplo.artist
      );

      if (resultado.found) {
        sucessos++;

        // Testar características de áudio da primeira música encontrada
        if (sucessos === 1) {
          await getAudioFeatures(token, resultado.spotifyId);
        }
      }

      // Respeitar rate limit do Spotify (evitar muitas requisições por segundo)
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(`\n📈 RESULTADO DO TESTE:`);
    console.log(
      `✅ ${sucessos}/${exemplosTeste.length} músicas encontradas com sucesso`
    );
    console.log(
      `🎯 Taxa de sucesso: ${((sucessos / exemplosTeste.length) * 100).toFixed(
        1
      )}%`
    );

    if (sucessos > 0) {
      console.log(`\n🎉 CONEXÃO COM SPOTIFY FUNCIONANDO PERFEITAMENTE!`);
      console.log(`🚀 Próximo passo: Implementar APIs no seu sistema SOL`);
    } else {
      console.log(
        `\n⚠️  Conexão estabelecida, mas nenhuma música foi encontrada`
      );
      console.log(`💡 Verifique se as músicas de teste existem no Spotify`);
    }
  } catch (error) {
    console.log(`\n❌ FALHA NO TESTE DE CONEXÃO`);
    console.log(`💡 Verifique as configurações e tente novamente`);
  }
}

// Executar teste se chamado diretamente
if (require.main === module) {
  testarConexaoSpotify();
}

// Exportar funções para uso futuro nas APIs
module.exports = {
  getSpotifyToken,
  searchSpotifyTrack,
  getAudioFeatures,
};
