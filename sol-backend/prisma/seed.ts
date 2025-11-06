import { PrismaClient } from "@prisma/client";
import * as fs from "fs-extra";
import csv from "csv-parser";
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

interface EnrichedMusicData {
  spotifyId: string;
  spotifyUri: string;
  name: string;
  artist: string;
  album: string;
  duration: string;
  genre: string;
  sadnessScore: string;
  joyScore: string;
  angerScore: string;
  fearScore: string;
  surpriseScore: string;
  danceability: string;
  energy: string;
  valence: string;
  acousticness: string;
  instrumentalness: string;
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

  // Processar arquivo enriquecido (se existir)
  const enrichedPath = path.join(dataPath, "music_data_enriched.csv");
  if (fs.existsSync(enrichedPath)) {
    console.log(`\n🎵 Processando músicas enriquecidas...`);
    const enrichedData = await readCSV<EnrichedMusicData>(enrichedPath);

    let enrichedProcessedCount = 0;
    let enrichedErrorCount = 0;

    for (const musica of enrichedData) {
      const spotifyId = normalizeString(musica.spotifyId);

      if (!spotifyId) {
        continue;
      }

      try {
        // Verificar se já existe (da periférica)
        const existing = await prisma.music.findUnique({
          where: { spotifyId: spotifyId },
        });

        if (existing) {
          // Já existe, pular
          continue;
        }

        const musicData = {
          spotifyId: spotifyId,
          spotifyUri: normalizeString(musica.spotifyUri) || undefined,
          name: normalizeString(musica.name) || "Desconhecido",
          artist: normalizeString(musica.artist) || "Desconhecido",
          album: normalizeString(musica.album) || undefined,
          duration: parseFloat(musica.duration) || undefined,
          genre: normalizeString(musica.genre) || "Desconhecido",
          sadnessScore: parseFloat(musica.sadnessScore) || 0.5,
          joyScore: parseFloat(musica.joyScore) || 0.5,
          angerScore: parseFloat(musica.angerScore) || 0.5,
          fearScore: parseFloat(musica.fearScore) || 0.5,
          surpriseScore: parseFloat(musica.surpriseScore) || 0.5,
          danceability: parseFloat(musica.danceability) || undefined,
          energy: parseFloat(musica.energy) || undefined,
          valence: parseFloat(musica.valence) || undefined,
          acousticness: parseFloat(musica.acousticness) || undefined,
          instrumentalness: parseFloat(musica.instrumentalness) || undefined,
        };

        await prisma.music.create({
          data: musicData,
        });

        enrichedProcessedCount++;

        if (enrichedProcessedCount % 500 === 0) {
          console.log(
            `  ⏳ Processadas ${enrichedProcessedCount} músicas enriquecidas...`
          );
        }
      } catch (error) {
        enrichedErrorCount++;
        if (enrichedErrorCount <= 5) {
          console.log(`  ❌ Erro ao processar música enriquecida: ${error}`);
        }
      }
    }

    console.log(`\n📈 Estatísticas das enriquecidas:`);
    console.log(`✅ Músicas enriquecidas inseridas: ${enrichedProcessedCount}`);
    console.log(`❌ Erros: ${enrichedErrorCount}`);
  }

  // Criar 2 usuários de exemplo para testes
  console.log("\n👤 Criando usuários de exemplo...");
  const user1 = await prisma.user.create({
    data: {
      email: "usuario1@exemplo.com",
      name: "Usuário 1",
      password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
      musicPreferences: ["Rock", "Pop"],
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "usuario2@exemplo.com",
      name: "Usuário 2",
      password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
      musicPreferences: ["Jazz", "Clássico"],
    },
  });

  console.log("✅ Usuários criados");

  // Criar estados emocionais para ambos usuários
  console.log("😊 Criando estados emocionais...");
  const emotionalState1 = await prisma.emotionalState.create({
    data: {
      userId: user1.id,
      sadness: 2.0,
      joy: 8.0,
      anger: 1.0,
      fear: 2.0,
      surprise: 5.0,
    },
  });

  const emotionalState2 = await prisma.emotionalState.create({
    data: {
      userId: user1.id,
      sadness: 6.0,
      joy: 3.0,
      anger: 5.0,
      fear: 7.0,
      surprise: 2.0,
    },
  });

  const emotionalState3 = await prisma.emotionalState.create({
    data: {
      userId: user2.id,
      sadness: 4.0,
      joy: 6.0,
      anger: 2.0,
      fear: 3.0,
      surprise: 4.0,
    },
  });

  console.log("✅ Estados emocionais criados");

  // Buscar algumas músicas para criar playlists
  console.log("🎵 Buscando músicas para as playlists...");
  const musicsForPlaylists = await prisma.music.findMany({
    take: 60, // Pegar 60 músicas
  });

  if (musicsForPlaylists.length < 20) {
    console.log("❌ Não há músicas suficientes no banco para criar playlists");
    console.log(
      `⚠️  Encontradas apenas ${musicsForPlaylists.length} músicas, precisa de pelo menos 20`
    );
  } else {
    console.log(`✅ ${musicsForPlaylists.length} músicas encontradas`);

    // Criar 3 playlists
    console.log("\n🎵 Criando playlists...");

    // Playlist 1 - Para usuário 1 - estado 1 (alegre)
    const playlist1 = await prisma.playlist.create({
      data: {
        userId: user1.id,
        emotionalStateId: emotionalState1.id,
        name: "Playlist Alegre",
        description: "Músicas para dias de alegria e energia",
      },
    });

    // Adicionar 15 músicas à playlist 1
    for (let i = 0; i < 15 && i < musicsForPlaylists.length; i++) {
      await prisma.playlistMusic.create({
        data: {
          playlistId: playlist1.id,
          musicId: musicsForPlaylists[i].id,
          position: i + 1,
        },
      });
    }

    // Playlist 2 - Para usuário 1 - estado 2 (triste)
    const playlist2 = await prisma.playlist.create({
      data: {
        userId: user1.id,
        emotionalStateId: emotionalState2.id,
        name: "Playlist Melancólica",
        description: "Músicas para reflexão e introspecção",
      },
    });

    // Adicionar 15 músicas à playlist 2
    for (let i = 15; i < 30 && i < musicsForPlaylists.length; i++) {
      await prisma.playlistMusic.create({
        data: {
          playlistId: playlist2.id,
          musicId: musicsForPlaylists[i].id,
          position: i - 14,
        },
      });
    }

    // Playlist 3 - Para usuário 2
    const playlist3 = await prisma.playlist.create({
      data: {
        userId: user2.id,
        emotionalStateId: emotionalState3.id,
        name: "Playlist Balanceada",
        description: "Músicas para um estado emocional equilibrado",
      },
    });

    // Adicionar 15 músicas à playlist 3
    for (let i = 30; i < 45 && i < musicsForPlaylists.length; i++) {
      await prisma.playlistMusic.create({
        data: {
          playlistId: playlist3.id,
          musicId: musicsForPlaylists[i].id,
          position: i - 29,
        },
      });
    }

    console.log("✅ 3 playlists criadas com músicas");

    // Criar RecommendationHistories (simulando análises fuzzy)
    console.log("\n� Criando históricos de recomendações...");

    const history1 = await prisma.recommendationHistory.create({
      data: {
        userId: user1.id,
        estadoEmocional: 8,
        generoPreferido: "Rock",
        intencaoPlaylist: "Energético",
        grauConfianca: 0.85,
        valorIntencao: 0.9,
        descricao: "Playlist gerada baseada em análise fuzzy - Estado alegre",
        grauTriste: 0.1,
        grauAnsioso: 0.2,
        grauNeutro: 0.15,
        grauAlegre: 0.85,
        criteriosJson: {
          energia: "alta",
          valência: "alta",
          gêneros: ["Rock", "Pop"],
        },
        totalMusicas: 15,
        duracaoMinutos: 45,
        valenciaMedia: 0.8,
        energiaMedia: 0.85,
        tristezaMedia: 0.1,
        alegriaMedia: 0.9,
      },
    });

    // Adicionar músicas ao histórico 1
    for (let i = 0; i < 15 && i < musicsForPlaylists.length; i++) {
      await prisma.historyMusic.create({
        data: {
          historyId: history1.id,
          musicId: musicsForPlaylists[i].id,
          position: i + 1,
        },
      });
    }

    const history2 = await prisma.recommendationHistory.create({
      data: {
        userId: user1.id,
        estadoEmocional: 3,
        generoPreferido: "Jazz",
        intencaoPlaylist: "Melancólico",
        grauConfianca: 0.78,
        valorIntencao: 0.75,
        descricao: "Playlist para reflexão e calma",
        grauTriste: 0.8,
        grauAnsioso: 0.3,
        grauNeutro: 0.2,
        grauAlegre: 0.1,
        criteriosJson: {
          energia: "baixa",
          valência: "baixa",
          gêneros: ["Jazz", "Clássico"],
        },
        totalMusicas: 15,
        duracaoMinutos: 50,
        valenciaMedia: 0.3,
        energiaMedia: 0.4,
        tristezaMedia: 0.85,
        alegriaMedia: 0.15,
      },
    });

    // Adicionar músicas ao histórico 2
    for (let i = 15; i < 30 && i < musicsForPlaylists.length; i++) {
      await prisma.historyMusic.create({
        data: {
          historyId: history2.id,
          musicId: musicsForPlaylists[i].id,
          position: i - 14,
        },
      });
    }

    const history3 = await prisma.recommendationHistory.create({
      data: {
        userId: user2.id,
        estadoEmocional: 5,
        generoPreferido: "Pop",
        intencaoPlaylist: "Neutro",
        grauConfianca: 0.82,
        valorIntencao: 0.8,
        descricao: "Playlist balanceada com bom mix",
        grauTriste: 0.3,
        grauAnsioso: 0.25,
        grauNeutro: 0.45,
        grauAlegre: 0.35,
        criteriosJson: {
          energia: "média",
          valência: "média",
          gêneros: ["Pop", "Rock"],
        },
        totalMusicas: 15,
        duracaoMinutos: 48,
        valenciaMedia: 0.6,
        energiaMedia: 0.65,
        tristezaMedia: 0.35,
        alegriaMedia: 0.6,
      },
    });

    // Adicionar músicas ao histórico 3
    for (let i = 30; i < 45 && i < musicsForPlaylists.length; i++) {
      await prisma.historyMusic.create({
        data: {
          historyId: history3.id,
          musicId: musicsForPlaylists[i].id,
          position: i - 29,
        },
      });
    }

    console.log("✅ 3 históricos de recomendações criados");

    // Criar Feedbacks
    console.log("\n⭐ Criando feedbacks...");

    await prisma.feedback.create({
      data: {
        userId: user1.id,
        playlistId: playlist1.id,
        rating: 5,
        comment: "Excelente playlist! Adorei as músicas selecionadas.",
        postSadness: 1.0,
        postJoy: 9.0,
        postAnger: 0.5,
        postFear: 0.5,
        postSurprise: 4.0,
      },
    });

    await prisma.feedback.create({
      data: {
        userId: user1.id,
        playlistId: playlist2.id,
        rating: 4,
        comment: "Boa seleção para refletir, muito melancólica",
        postSadness: 5.0,
        postJoy: 3.0,
        postAnger: 2.0,
        postFear: 6.0,
        postSurprise: 2.0,
      },
    });

    await prisma.feedback.create({
      data: {
        userId: user2.id,
        playlistId: playlist3.id,
        rating: 5,
        comment: "Perfeito! Mix ideal para qualquer momento",
        postSadness: 3.0,
        postJoy: 7.0,
        postAnger: 1.0,
        postFear: 2.0,
        postSurprise: 5.0,
      },
    });

    console.log("✅ 3 feedbacks criados");
  }

  console.log("\n🎉 Seed concluído com sucesso!");
  console.log("📊 Resumo final:");

  const totalMusics = await prisma.music.count();
  const totalUsers = await prisma.user.count();
  const totalEmotionalStates = await prisma.emotionalState.count();
  const totalPlaylists = await prisma.playlist.count();
  const totalPlaylistMusics = await prisma.playlistMusic.count();
  const totalHistories = await prisma.recommendationHistory.count();
  const totalHistoryMusics = await prisma.historyMusic.count();
  const totalFeedbacks = await prisma.feedback.count();

  console.log(`\n🎵 Total de músicas no banco: ${totalMusics}`);
  console.log(`👥 Total de usuários: ${totalUsers}`);
  console.log(`😊 Total de estados emocionais: ${totalEmotionalStates}`);
  console.log(`🎵 Total de playlists: ${totalPlaylists}`);
  console.log(`📍 Total de PlaylistMusic: ${totalPlaylistMusics}`);
  console.log(`📊 Total de históricos de recomendações: ${totalHistories}`);
  console.log(`📍 Total de HistoryMusic: ${totalHistoryMusics}`);
  console.log(`⭐ Total de feedbacks: ${totalFeedbacks}`);

  console.log("\n📝 Credenciais de teste:");
  console.log("  Email: usuario1@exemplo.com | Senha: password");
  console.log("  Email: usuario2@exemplo.com | Senha: password");
}

main()
  .catch((e) => {
    console.error("❌ Erro durante o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
