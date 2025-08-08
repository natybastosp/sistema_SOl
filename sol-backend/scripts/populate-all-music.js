const { PrismaClient } = require("@prisma/client");
const SpotifyWebApi = require("spotify-web-api-node");
require("dotenv").config();

const prisma = new PrismaClient();

// Configurar Spotify API
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

// Autenticar com Spotify
async function authenticateSpotify() {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body["access_token"]);
    console.log("✅ Autenticado com Spotify");
    return true;
  } catch (error) {
    console.error("❌ Erro ao autenticar:", error.message);
    return false;
  }
}

// Calcular similaridade entre strings
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = (a, b) => {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  };

  return (longer.length - editDistance(longer, shorter)) / longer.length;
}

// Buscar música no Spotify
async function searchSpotifyTrack(name, artist) {
  try {
    // Limpar nome do artista (remover barras e caracteres especiais)
    const cleanArtist = artist.replace(/[\/\\]/g, "").trim();
    const cleanName = name.replace(/[^\w\s\u00C0-\u00FF]/g, " ").trim();

    // Tentar busca exata primeiro
    const query = `track:"${cleanName}" artist:"${cleanArtist}"`;

    const result = await spotifyApi.searchTracks(query, { limit: 1 });

    if (result.body.tracks.items.length > 0) {
      const track = result.body.tracks.items[0];
      return {
        spotifyId: track.id,
        album: track.album.name,
        duration: track.duration_ms,
        // Adicionar características de áudio se disponível
        popularity: track.popularity,
      };
    }

    // Tentar busca mais flexível se não encontrar
    const flexQuery = `${cleanName} ${cleanArtist}`;
    const flexResult = await spotifyApi.searchTracks(flexQuery, { limit: 3 });

    if (flexResult.body.tracks.items.length > 0) {
      // Verificar se algum resultado é similar
      for (const track of flexResult.body.tracks.items) {
        const trackName = track.name.toLowerCase();
        const searchName = cleanName.toLowerCase();
        const trackArtist = track.artists[0]?.name.toLowerCase() || "";
        const searchArtist = cleanArtist.toLowerCase();

        // Verificação mais flexível
        if (
          trackName.includes(searchName) ||
          searchName.includes(trackName) ||
          trackArtist.includes(searchArtist) ||
          searchArtist.includes(trackArtist)
        ) {
          return {
            spotifyId: track.id,
            album: track.album.name,
            duration: track.duration_ms,
            popularity: track.popularity,
          };
        }
      }
    }

    // Última tentativa: buscar só pelo nome da música
    const nameOnlyResult = await spotifyApi.searchTracks(cleanName, {
      limit: 3,
    });

    if (nameOnlyResult.body.tracks.items.length > 0) {
      const track = nameOnlyResult.body.tracks.items[0];
      const trackName = track.name.toLowerCase();
      const searchName = cleanName.toLowerCase();

      // Verificar similaridade do nome
      const similarity = calculateSimilarity(trackName, searchName);
      if (similarity > 0.7) {
        return {
          spotifyId: track.id,
          album: track.album.name,
          duration: track.duration_ms,
          popularity: track.popularity,
        };
      }
    }

    return null;
  } catch (error) {
    if (error.statusCode === 429) {
      // Rate limit - aguardar
      console.log("⏳ Rate limit atingido, aguardando...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return searchSpotifyTrack(name, artist);
    }
    console.error(`❌ Erro ao buscar "${name}":`, error.message);
    return null;
  }
}

// Obter características de áudio
async function getAudioFeatures(spotifyId) {
  try {
    const features = await spotifyApi.getAudioFeatures(spotifyId);

    if (features.body) {
      return {
        danceability: features.body.danceability,
        energy: features.body.energy,
        valence: features.body.valence,
        acousticness: features.body.acousticness,
        instrumentalness: features.body.instrumentalness,
      };
    }
  } catch (error) {
    console.error(`⚠️ Não foi possível obter features de ${spotifyId}`);
  }
  return null;
}

async function updateMissingSpotifyIds() {
  console.log("🔍 Buscando músicas sem Spotify ID...\n");

  // Autenticar
  const authenticated = await authenticateSpotify();
  if (!authenticated) {
    console.log("❌ Não foi possível autenticar com Spotify");
    console.log("\n📝 Adicione ao seu .env:");
    console.log("SPOTIFY_CLIENT_ID=seu_client_id");
    console.log("SPOTIFY_CLIENT_SECRET=seu_client_secret");
    console.log("\nObtenha em: https://developer.spotify.com/dashboard");
    return;
  }

  // Lista de artistas que sabemos que não estão no Spotify
  const skipArtists = ["/lucas-fellix/", "/samir-matos/", "/ivo-goncalves/"];

  // Buscar músicas sem Spotify ID, excluindo artistas problemáticos
  const musicasSemId = await prisma.music.findMany({
    where: {
      spotifyId: null,
      NOT: {
        artist: {
          in: skipArtists,
        },
      },
    },
    select: {
      id: true,
      name: true,
      artist: true,
      genre: true,
    },
    take: 100, // Processar em lotes para evitar rate limit
  });

  console.log(`📊 Encontradas ${musicasSemId.length} músicas sem Spotify ID\n`);
  console.log(`⏭️  Pulando artistas conhecidos: ${skipArtists.join(", ")}\n`);

  let found = 0;
  let notFound = 0;
  let processed = 0;

  for (const musica of musicasSemId) {
    processed++;

    console.log(
      `[${processed}/${musicasSemId.length}] Buscando: "${musica.name}" - ${musica.artist}`
    );

    // Buscar no Spotify
    const spotifyData = await searchSpotifyTrack(musica.name, musica.artist);

    if (spotifyData) {
      // Obter características de áudio
      const audioFeatures = await getAudioFeatures(spotifyData.spotifyId);

      // Atualizar no banco
      try {
        await prisma.music.update({
          where: { id: musica.id },
          data: {
            spotifyId: spotifyData.spotifyId,
            album: spotifyData.album || undefined,
            duration: spotifyData.duration || undefined,
            ...(audioFeatures || {}),
          },
        });

        console.log(`  ✅ Atualizado com ID: ${spotifyData.spotifyId}`);
        found++;
      } catch (error) {
        console.log(`  ❌ Erro ao atualizar: ${error.message}`);
      }
    } else {
      console.log(`  ⚠️ Não encontrado no Spotify`);
      notFound++;
    }

    // Pequena pausa para evitar rate limit
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Estatísticas finais
  console.log("\n📈 RESULTADO:");
  console.log(`✅ Encontradas: ${found}`);
  console.log(`❌ Não encontradas: ${notFound}`);
  console.log(`📊 Total processado: ${processed}`);

  const totalComId = await prisma.music.count({
    where: { spotifyId: { not: null } },
  });
  const totalSemId = await prisma.music.count({
    where: { spotifyId: null },
  });

  console.log(`\n📊 Status do banco:`);
  console.log(`  Com Spotify ID: ${totalComId}`);
  console.log(`  Sem Spotify ID: ${totalSemId}`);

  if (totalSemId > 0) {
    console.log(
      `\n💡 Execute novamente para processar mais ${totalSemId} músicas`
    );
  }
}

// Executar
updateMissingSpotifyIds()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
