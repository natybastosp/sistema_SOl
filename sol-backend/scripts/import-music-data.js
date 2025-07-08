// Script completo para importação de dados musicais do Sistema SOL
// Baseado nos CSVs reais: musicas_perifericas.csv, emotion_music_data_original.csv, emotion_music_data.csv

import { PrismaClient } from "@prisma/client";
import fs from "fs";
import Papa from "papaparse";
import path from "path";

const prisma = new PrismaClient();

// Configurações
const DATA_FOLDER = "./data";
const BATCH_SIZE = 50; // Reduzido para evitar timeout em transações grandes

/**
 * Lê e processa os arquivos CSV específicos do projeto SOL
 */
async function readCSVFiles() {
  console.log("📂 Lendo arquivos CSV...");

  const csvData = {
    musicasPerifericasData: null,
    emotionOriginalData: null,
    emotionMainData: null,
  };

  try {
    // 1. Ler musicas_perifericas.csv (2184 rows, 23 columns)
    const musicasPath = path.join(DATA_FOLDER, "musicas_perifericas.csv");
    if (fs.existsSync(musicasPath)) {
      const musicasContent = fs.readFileSync(musicasPath, "utf8");
      csvData.musicasPerifericasData = Papa.parse(musicasContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
      }).data;
      console.log(
        `   ✅ Músicas Periféricas: ${csvData.musicasPerifericasData.length} registros`
      );
    }

    // 2. Ler emotion_music_data_original.csv (2184 rows, 12 columns)
    const emotionOriginalPath = path.join(
      DATA_FOLDER,
      "emotion_music_data_original.csv"
    );
    if (fs.existsSync(emotionOriginalPath)) {
      const emotionOriginalContent = fs.readFileSync(
        emotionOriginalPath,
        "utf8"
      );
      csvData.emotionOriginalData = Papa.parse(emotionOriginalContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
      }).data;
      console.log(
        `   ✅ Emoções Original (BERT/GPT): ${csvData.emotionOriginalData.length} registros`
      );
    }

    // 3. Ler emotion_music_data.csv (22230 rows, 11 columns)
    const emotionMainPath = path.join(DATA_FOLDER, "emotion_music_data.csv");
    if (fs.existsSync(emotionMainPath)) {
      const emotionMainContent = fs.readFileSync(emotionMainPath, "utf8");
      csvData.emotionMainData = Papa.parse(emotionMainContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
      }).data;
      console.log(
        `   ✅ Emoções Principal: ${csvData.emotionMainData.length} registros`
      );
    }

    return csvData;
  } catch (error) {
    console.error("❌ Erro ao ler arquivos CSV:", error);
    throw error;
  }
}

/**
 * Processa e normaliza os dados dos 3 CSVs
 */
async function processarDadosMusicais(csvData) {
  console.log("🔄 Processando e combinando dados dos CSVs...");

  const dadosProcessados = [];

  // Criar mapas para facilitar o cruzamento de dados
  const emotionOriginalMap = new Map(); // Spotify ID -> dados de emoção BERT/GPT
  const emotionMainMap = new Map(); // Nome da Música -> dados de emoção principal

  // Processar emotion_music_data_original.csv
  if (csvData.emotionOriginalData) {
    csvData.emotionOriginalData.forEach((row) => {
      const spotifyId = row["Spotify ID"];
      if (spotifyId) {
        emotionOriginalMap.set(spotifyId, {
          raivaBERT: parseFloat(row["Raiva (BERT)"]) || 0,
          medoBERT: parseFloat(row["Medo (BERT)"]) || 0,
          alegriaBERT: parseFloat(row["Alegria (BERT)"]) || 0,
          tristezaBERT: parseFloat(row["Tristeza (BERT)"]) || 0,
          surpresaBERT: parseFloat(row["Surpresa (BERT)"]) || 0,
          raivaGPT: parseFloat(row["Raiva (GPT)"]) || 0,
          medoGPT: parseFloat(row["Medo (GPT)"]) || 0,
          alegriaGPT: parseFloat(row["Alegria (GPT)"]) || 0,
          tristezaGPT: parseFloat(row["Tristeza (GPT)"]) || 0,
          surpresaGPT: parseFloat(row["Surpresa (GPT)"]) || 0,
        });
      }
    });
  }

  // Processar emotion_music_data.csv
  if (csvData.emotionMainData) {
    csvData.emotionMainData.forEach((row) => {
      const nomeMusica = row["Nome da Música"];
      if (nomeMusica) {
        emotionMainMap.set(nomeMusica.toLowerCase().trim(), {
          raiva: parseFloat(row["Raiva"]) || 0,
          medo: parseFloat(row["Medo"]) || 0,
          alegria: parseFloat(row["Alegria"]) || 0,
          tristeza: parseFloat(row["Tristeza"]) || 0,
          surpresa: parseFloat(row["Surpresa"]) || 0,
          genero: row["Gênero"] || "unknown",
          valor: parseInt(row["Valor"]) || 0,
          idArtista: row["ID do Artista"],
          letraTratada: row["Letra Tratada"],
        });
      }
    });
  }

  // Processar musicas_perifericas.csv como base principal
  if (csvData.musicasPerifericasData) {
    for (const musica of csvData.musicasPerifericasData) {
      try {
        const spotifyId = musica["ID do Spotify"];
        const nomeMusica = musica["Nome da Faixa"];
        const nomeArtista = musica["Nome do(s) Artista(s)"];

        // Buscar dados emocionais correspondentes
        const emotionOriginal = emotionOriginalMap.get(spotifyId) || {};
        const emotionMain =
          emotionMainMap.get(nomeMusica?.toLowerCase()?.trim()) || {};

        // Normalizar dados da música periférica
        const musicaProcessada = {
          // Dados básicos
          spotifyId: spotifyId,
          nome: nomeMusica,
          artista: nomeArtista,
          album: musica["Nome do Álbum"] || "Single",
          duracao: parseInt(musica["Duração (ms)"]) || null,
          popularidade: parseInt(musica["Popularidade"]) || 0,
          genero: musica["Gênero"] || emotionMain.genero || "unknown",
          decada: parseFloat(musica["Década"]) || null,

          // Atributos musicais do Spotify
          danceability: parseFloat(musica["Dançabilidade"]) || 0,
          energy: parseFloat(musica["Energia"]) || 0,
          valence: parseFloat(musica["Valência"]) || 0,
          tempo: parseFloat(musica["Ritmo"]) || 0,
          acousticness: parseFloat(musica["Acústica"]) || 0,
          instrumentalness: parseFloat(musica["Instrumental"]) || 0,
          speechiness: parseFloat(musica["Intensidade Vocal"]) || 0,
          loudness: parseFloat(musica["Intensidade Sonora"]) || 0,
          liveness: parseFloat(musica["Vivacidade"]) || 0,
          key: parseFloat(musica["Tonalidade"]) || 0,
          mode: parseFloat(musica["Modo Musical"]) || 0,

          // Análise emocional combinada (priorizar dados mais específicos)
          anger: emotionMain.raiva || emotionOriginal.raivaBERT || 0,
          fear: emotionMain.medo || emotionOriginal.medoBERT || 0,
          joy:
            emotionMain.alegria ||
            emotionOriginal.alegriaBERT ||
            parseFloat(musica["Valência"]) ||
            0,
          sadness:
            emotionMain.tristeza ||
            emotionOriginal.tristezaBERT ||
            1 - (parseFloat(musica["Valência"]) || 0),
          surprise: emotionMain.surpresa || emotionOriginal.surpresaBERT || 0,

          // Dados adicionais
          letra: musica["Letra"] || emotionMain.letraTratada,
          frequenciaPalavras: musica["Frequência de Palavras"],
          idsArtista: musica["IDs do Artista"] || emotionMain.idArtista,
        };

        // Validar dados obrigatórios
        if (
          musicaProcessada.nome &&
          musicaProcessada.artista &&
          musicaProcessada.spotifyId
        ) {
          dadosProcessados.push(musicaProcessada);
        } else {
          console.warn(
            `⚠️ Música inválida (faltam dados obrigatórios): ${nomeMusica} - ${nomeArtista}`
          );
        }
      } catch (error) {
        console.warn(
          `⚠️ Erro ao processar música: ${musica["Nome da Faixa"]}`,
          error.message
        );
      }
    }
  }

  console.log(`   ✅ Processadas: ${dadosProcessados.length} músicas válidas`);
  console.log(
    `   📊 Dados combinados de ${
      csvData.musicasPerifericasData?.length || 0
    } músicas periféricas`
  );
  console.log(
    `   📊 + ${csvData.emotionOriginalData?.length || 0} análises BERT/GPT`
  );
  console.log(
    `   📊 + ${
      csvData.emotionMainData?.length || 0
    } análises emocionais principais`
  );

  return dadosProcessados;
}

/**
 * Insere dados no banco PostgreSQL usando o schema SOL
 */
async function inserirNoBanco(dadosProcessados) {
  console.log("💾 Importando para o banco de dados PostgreSQL...");

  let contadorInseridos = 0;
  let contadorErros = 0;
  let contadorDuplicatas = 0;

  // Processar em lotes menores para evitar timeout
  for (let i = 0; i < dadosProcessados.length; i += BATCH_SIZE) {
    const lote = dadosProcessados.slice(i, i + BATCH_SIZE);

    try {
      await prisma.$transaction(
        async (tx) => {
          for (const musica of lote) {
            try {
              // Verificar se já existe (por Spotify ID)
              const musicaExistente = await tx.music.findUnique({
                where: { spotifyId: musica.spotifyId },
              });

              if (musicaExistente) {
                contadorDuplicatas++;
                continue;
              }

              // Criar música no schema SOL
              await tx.music.create({
                data: {
                  spotifyId: musica.spotifyId,
                  name: musica.nome,
                  artist: musica.artista,
                  album: musica.album,
                  duration: musica.duracao,
                  genre: musica.genero,

                  // Atributos emocionais
                  anger: musica.anger,
                  fear: musica.fear,
                  joy: musica.joy,
                  sadness: musica.sadness,
                  surprise: musica.surprise,

                  // Atributos musicais do Spotify
                  danceability: musica.danceability,
                  energy: musica.energy,
                  valence: musica.valence,
                  acousticness: musica.acousticness,
                  instrumentalness: musica.instrumentalness,
                  speechiness: musica.speechiness,
                  tempo: musica.tempo,
                },
              });

              contadorInseridos++;
            } catch (error) {
              if (error.code === "P2002") {
                contadorDuplicatas++;
              } else {
                console.warn(
                  `⚠️ Erro ao inserir: ${musica.nome} - ${error.message}`
                );
                contadorErros++;
              }
            }
          }
        },
        {
          timeout: 30000, // 30 segundos de timeout por transação
        }
      );

      // Mostrar progresso
      const progresso = Math.round(
        ((i + BATCH_SIZE) / dadosProcessados.length) * 100
      );
      console.log(
        `   📊 Progresso: ${Math.min(
          progresso,
          100
        )}% | Inseridas: ${contadorInseridos} | Duplicatas: ${contadorDuplicatas} | Erros: ${contadorErros}`
      );
    } catch (error) {
      console.error(`❌ Erro no lote ${i}-${i + BATCH_SIZE}:`, error.message);
      contadorErros += lote.length;
    }
  }

  return {
    inseridos: contadorInseridos,
    erros: contadorErros,
    duplicatas: contadorDuplicatas,
  };
}

/**
 * Gera estatísticas detalhadas da importação
 */
async function gerarEstatisticas() {
  console.log("📊 Gerando estatísticas do banco...");

  try {
    const stats = {
      totalMusicas: await prisma.music.count(),
      totalUsuarios: await prisma.user.count(),
      totalPlaylists: await prisma.playlist.count(),
      totalFeedbacks: await prisma.feedback.count(),

      // Estatísticas por gênero
      musicasPorGenero: await prisma.music.groupBy({
        by: ["genre"],
        _count: { genre: true },
        orderBy: { _count: { genre: "desc" } },
        take: 10,
      }),

      // Estatísticas emocionais
      mediaEmocional: await prisma.music.aggregate({
        _avg: {
          anger: true,
          fear: true,
          joy: true,
          sadness: true,
          surprise: true,
        },
      }),
    };

    return stats;
  } catch (error) {
    console.error("❌ Erro ao gerar estatísticas:", error);
    return {
      totalMusicas: 0,
      totalUsuarios: 0,
      totalPlaylists: 0,
      totalFeedbacks: 0,
    };
  }
}

/**
 * Função principal de importação com os CSVs reais
 */
async function runMusicDataImport() {
  try {
    console.log("🎵 Iniciando importação dos dados musicais do Sistema SOL...");

    // 1. Ler os 3 arquivos CSV
    const csvData = await readCSVFiles();

    // Verificar se pelo menos um arquivo foi lido
    if (!csvData.musicasPerifericasData && !csvData.emotionMainData) {
      throw new Error(
        "Nenhum arquivo CSV válido foi encontrado na pasta data/"
      );
    }

    // 2. Processar e combinar dados
    const dadosProcessados = await processarDadosMusicais(csvData);

    if (dadosProcessados.length === 0) {
      throw new Error("Nenhum dado válido para importar após processamento");
    }

    // 3. Inserir no banco PostgreSQL
    const resultado = await inserirNoBanco(dadosProcessados);

    // 4. Gerar estatísticas finais
    const stats = await gerarEstatisticas();

    return {
      ...resultado,
      ...stats,
      totalProcessados: dadosProcessados.length,
    };
  } catch (error) {
    console.error("💥 Erro crítico na importação:", error);
    throw error;
  }
}

/**
 * Função principal do script
 */
async function main() {
  console.log("🎵 SOL - Sistema de Importação de Dados Musicais");
  console.log("===============================================");
  console.log("");
  console.log("📂 Arquivos CSV esperados na pasta 'data/':");
  console.log(
    "  • musicas_perifericas.csv (2.184 músicas com atributos Spotify)"
  );
  console.log("  • emotion_music_data_original.csv (2.184 análises BERT/GPT)");
  console.log("  • emotion_music_data.csv (22.230 análises emocionais)");
  console.log("");

  const startTime = Date.now();

  try {
    // Verificar conexão com PostgreSQL
    await prisma.$connect();
    console.log("✅ Conexão com PostgreSQL estabelecida");
    console.log("");

    // Executar importação
    const resultado = await runMusicDataImport();

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log("");
    console.log("🎉 IMPORTAÇÃO CONCLUÍDA COM SUCESSO! 🎉");
    console.log("==========================================");
    console.log(`⏱️  Tempo total: ${duration} segundos`);
    console.log("");
    console.log("📊 ESTATÍSTICAS FINAIS:");
    console.log(`   🎵 Músicas inseridas: ${resultado.inseridos}`);
    console.log(`   📁 Total processadas: ${resultado.totalProcessados}`);
    console.log(`   🔄 Duplicatas ignoradas: ${resultado.duplicatas || 0}`);
    console.log(`   ❌ Erros encontrados: ${resultado.erros}`);
    console.log(`   👤 Usuários no sistema: ${resultado.totalUsuarios}`);
    console.log(`   🎼 Playlists existentes: ${resultado.totalPlaylists}`);
    console.log("");

    if (resultado.musicasPorGenero && resultado.musicasPorGenero.length > 0) {
      console.log("🎭 TOP GÊNEROS MUSICAIS:");
      resultado.musicasPorGenero.slice(0, 5).forEach((genero, index) => {
        console.log(
          `   ${index + 1}. ${genero.genre}: ${genero._count.genre} músicas`
        );
      });
      console.log("");
    }

    if (resultado.mediaEmocional) {
      console.log("😊 MÉDIAS EMOCIONAIS DO CATÁLOGO:");
      console.log(
        `   😡 Raiva: ${(resultado.mediaEmocional._avg.anger || 0).toFixed(3)}`
      );
      console.log(
        `   😨 Medo: ${(resultado.mediaEmocional._avg.fear || 0).toFixed(3)}`
      );
      console.log(
        `   😊 Alegria: ${(resultado.mediaEmocional._avg.joy || 0).toFixed(3)}`
      );
      console.log(
        `   😢 Tristeza: ${(resultado.mediaEmocional._avg.sadness || 0).toFixed(
          3
        )}`
      );
      console.log(
        `   😮 Surpresa: ${(
          resultado.mediaEmocional._avg.surprise || 0
        ).toFixed(3)}`
      );
      console.log("");
    }

    console.log("🚀 PRÓXIMOS PASSOS:");
    console.log("1. Execute 'npx prisma studio' para visualizar os dados");
    console.log("2. Implemente o sistema de lógica fuzzy para recomendações");
    console.log("3. Crie endpoints da API para o sistema de recomendação");
    console.log("4. Teste o primeiro fluxo de recomendação musical");
  } catch (error) {
    console.error("");
    console.error("❌ ERRO DURANTE A IMPORTAÇÃO:");
    console.error("==============================");
    console.error(error.message);
    console.error("");
    console.error("🔍 VERIFICAÇÕES RECOMENDADAS:");
    console.error("• Os arquivos CSV estão na pasta 'data/'?");
    console.error("• O PostgreSQL está rodando na porta 5432?");
    console.error("• O banco 'sol_db' foi criado?");
    console.error("• As migrações do Prisma foram aplicadas?");
    console.error("• As variáveis de ambiente estão configuradas?");
    console.error("");
    console.error("💡 COMANDOS ÚTEIS:");
    console.error("• npx prisma db push");
    console.error("• npx prisma generate");
    console.error("• npx prisma studio");

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
main();
