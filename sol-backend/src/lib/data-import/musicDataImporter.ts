const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const Papa = require("papaparse");

const prisma = new PrismaClient();

// Configuração global para processamento
const CONFIG = {
  BATCH_SIZE: 100,
  MAX_RETRIES: 3,
  DELAY_BETWEEN_BATCHES: 100, // ms
  LOG_PROGRESS_EVERY: 500, // registros
};

class SolMusicImporter {
  constructor() {
    this.stats = {
      totalProcessed: 0,
      totalErrors: 0,
      startTime: null,
      emotionalDataCount: 0,
      spotifyDataCount: 0,
      successfulInserts: 0,
    };
  }

  /**
   * Método principal que coordena toda a importação
   * Como um maestro dirigindo uma orquestra de dados
   */
  async importAllMusicData() {
    console.log("🎵 SOL - Sistema Inteligente de Importação Musical");
    console.log("================================================");
    console.log("");

    this.stats.startTime = Date.now();

    try {
      // Etapa 1: Verificar ambiente e arquivos
      await this.validateEnvironment();

      // Etapa 2: Limpar dados existentes (se necessário)
      await this.prepareDatabase();

      // Etapa 3: Carregar e processar dados emocionais
      console.log("😊 Carregando dados de análise emocional...");
      const emotionalData = await this.loadEmotionalData();

      // Etapa 4: Carregar dados musicais do Spotify
      console.log("🎧 Carregando dados musicais do Spotify...");
      const spotifyData = await this.loadSpotifyData();

      // Etapa 5: Combinar e importar dados
      console.log("🔄 Combinando dados e importando para o banco...");
      await this.combineAndImportData(emotionalData, spotifyData);

      // Etapa 6: Validar e gerar relatório
      await this.generateFinalReport();
    } catch (error) {
      console.error("❌ Erro crítico durante a importação:", error.message);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }

  /**
   * Valida se o ambiente está pronto para importação
   * Como verificar se todos os instrumentos estão afinados antes do concerto
   */
  async validateEnvironment() {
    console.log("🔍 Validando ambiente de importação...");

    // Verificar conexão com banco
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log("   ✓ Conexão com PostgreSQL estabelecida");
    } catch (error) {
      throw new Error(
        "Falha na conexão com banco de dados. Verifique se o Docker está rodando."
      );
    }

    // Verificar arquivos CSV
    const dataDir = path.join(process.cwd(), "data");
    const requiredFiles = ["emotion_music_data.csv", "musicas_perifericas.csv"];

    if (!fs.existsSync(dataDir)) {
      throw new Error(
        `Diretório 'data' não encontrado. Crie-o e coloque os arquivos CSV lá.`
      );
    }

    for (const file of requiredFiles) {
      const filePath = path.join(dataDir, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Arquivo ${file} não encontrado em ${dataDir}`);
      }
      console.log(`   ✓ Arquivo ${file} encontrado`);
    }
  }

  /**
   * Prepara o banco de dados para nova importação
   * Como limpar a tela antes de pintar um novo quadro
   */
  async prepareDatabase() {
    console.log("🧹 Preparando banco de dados...");

    // Contar registros existentes
    const existingCount = await prisma.music.count();

    if (existingCount > 0) {
      console.log(`   ⚠️  Encontradas ${existingCount} músicas existentes`);
      console.log("   🗑️  Removendo dados existentes para importação limpa...");

      // Remover em ordem para respeitar constraints de chave estrangeira
      await prisma.playlistMusic.deleteMany();
      await prisma.feedback.deleteMany();
      await prisma.playlist.deleteMany();
      await prisma.music.deleteMany();

      console.log("   ✓ Dados anteriores removidos com sucesso");
    } else {
      console.log("   ✓ Banco de dados limpo, pronto para importação");
    }
  }

  /**
   * Carrega dados emocionais usando Papa Parse
   * Papa Parse é mais robusto que csv-parser para dados complexos
   */
  async loadEmotionalData() {
    const filePath = path.join(process.cwd(), "data", "emotion_music_data.csv");

    return new Promise((resolve, reject) => {
      const fileContent = fs.readFileSync(filePath, "utf8");

      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true, // Converte automaticamente números
        complete: (results) => {
          if (results.errors.length > 0) {
            console.warn(
              "   ⚠️  Avisos durante parse:",
              results.errors.slice(0, 5)
            );
          }

          // Processar e limpar dados
          const cleanData = results.data
            .filter((row) => row["Nome da Música"]) // Filtrar linhas vazias
            .map((row, index) => ({
              index: index,
              name: this.cleanString(row["Nome da Música"]),
              artistId: this.cleanString(row["ID do Artista"]),
              lyrics: this.cleanString(row["Letra Tratada"]),
              anger: this.normalizeEmotion(row["Raiva"]),
              fear: this.normalizeEmotion(row["Medo"]),
              joy: this.normalizeEmotion(row["Alegria"]),
              sadness: this.normalizeEmotion(row["Tristeza"]),
              surprise: this.normalizeEmotion(row["Surpresa"]),
              genre: this.cleanString(row["Gênero"]) || "Desconhecido",
            }));

          this.stats.emotionalDataCount = cleanData.length;
          console.log(
            `   ✓ ${cleanData.length} músicas com dados emocionais carregadas`
          );
          resolve(cleanData);
        },
        error: (error) => {
          reject(new Error(`Erro ao ler dados emocionais: ${error.message}`));
        },
      });
    });
  }

  /**
   * Carrega dados musicais do Spotify
   * Estes dados complementam a análise emocional com atributos técnicos
   */
  async loadSpotifyData() {
    const filePath = path.join(
      process.cwd(),
      "data",
      "musicas_perifericas.csv"
    );

    return new Promise((resolve, reject) => {
      const fileContent = fs.readFileSync(filePath, "utf8");

      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            console.warn(
              "   ⚠️  Avisos durante parse Spotify:",
              results.errors.slice(0, 5)
            );
          }

          const cleanData = results.data
            .filter((row) => row["Nome da Faixa"]) // Filtrar linhas vazias
            .map((row, index) => ({
              index: index,
              spotifyId: this.cleanString(row["ID do Spotify"]),
              trackName: this.cleanString(row["Nome da Faixa"]),
              artistName: this.cleanString(row["Nome do(s) Artista(s)"]),
              albumName: this.cleanString(row["Nome do Álbum"]),
              duration: parseInt(row["Duração (ms)"]) || null,
              popularity: parseInt(row["Popularidade"]) || 0,
              danceability: this.normalizeSpotifyAttribute(
                row["Dançabilidade"]
              ),
              energy: this.normalizeSpotifyAttribute(row["Energia"]),
              valence: this.normalizeSpotifyAttribute(row["Valência"]),
              acousticness: this.normalizeSpotifyAttribute(row["Acústica"]),
              instrumentalness: this.normalizeSpotifyAttribute(
                row["Instrumental"]
              ),
              speechiness: this.normalizeSpotifyAttribute(
                row["Intensidade Vocal"]
              ),
              tempo: parseFloat(row["Ritmo"]) || null,
              genre: this.cleanString(row["Gênero"]) || "Desconhecido",
            }));

          this.stats.spotifyDataCount = cleanData.length;
          console.log(
            `   ✓ ${cleanData.length} músicas com dados Spotify carregadas`
          );
          resolve(cleanData);
        },
        error: (error) => {
          reject(new Error(`Erro ao ler dados Spotify: ${error.message}`));
        },
      });
    });
  }

  /**
   * Combina dados emocionais com dados musicais e importa
   * Esta é a "alquimia" que transforma dados brutos em conhecimento útil
   */
  async combineAndImportData(emotionalData, spotifyData) {
    // Criar índice dos dados Spotify para acesso rápido
    const spotifyIndex = new Map();
    spotifyData.forEach((item, index) => {
      spotifyIndex.set(index, item);
    });

    console.log(
      `   🔄 Processando ${emotionalData.length} registros em lotes de ${CONFIG.BATCH_SIZE}...`
    );

    let processedCount = 0;
    const totalBatches = Math.ceil(emotionalData.length / CONFIG.BATCH_SIZE);

    for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
      const startIdx = batchNum * CONFIG.BATCH_SIZE;
      const endIdx = Math.min(
        startIdx + CONFIG.BATCH_SIZE,
        emotionalData.length
      );
      const batch = emotionalData.slice(startIdx, endIdx);

      const musicRecords = batch.map((emotionalItem, localIndex) => {
        const globalIndex = startIdx + localIndex;
        const spotifyItem = spotifyIndex.get(globalIndex);

        return {
          // Informações básicas da música
          name:
            emotionalItem.name ||
            spotifyItem?.trackName ||
            "Música Desconhecida",
          artist: spotifyItem?.artistName || "Artista Desconhecido",
          album: spotifyItem?.albumName,
          duration: spotifyItem?.duration,
          genre: emotionalItem.genre || spotifyItem?.genre || "Desconhecido",
          spotifyId: spotifyItem?.spotifyId,

          // Atributos emocionais (já normalizados 0-1)
          anger: emotionalItem.anger,
          fear: emotionalItem.fear,
          joy: emotionalItem.joy,
          sadness: emotionalItem.sadness,
          surprise: emotionalItem.surprise,

          // Atributos musicais do Spotify
          danceability: spotifyItem?.danceability,
          energy: spotifyItem?.energy,
          valence: spotifyItem?.valence,
          acousticness: spotifyItem?.acousticness,
          instrumentalness: spotifyItem?.instrumentalness,
          speechiness: spotifyItem?.speechiness,
          tempo: spotifyItem?.tempo,
        };
      });

      // Inserir lote no banco com tratamento de erro robusto
      let retries = 0;
      while (retries < CONFIG.MAX_RETRIES) {
        try {
          const result = await prisma.music.createMany({
            data: musicRecords,
            skipDuplicates: true,
          });

          this.stats.successfulInserts += result.count;
          processedCount += batch.length;

          // Log progresso a cada N registros
          if (
            processedCount % CONFIG.LOG_PROGRESS_EVERY === 0 ||
            batchNum === totalBatches - 1
          ) {
            const percentage = (((batchNum + 1) / totalBatches) * 100).toFixed(
              1
            );
            console.log(
              `   ✓ Lote ${
                batchNum + 1
              }/${totalBatches} (${percentage}%) - ${processedCount}/${
                emotionalData.length
              } registros processados`
            );
          }

          break; // Sucesso, sair do loop de retry
        } catch (error) {
          retries++;
          if (retries >= CONFIG.MAX_RETRIES) {
            console.error(
              `   ❌ Falha no lote ${batchNum + 1} após ${
                CONFIG.MAX_RETRIES
              } tentativas:`,
              error.message
            );
            this.stats.totalErrors++;
          } else {
            console.warn(
              `   ⚠️  Tentativa ${retries} falhou para lote ${
                batchNum + 1
              }, tentando novamente...`
            );
            await this.sleep(CONFIG.DELAY_BETWEEN_BATCHES * retries); // Backoff exponencial
          }
        }
      }

      // Pequena pausa entre lotes para não sobrecarregar o banco
      if (batchNum < totalBatches - 1) {
        await this.sleep(CONFIG.DELAY_BETWEEN_BATCHES);
      }
    }

    this.stats.totalProcessed = processedCount;
  }

  /**
   * Gera relatório final da importação
   * Como um resumo executivo do que foi realizado
   */
  async generateFinalReport() {
    console.log("");
    console.log("📊 RELATÓRIO FINAL DE IMPORTAÇÃO");
    console.log("==================================");

    const endTime = Date.now();
    const duration = (endTime - this.stats.startTime) / 1000;

    // Estatísticas gerais
    const totalMusics = await prisma.music.count();
    const musicsWithSpotify = await prisma.music.count({
      where: { spotifyId: { not: null } },
    });

    console.log(`⏱️  Tempo total: ${duration.toFixed(2)} segundos`);
    console.log(`📈 Registros processados: ${this.stats.totalProcessed}`);
    console.log(`✅ Inserções bem-sucedidas: ${this.stats.successfulInserts}`);
    console.log(`❌ Erros encontrados: ${this.stats.totalErrors}`);
    console.log(`🎵 Total de músicas no banco: ${totalMusics}`);
    console.log(`🎧 Músicas com Spotify ID: ${musicsWithSpotify}`);

    // Análise de distribuição por gêneros
    const genreStats = await prisma.music.groupBy({
      by: ["genre"],
      _count: { _all: true },
      orderBy: { _count: { _all: "desc" } },
    });

    console.log("");
    console.log("🎼 DISTRIBUIÇÃO POR GÊNEROS:");
    genreStats.slice(0, 10).forEach((genre) => {
      console.log(`   ${genre.genre}: ${genre._count._all} músicas`);
    });

    // Análise emocional média
    const emotionalAvgs = await prisma.music.aggregate({
      _avg: {
        anger: true,
        fear: true,
        joy: true,
        sadness: true,
        surprise: true,
      },
    });

    console.log("");
    console.log("😊 PERFIL EMOCIONAL MÉDIO DO CATÁLOGO:");
    console.log(`   Raiva: ${(emotionalAvgs._avg.anger * 100).toFixed(1)}%`);
    console.log(`   Medo: ${(emotionalAvgs._avg.fear * 100).toFixed(1)}%`);
    console.log(`   Alegria: ${(emotionalAvgs._avg.joy * 100).toFixed(1)}%`);
    console.log(
      `   Tristeza: ${(emotionalAvgs._avg.sadness * 100).toFixed(1)}%`
    );
    console.log(
      `   Surpresa: ${(emotionalAvgs._avg.surprise * 100).toFixed(1)}%`
    );

    console.log("");
    console.log("🎉 IMPORTAÇÃO CONCLUÍDA COM SUCESSO!");
    console.log("");
    console.log("🚀 PRÓXIMOS PASSOS:");
    console.log('   1. Execute "npx prisma studio" para explorar os dados');
    console.log("   2. Implemente algoritmos de lógica fuzzy");
    console.log("   3. Desenvolva o sistema de recomendação");
    console.log("   4. Teste recomendações baseadas em estados emocionais");
  }

  // ====================================
  // MÉTODOS UTILITÁRIOS
  // ====================================

  /**
   * Limpa e normaliza strings
   */
  cleanString(str) {
    if (!str || typeof str !== "string") return null;
    return str.trim().replace(/\s+/g, " ") || null;
  }

  /**
   * Normaliza valores emocionais para escala 0-1
   * Lida com diferentes escalas de entrada de forma inteligente
   */
  normalizeEmotion(value) {
    if (value === null || value === undefined || isNaN(value)) return 0;

    const numValue = parseFloat(value);

    // Se já está entre 0-1, mantém
    if (numValue >= 0 && numValue <= 1) return numValue;

    // Se está entre 0-10, normaliza
    if (numValue >= 0 && numValue <= 10) return numValue / 10;

    // Se está entre 0-100, normaliza
    if (numValue >= 0 && numValue <= 100) return numValue / 100;

    // Para valores fora do esperado, clamp entre 0-1
    return Math.max(0, Math.min(1, numValue / 10));
  }

  /**
   * Normaliza atributos do Spotify (que já devem estar 0-1)
   */
  normalizeSpotifyAttribute(value) {
    if (value === null || value === undefined || isNaN(value)) return null;

    const numValue = parseFloat(value);
    return Math.max(0, Math.min(1, numValue));
  }

  /**
   * Função auxiliar para criar delays
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ====================================
// EXECUÇÃO PRINCIPAL
// ====================================

async function main() {
  const importer = new SolMusicImporter();

  try {
    await importer.importAllMusicData();
    process.exit(0);
  } catch (error) {
    console.error("");
    console.error("💥 FALHA CRÍTICA NA IMPORTAÇÃO:");
    console.error(error.message);
    console.error("");
    console.error("🔧 VERIFICAÇÕES SUGERIDAS:");
    console.error('   - Os arquivos CSV estão na pasta "data/"?');
    console.error("   - O Docker PostgreSQL está rodando? (docker-compose ps)");
    console.error(
      "   - As migrações Prisma foram aplicadas? (npx prisma migrate dev)"
    );
    console.error("   - Há espaço suficiente em disco?");
    console.error("");
    process.exit(1);
  }
}

// Executar se este arquivo for chamado diretamente
if (require.main === module) {
  main();
}
