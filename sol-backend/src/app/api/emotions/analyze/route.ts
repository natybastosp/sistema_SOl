import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { FuzzyMusicEngine } from "@/core/fuzzy/engine";
import { authenticateRequest } from "@/lib/auth-middleware";

const prisma = new PrismaClient();
const fuzzyEngine = new FuzzyMusicEngine();

/**
 * POST /api/emotions/analyze
 *
 * Recebe: { estadoEmocional: number (0-10), generoPreferido?: string }
 * Retorna: { recommendation, playlist, stats }
 *
 * 🔐 ROTA PROTEGIDA - Requer autenticação
 */
export async function POST(request: NextRequest) {
  try {
    // ========================================
    // PASSO 1: VERIFICAR AUTENTICAÇÃO
    // ========================================
    const authResult = await authenticateRequest(request);

    if (!authResult.authenticated) {
      return NextResponse.json(
        {
          success: false,
          error: authResult.error || "Não autenticado",
        },
        { status: authResult.status || 401 }
      );
    }

    const user = authResult.user!;
    console.log(`🎵 [ANÁLISE] Usuário: ${user.name} (${user.email})`);

    // ========================================
    // PASSO 2: EXTRAIR E VALIDAR DADOS
    // ========================================
    const body = await request.json();
    const { estadoEmocional, generoPreferido } = body;

    // Validação básica
    if (estadoEmocional === undefined || estadoEmocional === null) {
      return NextResponse.json(
        {
          success: false,
          error: 'Campo "estadoEmocional" é obrigatório (valor entre 0 e 10)',
        },
        { status: 400 }
      );
    }

    if (estadoEmocional < 0 || estadoEmocional > 10) {
      return NextResponse.json(
        {
          success: false,
          error: "Estado emocional deve estar entre 0 e 10",
        },
        { status: 400 }
      );
    }

    console.log(
      `📊 [INPUT] Estado: ${estadoEmocional}/10 | Gênero: ${
        generoPreferido || "Todos"
      }`
    );

    // ========================================
    // PASSO 3: PROCESSAR COM FUZZY ENGINE
    // ========================================
    const fuzzyResult = fuzzyEngine.processRecommendation({
      estadoEmocional: Number(estadoEmocional),
      generoPreferido: generoPreferido || undefined,
    });

    const { output, filtrosMusica, descricao } = fuzzyResult;
    const { intencaoPlaylist, grauConfianca, valorIntencao, detalhes } = output;

    console.log(
      `🧠 [FUZZY] Intenção: ${intencaoPlaylist} | Confiança: ${(
        grauConfianca * 100
      ).toFixed(1)}%`
    );
    console.log(`🎯 [CRITÉRIOS]`, detalhes.criteriosEmocionais);

    // ========================================
    // PASSO 4: BUSCAR MÚSICAS NO BANCO
    // ========================================

    // Construir filtros para o banco de dados
    const whereClause: any = {};
    const criterios = detalhes.criteriosEmocionais;

    // Filtro por gênero (se especificado)
    if (generoPreferido) {
      whereClause.genre = {
        equals: generoPreferido,
        mode: "insensitive", // case-insensitive
      };
    }

    // Filtros emocionais (baseados nos scores que SEMPRE existem)
    // Estes scores vêm da análise pré-processada das músicas
    if (criterios.maxTristeza !== undefined) {
      whereClause.sadnessScore = { lte: criterios.maxTristeza };
    }

    if (criterios.minAlegria !== undefined) {
      whereClause.joyScore = { gte: criterios.minAlegria };
    }

    if (criterios.maxAlegria !== undefined) {
      whereClause.joyScore = { lte: criterios.maxAlegria };
    }

    if (criterios.maxRaiva !== undefined) {
      whereClause.angerScore = { lte: criterios.maxRaiva };
    }

    if (criterios.maxMedo !== undefined) {
      whereClause.fearScore = { lte: criterios.maxMedo };
    }

    console.log(`🔍 [BUSCA] Aplicando filtros ao banco...`);

    // Buscar músicas que atendem aos critérios
    let musicas = await prisma.music.findMany({
      where: whereClause,
      take: 20, // Limitar a 20 músicas
      orderBy: [
        { joyScore: "desc" }, // Priorizar alegria
        { sadnessScore: "asc" }, // Minimizar tristeza
      ],
    });

    console.log(`🎵 [RESULTADO] ${musicas.length} músicas encontradas`);

    // Se não encontrar músicas suficientes, relaxar os filtros
    if (musicas.length < 5) {
      console.log(
        `⚠️  [AVISO] Poucas músicas encontradas, relaxando filtros...`
      );

      const whereRelaxed: any = {};
      if (generoPreferido) {
        whereRelaxed.genre = {
          equals: generoPreferido,
          mode: "insensitive",
        };
      }

      musicas = await prisma.music.findMany({
        where: whereRelaxed,
        take: 20,
        orderBy: { joyScore: "desc" },
      });

      console.log(
        `🎵 [RESULTADO RELAXADO] ${musicas.length} músicas encontradas`
      );
    }

    // Se ainda não tem músicas, retornar erro
    if (musicas.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Nenhuma música encontrada com os critérios especificados",
          suggestion: "Tente outro gênero ou estado emocional",
        },
        { status: 404 }
      );
    }

    // ========================================
    // PASSO 5: CALCULAR ESTATÍSTICAS
    // ========================================
    const stats = {
      totalMusicas: musicas.length,
      duracaoMinutos: Math.round(
        musicas.reduce((acc, m) => acc + (m.duration || 0), 0) / 60000
      ),
      valenciaMedia:
        musicas.reduce((acc, m) => acc + (m.valence || 0.5), 0) /
        musicas.length,
      energiaMedia:
        musicas.reduce((acc, m) => acc + (m.energy || 0.5), 0) / musicas.length,
      tristezaMedia:
        musicas.reduce((acc, m) => acc + m.sadnessScore, 0) / musicas.length,
      alegriaMedia:
        musicas.reduce((acc, m) => acc + m.joyScore, 0) / musicas.length,
    };

    console.log(
      `📊 [STATS] Duração: ${
        stats.duracaoMinutos
      }min | Alegria Média: ${stats.alegriaMedia.toFixed(2)}`
    );

    // ========================================
    // PASSO 6: SALVAR NO HISTÓRICO
    // ========================================
    const historico = await prisma.recommendationHistory.create({
      data: {
        userId: user.id,

        // Input do usuário
        estadoEmocional,
        generoPreferido: generoPreferido || null,

        // Resultados Fuzzy
        intencaoPlaylist,
        grauConfianca,
        valorIntencao,
        descricao,

        // Graus de pertinência (estados fuzzy)
        grauTriste: detalhes.grausPertinencia.triste || 0,
        grauAnsioso: detalhes.grausPertinencia.ansioso || 0,
        grauNeutro: detalhes.grausPertinencia.neutro || 0,
        grauAlegre: detalhes.grausPertinencia.alegre || 0,

        // Critérios (salvos como JSON para flexibilidade)
        criteriosJson: criterios,

        // Estatísticas da playlist
        totalMusicas: stats.totalMusicas,
        duracaoMinutos: stats.duracaoMinutos,
        valenciaMedia: stats.valenciaMedia,
        energiaMedia: stats.energiaMedia,
        tristezaMedia: stats.tristezaMedia,
        alegriaMedia: stats.alegriaMedia,

        // Relacionar as músicas selecionadas
        musicas: {
          create: musicas.map((musica, index) => ({
            musicId: musica.id,
            position: index + 1,
          })),
        },
      },
      include: {
        musicas: {
          include: {
            music: true,
          },
          orderBy: {
            position: "asc",
          },
        },
      },
    });

    console.log(`💾 [HISTÓRICO] Salvo com ID: ${historico.id}`);

    // ========================================
    // PASSO 7: RETORNAR RESPOSTA
    // ========================================
    return NextResponse.json({
      success: true,
      recommendation: {
        id: historico.id,

        // Análise Fuzzy
        fuzzyAnalysis: {
          intencao: intencaoPlaylist,
          confianca: grauConfianca,
          descricao,
          valorIntencao,
          graus: detalhes.grausPertinencia,
        },

        // Playlist gerada
        playlist: historico.musicas.map((hm) => ({
          id: hm.music.id,
          spotifyId: hm.music.spotifyId,
          name: hm.music.name,
          artist: hm.music.artist,
          album: hm.music.album,
          duration: hm.music.duration,
          genre: hm.music.genre,
          position: hm.position,

          // Scores emocionais
          scores: {
            sadness: hm.music.sadnessScore,
            joy: hm.music.joyScore,
            anger: hm.music.angerScore,
            fear: hm.music.fearScore,
            surprise: hm.music.surpriseScore,
          },

          // Características de áudio (se disponíveis)
          audioFeatures: {
            energy: hm.music.energy,
            valence: hm.music.valence,
            danceability: hm.music.danceability,
            acousticness: hm.music.acousticness,
          },
        })),

        // Estatísticas
        stats,
      },

      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("❌ [ERRO]", error);

    return NextResponse.json(
      {
        success: false,
        error: "Erro ao processar análise emocional",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { FuzzyMusicEngine } from "@/core/fuzzy/engine";
import { authenticateRequest } from "@/lib/auth-middleware";

// ═══════════════════════════════════════════════════════════════
// INICIALIZAÇÃO
// ═══════════════════════════════════════════════════════════════

const prisma = new PrismaClient();
const fuzzyEngine = new FuzzyMusicEngine();

// ═══════════════════════════════════════════════════════════════
// HANDLER PRINCIPAL - POST
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    //  PASSO 1: AUTENTICAÇÃO
    //  Verifica se o usuário está logado e tem um token válido

    console.log("🔐 [1/7] Verificando autenticação...");

    const authResult = await authenticateRequest(request);

    if (!authResult.authenticated) {
      console.log("❌ Autenticação falhou");
      return NextResponse.json(
        {
          success: false,
          error: authResult.error || "Não autenticado",
        },
        { status: authResult.status || 401 }
      );
    }

    const user = authResult.user!;
    console.log(`✅ Usuário autenticado: ${user.name} (${user.email})`);

    //  PASSO 2: EXTRAÇÃO E VALIDAÇÃO DOS DADOS
    //  Pega os dados enviados pelo usuário e valida

    console.log("📥 [2/7] Extraindo dados da requisição...");

    const body = await request.json();
    const { estadoEmocional, generoPreferido } = body;

    // Validação: estadoEmocional é obrigatório
    if (estadoEmocional === undefined || estadoEmocional === null) {
      console.log("❌ Estado emocional não fornecido");
      return NextResponse.json(
        {
          success: false,
          error: 'Campo "estadoEmocional" é obrigatório (valor entre 0 e 10)',
        },
        { status: 400 }
      );
    }

    // Validação: estadoEmocional deve estar entre 0 e 10
    if (estadoEmocional < 0 || estadoEmocional > 10) {
      console.log(`❌ Estado emocional fora do range: ${estadoEmocional}`);
      return NextResponse.json(
        {
          success: false,
          error: "Estado emocional deve estar entre 0 e 10",
        },
        { status: 400 }
      );
    }

    console.log(
      `✅ Dados válidos - Estado: ${estadoEmocional}/10 | Gênero: ${
        generoPreferido || "Todos"
      }`
    );

    //  PASSO 3: PROCESSAMENTO FUZZY
    //  Aqui acontece a mágica! O Fuzzy Engine analisa

    console.log("🧠 [3/7] Processando com Fuzzy Engine...");

    const fuzzyResult = fuzzyEngine.processRecommendation({
      estadoEmocional: Number(estadoEmocional),
      generoPreferido: generoPreferido || undefined,
    });

    const { output, filtrosMusica, descricao } = fuzzyResult;
    const { intencaoPlaylist, grauConfianca, valorIntencao, detalhes } = output;

    console.log(`✅ Fuzzy processado:`);
    console.log(`   - Intenção: ${intencaoPlaylist}`);
    console.log(`   - Confiança: ${(grauConfianca * 100).toFixed(1)}%`);
    console.log(`   - Critérios:`, detalhes.criteriosEmocionais);

    //  PASSO 4: CONSTRUIR FILTROS PARA O BANCO DE DADOS
    //  Transforma os critérios fuzzy em filtros SQL

    console.log("🔍 [4/7] Construindo filtros de busca...");

    const whereClause: any = {};
    const criterios = detalhes.criteriosEmocionais;

    // Filtro 1: Gênero (se especificado pelo usuário)
    if (generoPreferido) {
      whereClause.genre = {
        equals: generoPreferido,
        mode: "insensitive", // Case-insensitive (Rock = rock = ROCK)
      };
      console.log(`   - Filtrando por gênero: ${generoPreferido}`);
    }

    // Filtro 2: Scores Emocionais (vêm da análise fuzzy)
    // Estes filtros buscam músicas que têm características emocionais adequadas

    if (criterios.maxTristeza !== undefined) {
      whereClause.sadnessScore = { lte: criterios.maxTristeza };
      console.log(`   - Max tristeza: ${criterios.maxTristeza}`);
    }

    if (criterios.minAlegria !== undefined) {
      whereClause.joyScore = { gte: criterios.minAlegria };
      console.log(`   - Min alegria: ${criterios.minAlegria}`);
    }

    if (criterios.maxAlegria !== undefined) {
      whereClause.joyScore = { lte: criterios.maxAlegria };
      console.log(`   - Max alegria: ${criterios.maxAlegria}`);
    }

    if (criterios.maxRaiva !== undefined) {
      whereClause.angerScore = { lte: criterios.maxRaiva };
      console.log(`   - Max raiva: ${criterios.maxRaiva}`);
    }

    if (criterios.maxMedo !== undefined) {
      whereClause.fearScore = { lte: criterios.maxMedo };
      console.log(`   - Max medo: ${criterios.maxMedo}`);
    }

    // PASSO 5: BUSCAR MÚSICAS NO BANCO DE DADOS
    // Executa a query no PostgreSQL

    console.log("🎵 [5/7] Buscando músicas no banco...");

    let musicas = await prisma.music.findMany({
      where: whereClause,
      take: 20, // Limitar a 20 músicas para não sobrecarregar
      orderBy: [
        { joyScore: "desc" }, // Priorizar alegria
        { sadnessScore: "asc" }, // Minimizar tristeza
      ],
    });

    console.log(`✅ Primeira busca: ${musicas.length} músicas encontradas`);

    // FALLBACK: Se encontrar poucas músicas, relaxar os filtros
    if (musicas.length < 5) {
      console.log(`⚠️  Poucas músicas, relaxando filtros...`);

      const whereRelaxed: any = {};
      if (generoPreferido) {
        whereRelaxed.genre = {
          equals: generoPreferido,
          mode: "insensitive",
        };
      }

      musicas = await prisma.music.findMany({
        where: whereRelaxed,
        take: 20,
        orderBy: { joyScore: "desc" },
      });

      console.log(`✅ Segunda busca (relaxada): ${musicas.length} músicas`);
    }

    // ERRO: Se não encontrar nenhuma música
    if (musicas.length === 0) {
      console.log(`❌ Nenhuma música encontrada!`);
      return NextResponse.json(
        {
          success: false,
          error: "Nenhuma música encontrada com os critérios especificados",
          suggestion: "Tente outro gênero ou estado emocional",
        },
        { status: 404 }
      );
    }

    // PASSO 6: CALCULAR ESTATÍSTICAS DA PLAYLIST
    // Análise agregada das músicas selecionadas

    console.log("📊 [6/7] Calculando estatísticas...");

    const stats = {
      totalMusicas: musicas.length,

      duracaoMinutos: Math.round(
        musicas.reduce((acc, m) => acc + (m.duration || 0), 0) / 60000
      ),

      valenciaMedia:
        musicas.reduce((acc, m) => acc + (m.valence || 0.5), 0) /
        musicas.length,

      energiaMedia:
        musicas.reduce((acc, m) => acc + (m.energy || 0.5), 0) / musicas.length,

      tristezaMedia:
        musicas.reduce((acc, m) => acc + m.sadnessScore, 0) / musicas.length,

      alegriaMedia:
        musicas.reduce((acc, m) => acc + m.joyScore, 0) / musicas.length,
    };

    console.log(`✅ Stats calculadas:`);
    console.log(`   - Duração total: ${stats.duracaoMinutos} minutos`);
    console.log(`   - Alegria média: ${stats.alegriaMedia.toFixed(2)}`);
    console.log(`   - Energia média: ${stats.energiaMedia.toFixed(2)}`);

    // PASSO 7: SALVAR NO HISTÓRICO
    // Persistir tudo no banco para análise futura

    console.log("💾 [7/7] Salvando no histórico...");

    const historico = await prisma.recommendationHistory.create({
      data: {
        // Relacionamento com usuário
        userId: user.id,

        // Input original do usuário
        estadoEmocional,
        generoPreferido: generoPreferido || null,

        // Resultados da análise Fuzzy
        intencaoPlaylist,
        grauConfianca,
        valorIntencao,
        descricao,

        // Graus de pertinência fuzzy (para debug/análise)
        grauTriste: detalhes.grausPertinencia.triste || 0,
        grauAnsioso: detalhes.grausPertinencia.ansioso || 0,
        grauNeutro: detalhes.grausPertinencia.neutro || 0,
        grauAlegre: detalhes.grausPertinencia.alegre || 0,

        // Critérios aplicados (JSON para flexibilidade)
        criteriosJson: criterios,

        // Estatísticas da playlist gerada
        totalMusicas: stats.totalMusicas,
        duracaoMinutos: stats.duracaoMinutos,
        valenciaMedia: stats.valenciaMedia,
        energiaMedia: stats.energiaMedia,
        tristezaMedia: stats.tristezaMedia,
        alegriaMedia: stats.alegriaMedia,

        // Relacionar as músicas na ordem certa
        musicas: {
          create: musicas.map((musica, index) => ({
            musicId: musica.id,
            position: index + 1, // Posição na playlist (1, 2, 3...)
          })),
        },
      },

      // Incluir as músicas completas na resposta
      include: {
        musicas: {
          include: {
            music: true,
          },
          orderBy: {
            position: "asc",
          },
        },
      },
    });

    console.log(`✅ Histórico salvo com ID: ${historico.id}`);
    console.log("🎉 Análise completa com sucesso!");

    // RETORNO FINAL
    // Resposta estruturada para o front-end

    return NextResponse.json({
      success: true,

      recommendation: {
        // ID do histórico (para referência futura)
        id: historico.id,

        // Análise Fuzzy completa
        fuzzyAnalysis: {
          intencao: intencaoPlaylist,
          confianca: grauConfianca,
          descricao,
          valorIntencao,
          graus: detalhes.grausPertinencia,
        },

        // Playlist com todas as músicas
        playlist: historico.musicas.map((hm) => ({
          // Dados básicos
          id: hm.music.id,
          spotifyId: hm.music.spotifyId,
          name: hm.music.name,
          artist: hm.music.artist,
          album: hm.music.album,
          duration: hm.music.duration,
          genre: hm.music.genre,
          position: hm.position,

          // Scores emocionais (0-10)
          scores: {
            sadness: hm.music.sadnessScore,
            joy: hm.music.joyScore,
            anger: hm.music.angerScore,
            fear: hm.music.fearScore,
            surprise: hm.music.surpriseScore,
          },

          // Características de áudio Spotify (0-1)
          audioFeatures: {
            energy: hm.music.energy,
            valence: hm.music.valence,
            danceability: hm.music.danceability,
            acousticness: hm.music.acousticness,
          },
        })),

        // Estatísticas agregadas
        stats,
      },

      // Timestamp da resposta
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    // ═══════════════════════════════════════════════════════════════
    // TRATAMENTO DE ERROS
    // ═══════════════════════════════════════════════════════════════

    console.error("❌ [ERRO FATAL]", error);
    console.error("Stack:", error.stack);

    return NextResponse.json(
      {
        success: false,
        error: "Erro ao processar análise emocional",
        details: error.message,

        // Em desenvolvimento, retornar stack trace
        ...(process.env.NODE_ENV === "development" && {
          stack: error.stack,
        }),
      },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// MÉTODO GET (opcional - para documentação)
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "API de Análise Emocional - Sistema SOL",
    version: "1.0.0",
    usage: {
      method: "POST",
      endpoint: "/api/emotions/analyze",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer YOUR_JWT_TOKEN",
      },
      body: {
        estadoEmocional: "number (0-10) - OBRIGATÓRIO",
        generoPreferido: "string (opcional) - Rock, Funk, MPB ou Sertanejo",
      },
    },
    example: {
      request: {
        estadoEmocional: 4,
        generoPreferido: "Rock",
      },
      response: {
        success: true,
        recommendation: {
          fuzzyAnalysis: { intencao: "Reflexiva", confianca: 0.85 },
          playlist: ["...20 músicas..."],
          stats: { totalMusicas: 20, duracaoMinutos: 78 },
        },
      },
    },
  });
}
