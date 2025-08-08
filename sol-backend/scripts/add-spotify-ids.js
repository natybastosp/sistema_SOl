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

// Buscar música no Spotify
async function searchSpotifyTrack(name, artist) {
  try {
    // Limpar e formatar query
    const query = `track:"${name}" artist:"${artist}"`;

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
    const flexQuery = `${name} ${artist}`;
    const flexResult = await spotifyApi.searchTracks(flexQuery, { limit: 1 });

    if (flexResult.body.tracks.items.length > 0) {
      const track = flexResult.body.tracks.items[0];
      // Verificar se é realmente a música certa
      const trackName = track.name.toLowerCase();
      const searchName = name.toLowerCase();

      if (trackName.includes(searchName) || searchName.includes(trackName)) {
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

  // Buscar músicas sem Spotify ID
  const musicasSemId = await prisma.music.findMany({
    where: { spotifyId: null },
    select: {
      id: true,
      name: true,
      artist: true,
      genre: true,
    },
    take: 100, // Processar em lotes para evitar rate limit
  });

  console.log(`📊 Encontradas ${musicasSemId.length} músicas sem Spotify ID\n`);

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
