const { PrismaClient } = require("@prisma/client");
const fs = require("fs-extra");
const csv = require("csv-parser");
const path = require("path");

const prisma = new PrismaClient();

function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];

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
          `✅ ${path.basename(filePath)}: ${results.length} registros`
        );
        resolve(results);
      })
      .on("error", reject);
  });
}

function parseFloatSafe(value) {
  if (!value || value === "") return 0;
  const parsed = Number(value.replace(",", "."));
  return isNaN(parsed) ? 0 : parsed;
}

function normalizeString(value) {
  if (!value) return "";
  return value.trim();
}

async function populateAllMusic() {
  console.log("🎵 POPULANDO TODAS AS MÚSICAS NO BANCO");
  console.log("=".repeat(50));

  const dataPath = path.join(process.cwd(), "data");

  // Ler CSVs
  const [emotionData, emotionOriginal, musicasPerifiericas] = await Promise.all(
    [
      readCSV(path.join(dataPath, "emotion_music_data.csv")),
      readCSV(path.join(dataPath, "emotion_music_data_original.csv")),
      readCSV(path.join(dataPath, "musicas_perifericas.csv")),
    ]
  );

  console.log("\n📊 Resumo:");
  console.log(
    `- emotion_music_data.csv: ${emotionData.length} (SEM Spotify ID)`
  );
  console.log(
    `- musicas_perifericas.csv: ${musicasPerifiericas.length} (COM Spotify ID)`
  );
  // Limpar músicas
  console.log("\n🧹 Limpando tabela...");
  await prisma.feedback.deleteMany();
  await prisma.playlistMusic.deleteMany();
  await prisma.music.deleteMany();

  let totalProcessed = 0;
  let spotifyIdCount = 0;
  let noSpotifyIdCount = 0;

  // Mapa de emoções por Spotify ID
  const emotionMap = new Map();
  emotionOriginal.forEach((emotion) => {
    const spotifyId = normalizeString(emotion["Spotify ID"]);
    if (spotifyId) {
      emotionMap.set(spotifyId, emotion);
    }
  });

  // PARTE 1: Músicas COM Spotify ID
  console.log("\n📀 Processando COM Spotify ID...");
  for (const musica of musicasPeriffericas) {
    const spotifyId = normalizeString(musica["ID do Spotify"]);
    if (!spotifyId) continue;

    try {
      const emotionInfo = emotionMap.get(spotifyId);

      await prisma.music.create({
        data: {
          spotifyId: spotifyId,
          name:
            normalizeString(musica["Nome da Faixa"]) || "Nome não disponível",
          artist:
            normalizeString(musica["Nome do(s) Artista(s)"]) ||
            "Artista não disponível",
          album: normalizeString(musica["Nome do Álbum"]) || null,
          duration: parseInt(musica["Duração (ms)"]) || null,
          genre: normalizeString(musica["Gênero"]) || "Desconhecido",

          // Scores emocionais
          sadnessScore: emotionInfo
            ? parseFloatSafe(emotionInfo["Tristeza (BERT)"])
            : 0.5,
          joyScore: emotionInfo
            ? parseFloatSafe(emotionInfo["Alegria (BERT)"])
            : 0.5,
          angerScore: emotionInfo
            ? parseFloatSafe(emotionInfo["Raiva (BERT)"])
            : 0.5,
          fearScore: emotionInfo
            ? parseFloatSafe(emotionInfo["Medo (BERT)"])
            : 0.5,
          surpriseScore: emotionInfo
            ? parseFloatSafe(emotionInfo["Surpresa (BERT)"])
            : 0.5,

          // Características Spotify
          danceability: parseFloatSafe(musica["Dançabilidade"]) || null,
          energy: parseFloatSafe(musica["Energia"]) || null,
          valence: parseFloatSafe(musica["Valência"]) || null,
          acousticness: parseFloatSafe(musica["Acústica"]) || null,
          instrumentalness: parseFloatSafe(musica["Instrumental"]) || null,
        },
      });

      spotifyIdCount++;
      totalProcessed++;

      if (totalProcessed % 100 === 0) {
        console.log(`  ⏳ ${totalProcessed} processadas...`);
      }
    } catch (error) {
      console.log(`  ❌ Erro: ${error.message}`);
    }
  }

  // PARTE 2: Músicas SEM Spotify ID
  console.log("\n💿 Processando SEM Spotify ID...");
  for (const musica of emotionData) {
    const nome = normalizeString(musica["Nome da Música"]);
    const artista = normalizeString(musica["ID do Artista"]);

    if (!nome) continue;

    try {
      await prisma.music.create({
        data: {
          spotifyId: null,
          name: nome,
          artist: artista || "Artista Desconhecido",
          album: null,
          duration: null,
          genre: normalizeString(musica["Gênero"]) || "Desconhecido",

          // Scores do próprio arquivo
          sadnessScore: parseFloatSafe(musica["Tristeza"]),
          joyScore: parseFloatSafe(musica["Alegria"]),
          angerScore: parseFloatSafe(musica["Raiva"]),
          fearScore: parseFloatSafe(musica["Medo"]),
          surpriseScore: parseFloatSafe(musica["Surpresa"]),

          // Características vazias
          danceability: null,
          energy: null,
          valence: null,
          acousticness: null,
          instrumentalness: null,
        },
      });

      noSpotifyIdCount++;
      totalProcessed++;

      if (totalProcessed % 500 === 0) {
        console.log(`  ⏳ ${totalProcessed} processadas...`);
      }
    } catch (error) {
      console.log(`  ❌ Erro "${nome}": ${error.message}`);
    }
  }

  // Estatísticas
  console.log("\n📈 RESULTADO:");
  console.log(`✅ Total: ${totalProcessed}`);
  console.log(`🎧 Com Spotify ID: ${spotifyIdCount}`);
  console.log(`💿 Sem Spotify ID: ${noSpotifyIdCount}`);

  const finalCount = await prisma.music.count();
  console.log(`🗄️  No banco: ${finalCount}`);

  console.log("\n🎉 Concluído!");
}

async function main() {
  try {
    await populateAllMusic();
  } catch (error) {
    console.error("❌ Erro:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
