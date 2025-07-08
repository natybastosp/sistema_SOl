const axios = require("axios");

// Função para obter token de acesso (Client Credentials Flow)
async function getSpotifyToken(clientId, clientSecret) {
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error(
      "Erro ao obter token:",
      error.response?.data || error.message
    );
    return null;
  }
}

// Função para buscar música por nome e artista
async function searchSpotifyTrack(token, trackName, artistName) {
  // Montar query de busca
  const query = `track:"${trackName}" artist:"${artistName}"`;

  try {
    const response = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        q: query,
        type: "track",
        limit: 1,
      },
    });

    const tracks = response.data.tracks.items;

    if (tracks.length > 0) {
      const track = tracks[0];
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
      };
    }

    return { found: false };
  } catch (error) {
    console.error("Erro na busca:", error.response?.data || error.message);
    return { found: false, error: error.message };
  }
}

// Função para obter características de áudio
async function getAudioFeatures(token, spotifyId) {
  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/audio-features/${spotifyId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      danceability: response.data.danceability,
      energy: response.data.energy,
      valence: response.data.valence,
      acousticness: response.data.acousticness,
      instrumentalness: response.data.instrumentalness,
      speechiness: response.data.speechiness,
      liveness: response.data.liveness,
      loudness: response.data.loudness,
      tempo: response.data.tempo,
    };
  } catch (error) {
    console.error("Erro ao obter características:", error.message);
    return null;
  }
}

// Exemplo de uso completo
async function exemploCompleto() {
  console.log("🎵 Exemplo de busca na API do Spotify\n");

  // IMPORTANTE: Substitua por suas credenciais reais
  const CLIENT_ID = "seu_client_id_aqui";
  const CLIENT_SECRET = "seu_client_secret_aqui";

  if (CLIENT_ID === "seu_client_id_aqui") {
    console.log("⚠️  Este é apenas um exemplo!");
    console.log("📝 Para usar, você precisa:");
    console.log("1. Criar conta em https://developer.spotify.com/dashboard");
    console.log("2. Criar um app e obter CLIENT_ID e CLIENT_SECRET");
    console.log("3. Substituir as credenciais neste arquivo");
    console.log("4. Executar novamente");

    console.log("\n💡 Exemplo de resposta que você receberia:");
    console.log(`
🎵 Buscando: "Bohemian Rhapsody" - "Queen"
✅ Encontrada!
   Spotify ID: 4u7EnebtmKWzUH433cf5Qv
   Nome: Bohemian Rhapsody
   Artista: Queen
   Álbum: A Night At The Opera
   Duração: 355.000ms
   Popularidade: 85
   
🎶 Características de áudio:
   Danceability: 0.468
   Energy: 0.581
   Valence: 0.279 (emocional: mais melancólica)
   Acousticness: 0.123
   Instrumentalness: 0.0012
    `);
    return;
  }

  // Obter token de acesso
  console.log("🔑 Obtendo token de acesso...");
  const token = await getSpotifyToken(CLIENT_ID, CLIENT_SECRET);

  if (!token) {
    console.log("❌ Não foi possível obter token");
    return;
  }

  console.log("✅ Token obtido com sucesso!");

  // Exemplo de busca
  const exemplos = [
    { track: "Bohemian Rhapsody", artist: "Queen" },
    { track: "Hotel California", artist: "Eagles" },
    { track: "Garota de Ipanema", artist: "Tom Jobim" },
  ];

  for (const exemplo of exemplos) {
    console.log(`\n🔍 Buscando: "${exemplo.track}" - "${exemplo.artist}"`);

    const resultado = await searchSpotifyTrack(
      token,
      exemplo.track,
      exemplo.artist
    );

    if (resultado.found) {
      console.log("✅ Encontrada!");
      console.log(`   Spotify ID: ${resultado.spotifyId}`);
      console.log(`   Nome: ${resultado.name}`);
      console.log(`   Artista: ${resultado.artist}`);
      console.log(`   Álbum: ${resultado.album}`);
      console.log(`   Popularidade: ${resultado.popularity}`);

      // Buscar características de áudio
      const features = await getAudioFeatures(token, resultado.spotifyId);
      if (features) {
        console.log(`   Características:`);
        console.log(`     Danceability: ${features.danceability}`);
        console.log(`     Energy: ${features.energy}`);
        console.log(`     Valence: ${features.valence}`);
      }
    } else {
      console.log("❌ Não encontrada");
    }

    // Rate limit - esperar 100ms entre requests
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

// Exportar funções para uso futuro
module.exports = {
  getSpotifyToken,
  searchSpotifyTrack,
  getAudioFeatures,
};

// Executar exemplo se chamado diretamente
if (require.main === module) {
  exemploCompleto();
}
