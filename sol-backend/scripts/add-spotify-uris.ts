/**
 * Script para popular spotifyUri nas músicas
 * Usa a Spotify Web API para buscar os URIs das músicas
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Credenciais Spotify (do .env)
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

let spotifyAccessToken: string | null = null;
let tokenExpiresAt = 0;

/**
 * Obter token de acesso do Spotify
 */
async function getSpotifyToken(): Promise<string> {
  const now = Date.now();

  if (spotifyAccessToken && now < tokenExpiresAt) {
    return spotifyAccessToken;
  }

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw new Error("Missing Spotify credentials in .env");
  }

  const authString = Buffer.from(
    `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${authString}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`Failed to get Spotify token: ${response.statusText}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };

  spotifyAccessToken = data.access_token;
  tokenExpiresAt = now + data.expires_in * 1000;

  return spotifyAccessToken;
}

/**
 * Buscar URI do Spotify para uma música
 */
async function getSpotifyUri(
  title: string,
  artist: string
): Promise<string | null> {
  try {
    const token = await getSpotifyToken();
    const query = encodeURIComponent(`${title} ${artist}`);

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.warn(`⚠️  Failed to search Spotify for "${title}"`);
      return null;
    }

    const data = (await response.json()) as {
      tracks: { items: Array<{ uri: string }> };
    };
    const tracks = data.tracks?.items || [];

    if (tracks.length > 0) {
      return tracks[0].uri; // spotify:track:xxxxx
    }

    return null;
  } catch (error) {
    console.warn(
      `⚠️  Error fetching Spotify URI for "${title}": ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    return null;
  }
}

/**
 * Main: Popular spotifyUri nas músicas
 */
async function main() {
  console.log("🎵 Iniciando preenchimento de spotifyUri...\n");

  try {
    // Buscar músicas sem spotifyUri
    const musicsWithoutUri = await prisma.music.findMany({
      where: {
        spotifyUri: null,
      },
      take: 1000, // Processar em lotes
    });

    console.log(
      `📊 Encontradas ${musicsWithoutUri.length} músicas sem spotifyUri\n`
    );

    if (musicsWithoutUri.length === 0) {
      console.log("✅ Todas as músicas já possuem spotifyUri!");
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < musicsWithoutUri.length; i++) {
      const music = musicsWithoutUri[i];

      try {
        // Buscar URI do Spotify
        const spotifyUri = await getSpotifyUri(music.name, music.artist);

        if (spotifyUri) {
          // Atualizar no banco
          await prisma.music.update({
            where: { id: music.id },
            data: { spotifyUri },
          });

          successCount++;

          if ((i + 1) % 50 === 0) {
            console.log(
              `  ✅ Processadas ${i + 1} músicas... (${successCount} sucesso)`
            );
          }
        } else {
          errorCount++;
          if ((i + 1) % 100 === 0) {
            console.log(
              `  ⚠️  ${i + 1} músicas processadas (${errorCount} sem URI)`
            );
          }
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Erro ao processar "${music.name}":`, error);
      }

      // Rate limiting: Spotify permite ~100 requests/segundo
      if ((i + 1) % 10 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    console.log("\n📈 Resumo final:");
    console.log(`✅ Músicas atualizadas: ${successCount}`);
    console.log(`❌ Músicas com erro: ${errorCount}`);
    console.log(
      `📊 Taxa de sucesso: ${(
        (successCount / musicsWithoutUri.length) *
        100
      ).toFixed(1)}%`
    );
  } catch (error) {
    console.error("❌ Erro ao executar script:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
