/**
 * 🎵 Script para Mesclar Dados e Preparar para Seed
 *
 * Combina:
 * 1. music_data_enriched.csv (15k músicas enriquecidas)
 * 2. musicas_perifericas.csv (2k músicas periféricas com Spotify ID)
 *
 * Cria:
 * - music_final_merged.csv (pronto para seed)
 * - Relatório de estatísticas
 */

import * as fs from "fs-extra";
import csv from "csv-parser";
import * as path from "path";

const dataPath = path.join(process.cwd(), "data");

interface EnrichedMusic {
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

function readCSV<T>(filePath: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const results: T[] = [];

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Arquivo não encontrado: ${filePath}`);
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

function parseFloatValue(value: any): number {
  if (!value || value === "") return 0;
  const parsed = Number(value.toString().replace(",", "."));
  return isNaN(parsed) ? 0 : parsed;
}

async function mergeData() {
  console.log("🚀 Iniciando merge de dados...\n");

  // Caminhos
  const enrichedPath = path.join(dataPath, "music_data_enriched.csv");
  const perifericasPath = path.join(dataPath, "musicas_perifericas.csv");
  const outputPath = path.join(dataPath, "music_final_merged.csv");

  // Verificar se o arquivo enriquecido existe
  if (!fs.existsSync(enrichedPath)) {
    console.error(`❌ Arquivo não encontrado: ${enrichedPath}`);
    console.error(`Execute primeiro: npm run data:enrich`);
    process.exit(1);
  }

  // Ler arquivos
  console.log("📂 Lendo arquivos...");
  const [enrichedMusics, perifericasMusics] = await Promise.all([
    readCSV<EnrichedMusic>(enrichedPath),
    readCSV<any>(perifericasPath),
  ]);

  console.log(`\n📊 Dados carregados:`);
  console.log(`  - Enriquecidas: ${enrichedMusics.length}`);
  console.log(`  - Periféricas: ${perifericasMusics.length}`);

  // Criar índice de enriquecidas por Spotify ID
  const enrichedMap = new Map<string, EnrichedMusic>();
  enrichedMusics.forEach((music) => {
    if (music.spotifyId) {
      enrichedMap.set(music.spotifyId, music);
    }
  });

  console.log(`\n🔄 Processando mesclagem...`);

  // Processar periféricas (adicionar as que não têm nos enriquecidos)
  const mergedData: EnrichedMusic[] = [...enrichedMusics];
  let addedFromPeripherals = 0;

  for (const perifericaMusic of perifericasMusics) {
    const spotifyId = perifericaMusic["ID do Spotify"]?.trim();

    // Se já existe na enriquecida, pular
    if (spotifyId && enrichedMap.has(spotifyId)) {
      continue;
    }

    // Adicionar a periférica
    const music: EnrichedMusic = {
      spotifyId: spotifyId,
      spotifyUri: `spotify:track:${spotifyId}`,
      name: perifericaMusic["Nome da Faixa"]?.trim() || "Unknown",
      artist: perifericaMusic["Nome do(s) Artista(s)"]?.trim() || "Unknown",
      album: perifericaMusic["Nome do Álbum"]?.trim(),
      duration: parseFloatValue(perifericaMusic["Duração (ms)"]),
      genre: perifericaMusic["Gênero"]?.trim() || "Unknown",
      // Valores padrão para emoções (pode usar GPT ou deixar como padrão)
      sadnessScore: 0.5,
      joyScore: 0.5,
      angerScore: 0.5,
      fearScore: 0.5,
      surpriseScore: 0.5,
      // Características Spotify
      danceability: parseFloatValue(perifericaMusic["Dançabilidade"]),
      energy: parseFloatValue(perifericaMusic["Energia"]),
      valence: parseFloatValue(perifericaMusic["Valência"]),
      acousticness: parseFloatValue(perifericaMusic["Acústica"]),
      instrumentalness: parseFloatValue(perifericaMusic["Instrumental"]),
    };

    mergedData.push(music);
    addedFromPeripherals++;
  }

  console.log(`  ✅ Adicionadas ${addedFromPeripherals} periféricas`);
  console.log(`  📊 Total de músicas: ${mergedData.length}`);

  // Salvar CSV mesclado
  console.log(`\n💾 Salvando CSV mesclado...`);
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
    ...mergedData.map((row) =>
      headers
        .map((header) => {
          const value = row[header as keyof EnrichedMusic];
          if (value === undefined || value === null) return "";
          if (typeof value === "string" && value.includes(",")) {
            return `"${value}"`;
          }
          return value;
        })
        .join(",")
    ),
  ].join("\n");

  await fs.writeFile(outputPath, csvContent);
  console.log(`✅ CSV salvo: ${outputPath}`);

  // Estatísticas
  console.log(`
✨ MESCLAGEM CONCLUÍDA!

📊 ESTATÍSTICAS:
  - Total de músicas: ${mergedData.length}
  - Enriquecidas (com Spotify ID): ${enrichedMusics.length}
  - Das periféricas (reuso): ${addedFromPeripherals}
  
🎵 DISTRIBUIÇÃO POR GÊNERO:
`);

  const genreCount = new Map<string, number>();
  mergedData.forEach((music) => {
    const genre = music.genre || "Unknown";
    genreCount.set(genre, (genreCount.get(genre) || 0) + 1);
  });

  // Top 10 gêneros
  const sortedGenres = Array.from(genreCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  sortedGenres.forEach(([genre, count]) => {
    const percentage = ((count / mergedData.length) * 100).toFixed(1);
    console.log(`  ${genre}: ${count} (${percentage}%)`);
  });

  console.log(`
📁 ARQUIVO GERADO:
  ${outputPath}

🚀 PRÓXIMOS PASSOS:
  1. Revisar o arquivo gerado
  2. Atualizar seed.ts para usar: music_final_merged.csv
  3. Executar: npm run db:seed
  4. Testar a aplicação!
  `);
}

mergeData().catch(console.error);
