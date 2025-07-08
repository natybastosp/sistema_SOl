import { PrismaClient } from "@prisma/client";
import * as fs from "fs-extra";
import * as csv from "csv-parser";
import * as path from "path";

const prisma = new PrismaClient();

// Interfaces para os dados dos CSVs
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

interface EmotionMusicOriginal {
  "": string;
  "Spotify ID": string;
  "Raiva (BERT)": string;
  "Medo (BERT)": string;
  "Alegria (BERT)": string;
  "Tristeza (BERT)": string;
  "Surpresa (BERT)": string;
  "Raiva (GPT)": string;
  "Medo (GPT)": string;
  "Alegria (GPT)": string;
  "Tristeza (GPT)": string;
  "Surpresa (GPT)": string;
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

// Função para ler CSV
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

// Função para normalizar valores numéricos
function parseFloat(value: string | undefined): number {
  if (!value || value === "") return 0;
  const parsed = Number(value.replace(",", "."));
  return isNaN(parsed) ? 0 : parsed;
}

// Função para normalizar strings
function normalizeString(value: string | undefined): string {
  if (!value) return "";
  return value.trim();
}

async function main() {
  console.log("🚀 Iniciando seed do banco de dados...");

  // Caminhos dos arquivos CSV
  const dataPath = path.join(process.cwd(), "data");
  const emotionDataPath = path.join(dataPath, "emotion_music_data.csv");
  const emotionOriginalPath = path.join(
    dataPath,
    "emotion_music_data_original.csv"
  );
  const musicasPerifericasPath = path.join(dataPath, "musicas_perifericas.csv");

  console.log("📂 Verificando arquivos CSV...");
  console.log(
    `- emotion_music_data.csv: ${fs.existsSync(emotionDataPath) ? "✅" : "❌"}`
  );
  console.log(
    `- emotion_music_data_original.csv: ${
      fs.existsSync(emotionOriginalPath) ? "✅" : "❌"
    }`
  );
  console.log(
    `- musicas_perifericas.csv: ${
      fs.existsSync(musicasPerifericasPath) ? "✅" : "❌"
    }`
  );

  // Ler todos os CSVs
  const [emotionData, emotionOriginal, musicasPerifiericas] = await Promise.all(
    [
      readCSV<EmotionMusicData>(emotionDataPath),
      readCSV<EmotionMusicOriginal>(emotionOriginalPath),
      readCSV<MusicasPerifericasData>(musicasPerifericasPath),
    ]
  );

  console.log("\n📊 Resumo dos dados:");
  console.log(`- Emotion Music Data: ${emotionData.length} registros`);
  console.log(`- Emotion Original: ${emotionOriginal.length} registros`);
  console.log(`- Músicas Periféricas: ${musicasPerifiericas.length} registros`);

  // Primeiro, vamos limpar as tabelas existentes
  console.log("\n🧹 Limpando tabelas existentes...");
  await prisma.feedback.deleteMany();
  await prisma.playlistMusic.deleteMany();
  await prisma.playlist.deleteMany();
  await prisma.emotionalState.deleteMany();
  await prisma.music.deleteMany();
  await prisma.user.deleteMany();

  // Criar mapa de dados emocionais por Spotify ID
  const emotionMap = new Map<string, EmotionMusicOriginal>();
  emotionOriginal.forEach((emotion) => {
    const spotifyId = normalizeString(emotion["Spotify ID"]);
    if (spotifyId) {
      emotionMap.set(spotifyId, emotion);
    }
  });

  console.log(`\n🎵 Processando músicas com Spotify ID...`);

  let processedCount = 0;
  let errorCount = 0;

  // Processar músicas que têm Spotify ID
  for (const musica of musicasPerifiericas) {
    const spotifyId = normalizeString(musica["ID do Spotify"]);

    if (!spotifyId) {
      continue; // Pular músicas sem Spotify ID
    }

    try {
      // Buscar dados emocionais correspondentes
      const emotionInfo = emotionMap.get(spotifyId);

      // Preparar dados da música
      const musicData = {
        spotifyId: spotifyId,
        name: normalizeString(musica["Nome da Faixa"]) || "Nome não disponível",
        artist:
          normalizeString(musica["Nome do(s) Artista(s)"]) ||
          "Artista não disponível",
        album: normalizeString(musica["Nome do Álbum"]) || undefined,
        duration: parseFloat(musica["Duração (ms)"]) || undefined,
        genre: normalizeString(musica["Gênero"]) || "Desconhecido",

        // Scores emocionais (usando BERT se disponível, senão valores padrão)
        sadnessScore: emotionInfo
          ? parseFloat(emotionInfo["Tristeza (BERT)"])
          : 0.5,
        joyScore: emotionInfo ? parseFloat(emotionInfo["Alegria (BERT)"]) : 0.5,
        angerScore: emotionInfo ? parseFloat(emotionInfo["Raiva (BERT)"]) : 0.5,
        fearScore: emotionInfo ? parseFloat(emotionInfo["Medo (BERT)"]) : 0.5,
        surpriseScore: emotionInfo
          ? parseFloat(emotionInfo["Surpresa (BERT)"])
          : 0.5,

        // Características de áudio do Spotify
        danceability: parseFloat(musica["Dançabilidade"]) || undefined,
        energy: parseFloat(musica["Energia"]) || undefined,
        valence: parseFloat(musica["Valência"]) || undefined,
        acousticness: parseFloat(musica["Acústica"]) || undefined,
        instrumentalness: parseFloat(musica["Instrumental"]) || undefined,
      };

      // Inserir no banco
      await prisma.music.create({
        data: musicData,
      });

      processedCount++;

      if (processedCount % 100 === 0) {
        console.log(`  ⏳ Processadas ${processedCount} músicas...`);
      }
    } catch (error) {
      errorCount++;
      console.log(`  ❌ Erro ao processar música ${spotifyId}: ${error}`);

      if (errorCount > 10) {
        console.log("  ⚠️  Muitos erros detectados, parando o processamento.");
        break;
      }
    }
  }

  console.log("\n📈 Estatísticas do processamento:");
  console.log(`✅ Músicas processadas com sucesso: ${processedCount}`);
  console.log(`❌ Erros encontrados: ${errorCount}`);

  // Criar usuário de exemplo para testes
  console.log("\n👤 Criando usuário de exemplo...");
  const exampleUser = await prisma.user.create({
    data: {
      email: "usuario@exemplo.com",
      name: "Usuário Exemplo",
      password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
      musicPreferences: ["Rock", "Pop", "MPB"],
    },
  });

  // Criar estado emocional de exemplo
  console.log("😊 Criando estado emocional de exemplo...");
  const exampleEmotionalState = await prisma.emotionalState.create({
    data: {
      userId: exampleUser.id,
      sadness: 3.0,
      joy: 7.0,
      anger: 2.0,
      fear: 4.0,
      surprise: 5.0,
    },
  });

  console.log("\n🎉 Seed concluído com sucesso!");
  console.log("📊 Resumo final:");

  const totalMusics = await prisma.music.count();
  const totalUsers = await prisma.user.count();
  const totalEmotionalStates = await prisma.emotionalState.count();

  console.log(`🎵 Total de músicas no banco: ${totalMusics}`);
  console.log(`👥 Total de usuários: ${totalUsers}`);
  console.log(`😊 Total de estados emocionais: ${totalEmotionalStates}`);
}

main()
  .catch((e) => {
    console.error("❌ Erro durante o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
