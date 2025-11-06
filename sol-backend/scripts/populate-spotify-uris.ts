import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface SpotifyTrack {
  uri: string;
  name: string;
  artists: Array<{ name: string }>;
}

interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
  };
}

/**
 * 🎵 Script para Adicionar Spotify URIs às Músicas
 *
 * Este script:
 * 1. Obtém um access token do Spotify
 * 2. Para cada música no banco, busca no Spotify
 * 3. Extrai o URI (spotify:track:xxxxx)
 * 4. Atualiza o banco com o URI
 */

async function getSpotifyAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "SPOTIFY_CLIENT_ID e SPOTIFY_CLIENT_SECRET são obrigatórios no .env"
    );
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

async function searchSpotifyTrack(
  accessToken: string,
  name: string,
  artist: string
): Promise<string | null> {
  try {
    // Construir query de busca
    const query = `track:${name} artist:${artist}`;
    const encodedQuery = encodeURIComponent(query);

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodedQuery}&type=track&limit=1`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      console.error(
        `❌ Erro ao buscar ${name} - ${artist}: ${response.statusText}`
      );
      return null;
    }

    const data = (await response.json()) as SpotifySearchResponse;

    if (data.tracks.items.length > 0) {
      const uri = data.tracks.items[0].uri;
      console.log(`✅ Encontrado: ${name} → ${uri}`);
      return uri;
    }

    console.log(`⚠️  Não encontrado: ${name} - ${artist}`);
    return null;
  } catch (error) {
    console.error(`❌ Erro ao buscar ${name}:`, error);
    return null;
  }
}

async function populateSpotifyUris() {
  console.log("🎵 Iniciando população de Spotify URIs...\n");

  try {
    // Obter token
    console.log("🔑 Obtendo token do Spotify...");
    const accessToken = await getSpotifyAccessToken();
    console.log("✅ Token obtido!\n");

    // Buscar todas as músicas sem URI
    console.log("🔍 Buscando músicas sem Spotify URI...");
    const musicsWithoutUri = await prisma.music.findMany({
      where: {
        spotifyUri: null,
      },
    });

    console.log(`📊 Encontradas ${musicsWithoutUri.length} músicas\n`);

    if (musicsWithoutUri.length === 0) {
      console.log("✅ Todas as músicas já têm Spotify URI!");
      process.exit(0);
    }

    // Processar cada música
    let updated = 0;
    let failed = 0;

    for (let i = 0; i < musicsWithoutUri.length; i++) {
      const music = musicsWithoutUri[i];

      console.log(
        `\n[${i + 1}/${musicsWithoutUri.length}] Processando: ${music.name}`
      );

      // Buscar URI no Spotify
      const spotifyUri = await searchSpotifyTrack(
        accessToken,
        music.name,
        music.artist
      );

      if (spotifyUri) {
        // Atualizar no banco
        await prisma.music.update({
          where: { id: music.id },
          data: { spotifyUri },
        });
        updated++;

        // Rate limiting (respeitar limites do Spotify)
        await new Promise((resolve) => setTimeout(resolve, 200));
      } else {
        failed++;
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("📊 RESULTADO FINAL:");
    console.log(`✅ Atualizadas: ${updated} músicas`);
    console.log(`❌ Falhadas: ${failed} músicas`);
    console.log(
      `📊 Taxa de sucesso: ${(
        (updated / musicsWithoutUri.length) *
        100
      ).toFixed(1)}%`
    );
    console.log("=".repeat(50));
  } catch (error) {
    console.error("❌ Erro fatal:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar
populateSpotifyUris();
