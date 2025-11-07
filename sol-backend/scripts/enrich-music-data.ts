import * as fs from "fs-extra";
import csv from "csv-parser";
import * as path from "path";
import * as readline from "readline";
import * as dotenv from "dotenv";

// Carregar variáveis de ambiente do .env
dotenv.config();

const dataPath = path.join(process.cwd(), "data");

// Interfaces
interface EmotionMusicData {
  "": string;
  "Nome da Música": string;
  "ID do Artista": string;
  "Letra Tratada": string;
  Raiva: string;
  Medo: string;
  Alegria: string;
  Tristeza: string;
  Surpresa: string;
  Gênero: string;
  Valor: string;
}

interface MusicasPerifericasData {
  "": string;
  "ID do Spotify": string;
  "IDs do Artista": string;
  "Nome da Faixa": string;
  "Nome do Álbum": string;
  "Nome do(s) Artista(s)": string;
  "Duração (ms)": string;
  Popularidade: string;
  Dançabilidade: string;
  Energia: string;
  Tonalidade: string;
  "Intensidade Sonora": string;
  "Modo Musical": string;
  "Intensidade Vocal": string;
  Acústica: string;
  Instrumental: string;
  Vivacidade: string;
  Valência: string;
  Ritmo: string;
  Letra: string;
  "Frequência de Palavras": string;
  Gênero: string;
  Década: string;
}

interface EnrichedMusicData {
  spotifyId?: string;
  spotifyUri?: string;
  name: string;
  artist: string;
  album?: string;
  duration?: number;
  genre: string;
  sadnessScore: number;
  joyScore: number;
  angerScore: number;
  fearScore: number;
  surpriseScore: number;
  danceability?: number;
  energy?: number;
  valence?: number;
  acousticness?: number;
  instrumentalness?: number;
}

// Spotify API
let spotifyAccessToken: string | null = null;
let tokenExpiresAt = 0;

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

async function getSpotifyToken(): Promise<string> {
  const now = Date.now();

  if (spotifyAccessToken && now < tokenExpiresAt) {
    return spotifyAccessToken;
  }

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw new Error(
      "❌ SPOTIFY_CLIENT_ID e SPOTIFY_CLIENT_SECRET não configurados no .env"
    );
  }

  const authString = Buffer.from(
    `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${authString}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      throw new Error(`Spotify auth falhou: ${response.statusText}`);
    }

    const data = (await response.json()) as {
      access_token: string;
      expires_in: number;
    };

    spotifyAccessToken = data.access_token;
    tokenExpiresAt = now + data.expires_in * 1000;

    return spotifyAccessToken;
  } catch (error) {
    console.error("❌ Erro ao obter token Spotify:", error);
    throw error;
  }
}

interface SpotifyTrack {
  id: string;
  uri: string;
  name: string;
  duration_ms: number;
  album: { name: string };
  artists: Array<{ name: string }>;
}

interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
  };
}

async function searchSpotifyTrack(
  name: string,
  artist: string
): Promise<{
  id: string;
  uri: string;
  album: string;
  duration: number;
} | null> {
  try {
    const token = await getSpotifyToken();

    // Limpar e construir query
    const cleanName = name
      .replace(/\s*\([^)]*\)\s*/g, "")
      .replace(/\s*\[[^\]]*\]\s*/g, "")
      .trim();
    const cleanArtist = artist.replace(/^\//, "").replace(/\/$/, "").trim();

    const query = encodeURIComponent(
      `track:"${cleanName}" artist:"${cleanArtist}"`
    );

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.warn(`⚠️  Falha ao buscar: ${cleanName} - ${cleanArtist}`);
      return null;
    }

    const data = (await response.json()) as SpotifySearchResponse;

    if (data.tracks.items.length === 0) {
      return null;
    }

    const track = data.tracks.items[0];
    return {
      id: track.id,
      uri: track.uri,
      album: track.album.name,
      duration: track.duration_ms,
    };
  } catch (error) {
    console.error(`❌ Erro ao buscar Spotify: ${error}`);
    return null;
  }
}

// Ler CSV
function readCSV<T>(filePath: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const results: T[] = [];

    if (!fs.existsSync(filePath)) {
      console.log(`❌ Arquivo não encontrado: ${filePath}`);
      resolve([]);
      return;
    }

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        console.log(
          `✅ CSV lido: ${path.basename(filePath)} - ${
            results.length
          } registros`
        );
        resolve(results);
      })
      .on("error", reject);
  });
}

// Normalizar valores
function parseFloat_(value: string | undefined): number {
  if (!value || value === "") return 0;
  const parsed = Number(value.replace(",", "."));
  return isNaN(parsed) ? 0 : parsed;
}

function normalizeString(value: string | undefined): string {
  if (!value) return "";
  return value.trim();
}

// Salvar CSV
async function saveCSV(
  filename: string,
  data: EnrichedMusicData[]
): Promise<void> {
  const filePath = path.join(dataPath, filename);

  const headers = [
    "spotifyId",
    "spotifyUri",
    "name",
    "artist",
    "album",
    "duration",
    "genre",
    "sadnessScore",
    "joyScore",
    "angerScore",
    "fearScore",
    "surpriseScore",
    "danceability",
    "energy",
    "valence",
    "acousticness",
    "instrumentalness",
  ];

  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header as keyof EnrichedMusicData];
          if (value === undefined || value === null) return "";
          if (typeof value === "string" && value.includes(",")) {
            return `"${value}"`;
          }
          return value;
        })
        .join(",")
    ),
  ].join("\n");

  await fs.writeFile(filePath, csvContent);
  console.log(`✅ CSV salvo: ${filePath}`);
}

// Main
async function main() {
  console.log("🚀 Iniciando enriquecimento de dados musicais...\n");

  // Validar credenciais
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    console.error(
      "❌ ERRO: Configure SPOTIFY_CLIENT_ID e SPOTIFY_CLIENT_SECRET no .env"
    );
    process.exit(1);
  }

  // Ler CSVs
  const emotionDataPath = path.join(dataPath, "emotion_music_data.csv");
  const musicasPerifericasPath = path.join(dataPath, "musicas_perifericas.csv");

  console.log("📂 Lendo arquivos CSV...");
  const [emotionData, musicasPerifiericas] = await Promise.all([
    readCSV<EmotionMusicData>(emotionDataPath),
    readCSV<MusicasPerifericasData>(musicasPerifericasPath),
  ]);

  // Criar índice de periféricas por Spotify ID
  const perifericasMap = new Map<string, MusicasPerifericasData>();
  musicasPerifiericas.forEach((musica) => {
    const spotifyId = normalizeString(musica["ID do Spotify"]);
    if (spotifyId) {
      perifericasMap.set(spotifyId, musica);
    }
  });

  console.log(
    `📊 Dados carregados: ${emotionData.length} emoções, ${musicasPerifiericas.length} periféricas\n`
  );

  // Processar músicas
  const enrichedData: EnrichedMusicData[] = [];
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  console.log("🔍 Enriquecendo dados (isto pode levar alguns minutos)...\n");

  // Limitar a 15.000 para não ter rate limit no Spotify
  const limitProcessing = Math.min(emotionData.length, 15000);

  for (let i = 0; i < limitProcessing; i++) {
    const music = emotionData[i];
    const name = normalizeString(music["Nome da Música"]);
    const artist = normalizeString(music["ID do Artista"]);
    const genre = normalizeString(music["Gênero"]);

    if (!name || !artist) {
      skipCount++;
      continue;
    }

    try {
      // Buscar no Spotify
      const spotifyResult = await searchSpotifyTrack(name, artist);

      if (!spotifyResult) {
        skipCount++;
        continue;
      }

      // Tentar enriquecer com dados das periféricas
      const perifericaData = perifericasMap.get(spotifyResult.id);

      const enriched: EnrichedMusicData = {
        spotifyId: spotifyResult.id,
        spotifyUri: spotifyResult.uri,
        name: name,
        artist: artist,
        album: perifericaData
          ? normalizeString(perifericaData["Nome do Álbum"])
          : spotifyResult.album,
        duration: perifericaData
          ? parseFloat_(perifericaData["Duração (ms)"])
          : spotifyResult.duration,
        genre: genre,
        sadnessScore: parseFloat_(music["Tristeza"]),
        joyScore: parseFloat_(music["Alegria"]),
        angerScore: parseFloat_(music["Raiva"]),
        fearScore: parseFloat_(music["Medo"]),
        surpriseScore: parseFloat_(music["Surpresa"]),
        danceability: perifericaData
          ? parseFloat_(perifericaData["Dançabilidade"])
          : undefined,
        energy: perifericaData
          ? parseFloat_(perifericaData["Energia"])
          : undefined,
        valence: perifericaData
          ? parseFloat_(perifericaData["Valência"])
          : undefined,
        acousticness: perifericaData
          ? parseFloat_(perifericaData["Acústica"])
          : undefined,
        instrumentalness: perifericaData
          ? parseFloat_(perifericaData["Instrumental"])
          : undefined,
      };

      enrichedData.push(enriched);
      successCount++;

      // Log a cada 100
      if (successCount % 100 === 0) {
        console.log(
          `  ⏳ Processadas ${successCount} músicas (${
            i + 1
          }/${limitProcessing})`
        );
      }

      // Rate limiting (não sobrecarregar API)
      if (i % 10 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error) {
      errorCount++;
      if (errorCount % 10 === 0) {
        console.log(`  ⚠️  ${errorCount} erros encontrados`);
      }
    }
  }

  console.log("\n✅ Processamento concluído!");
  console.log(`
📈 RESUMO:
  ✅ Sucesso: ${successCount}
  ⏭️  Puladas: ${skipCount}
  ❌ Erros: ${errorCount}
  📊 Total processado: ${limitProcessing}/${emotionData.length}
  `);

  // Salvar CSV enriquecido
  if (enrichedData.length > 0) {
    console.log("\n💾 Salvando CSV enriquecido...");
    await saveCSV("music_data_enriched.csv", enrichedData);

    console.log(`
✨ PRÓXIMOS PASSOS:
1. Verifique o arquivo: data/music_data_enriched.csv
2. Atualize o seed.ts para usar o novo arquivo
3. Execute: npm run db:seed
4. Teste o app!

📊 Total de músicas no banco: ~${successCount + musicasPerifiericas.length}
    `);
  }
}

main().catch(console.error);
