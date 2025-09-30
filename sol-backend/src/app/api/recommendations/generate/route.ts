import { NextRequest, NextResponse } from "next/server";
import { FuzzyMusicEngine } from "@/core/fuzzy/engine";
import { PrismaClient } from "@prisma/client";
import {
  authenticateRequest,
  unauthorizedResponse,
} from "@/lib/auth-middleware";

const prisma = new PrismaClient();

/**
 * POST /api/recommendations/generate
 * Gera playlist personalizada baseada em análise fuzzy + banco de dados
 * 🔐 PROTEGIDO - Requer autenticação
 */
export async function POST(request: NextRequest) {
  try {
    // 1. VERIFICAR AUTENTICAÇÃO
    const authResult = await authenticateRequest(request);

    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error, authResult.status);
    }

    const user = authResult.user;
    console.log(`🔐 Usuário autenticado: ${user.email} - Gerando playlist...`);

    // 2. Extrair dados do body
    const body = await request.json();
    const { estadoEmocional, generoPreferido, limit = 10 } = body;

    // 3. Validação
    if (estadoEmocional === undefined || estadoEmocional === null) {
      return NextResponse.json(
        { error: 'Campo "estadoEmocional" é obrigatório (0-10)' },
        { status: 400 }
      );
    }

    if (estadoEmocional < 0 || estadoEmocional > 10) {
      return NextResponse.json(
        { error: "Estado emocional deve estar entre 0 e 10" },
        { status: 400 }
      );
    }

    // 4. Processar com fuzzy engine
    const fuzzyEngine = new FuzzyMusicEngine();
    const resultado = fuzzyEngine.processRecommendation({
      estadoEmocional: Number(estadoEmocional),
      generoPreferido: generoPreferido || undefined,
    });

    // 5. Extrair dados da análise (estrutura correta)
    const { output, filtrosMusica, scoreConfianca, descricao } = resultado;
    const { intencaoPlaylist, grauConfianca, detalhes } = output;
    const criteriosEmocionais = detalhes.criteriosEmocionais;

    console.log("🎯 Análise Fuzzy:", {
      usuario: user.email,
      intencao: intencaoPlaylist,
      confianca: grauConfianca,
      criterios: criteriosEmocionais,
    });

    // 6. Montar query do banco baseada nos critérios fuzzy
    const whereClause: any = {};

    // Filtrar por gênero se especificado
    if (generoPreferido) {
      whereClause.genre = {
        equals: generoPreferido.toLowerCase(),
        mode: "insensitive",
      };
    }

    // Filtrar por SCORES EMOCIONAIS (do banco)
    if (criteriosEmocionais.maxRaiva !== undefined) {
      whereClause.angerScore = {
        lte: criteriosEmocionais.maxRaiva,
      };
    }

    if (criteriosEmocionais.maxAlegria !== undefined) {
      whereClause.joyScore = {
        lte: criteriosEmocionais.maxAlegria,
      };
    }

    if (criteriosEmocionais.maxTristeza !== undefined) {
      whereClause.sadnessScore = {
        lte: criteriosEmocionais.maxTristeza,
      };
    }

    // Filtrar por CARACTERÍSTICAS MUSICAIS (Spotify)
    if (criteriosEmocionais.minValencia !== undefined) {
      whereClause.valence = {
        gte: criteriosEmocionais.minValencia,
      };
    }

    if (criteriosEmocionais.maxValencia !== undefined) {
      whereClause.valence = {
        ...whereClause.valence,
        lte: criteriosEmocionais.maxValencia,
      };
    }

    if (criteriosEmocionais.maxEnergia !== undefined) {
      whereClause.energy = {
        lte: criteriosEmocionais.maxEnergia,
      };
    }

    if (criteriosEmocionais.minEnergia !== undefined) {
      whereClause.energy = {
        ...whereClause.energy,
        gte: criteriosEmocionais.minEnergia,
      };
    }

    // 7. Definir ordenação baseada na intenção
    let orderBy: any = [];

    switch (intencaoPlaylist.toLowerCase()) {
      case "calmante":
        orderBy = [
          { energy: "asc" },
          { valence: "asc" },
          { sadnessScore: "desc" },
        ];
        break;

      case "reflexiva":
      case "neutra":
        orderBy = [{ acousticness: "desc" }, { valence: "asc" }];
        break;

      case "estimulante":
        orderBy = [{ energy: "desc" }, { valence: "desc" }];
        break;

      case "feliz":
      case "alegre":
        orderBy = [
          { joyScore: "desc" },
          { valence: "desc" },
          { energy: "desc" },
        ];
        break;

      default:
        orderBy = [{ valence: "desc" }, { energy: "desc" }];
    }

    // 8. Buscar músicas no banco
    const musicas = await prisma.music.findMany({
      where: whereClause,
      take: Number(limit),
      orderBy,
      select: {
        id: true,
        name: true,
        artist: true,
        album: true,
        genre: true,
        valence: true,
        energy: true,
        danceability: true,
        acousticness: true,
        instrumentalness: true,
        sadnessScore: true,
        joyScore: true,
        angerScore: true,
        fearScore: true,
        surpriseScore: true,
        spotifyId: true,
        duration: true,
      },
    });

    console.log(`✅ Encontradas ${musicas.length} músicas para ${user.email}`);

    // 9. Calcular estatísticas da playlist
    const duracaoTotal = musicas.reduce((acc, m) => acc + (m.duration || 0), 0);
    const duracaoMinutos = Math.round(duracaoTotal / 60000);

    const estatisticas =
      musicas.length > 0
        ? {
            valenciaMedia: (
              musicas.reduce((acc, m) => acc + (m.valence || 0), 0) /
              musicas.length
            ).toFixed(2),
            energiaMedia: (
              musicas.reduce((acc, m) => acc + (m.energy || 0), 0) /
              musicas.length
            ).toFixed(2),
            tristezaMedia: (
              musicas.reduce((acc, m) => acc + (m.sadnessScore || 0), 0) /
              musicas.length
            ).toFixed(2),
            alegriaMedia: (
              musicas.reduce((acc, m) => acc + (m.joyScore || 0), 0) /
              musicas.length
            ).toFixed(2),
          }
        : {
            valenciaMedia: "0.00",
            energiaMedia: "0.00",
            tristezaMedia: "0.00",
            alegriaMedia: "0.00",
          };

    // 10. Retornar resposta completa
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      analise: {
        estadoEmocional,
        generoPreferido: generoPreferido || "Todos os gêneros",
        intencaoPlaylist,
        grauConfianca,
        descricao,
        grausPertinencia: detalhes.grausPertinencia,
      },
      playlist: {
        total: musicas.length,
        duracaoMinutos,
        estatisticas,
        musicas: musicas.map((m) => ({
          id: m.id,
          nome: m.name,
          artista: m.artist,
          album: m.album,
          genero: m.genre,
          spotifyId: m.spotifyId,
          duracao: m.duration
            ? `${Math.floor(m.duration / 60000)}:${String(
                Math.floor((m.duration % 60000) / 1000)
              ).padStart(2, "0")}`
            : null,
          caracteristicas: {
            valence: m.valence,
            energy: m.energy,
            danceability: m.danceability,
            acousticness: m.acousticness,
            instrumentalness: m.instrumentalness,
          },
          scoresEmocionais: {
            tristeza: m.sadnessScore,
            alegria: m.joyScore,
            raiva: m.angerScore,
            medo: m.fearScore,
            surpresa: m.surpriseScore,
          },
        })),
      },
      criteriosAplicados: criteriosEmocionais,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("❌ Erro ao gerar recomendação:", error);
    return NextResponse.json(
      {
        error: "Erro ao gerar playlist personalizada",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/recommendations/generate
 * Documentação do endpoint
 */
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/recommendations/generate",
    method: "POST",
    description:
      "Gera playlist personalizada com análise fuzzy + busca no banco (24.414 músicas)",
    body: {
      estadoEmocional: "number (0-10) - obrigatório",
      generoPreferido:
        "string (opcional) - rock, funk, mpb, sertanejo, rap, samba, funk carioca, trilha sonora",
      limit: "number (opcional, padrão: 10) - quantidade de músicas",
    },
    generosDisponiveis: [
      "rock",
      "funk",
      "mpb",
      "sertanejo",
      "rap",
      "samba",
      "funk carioca",
      "trilha sonora",
    ],
    estadosEmocionais: {
      "0-2": "Depressivo/Muito Triste",
      "3-4": "Ansioso/Preocupado",
      "5-6": "Neutro/Equilibrado",
      "7-8": "Contente/Bem",
      "9-10": "Muito Feliz/Eufórico",
    },
    example: {
      estadoEmocional: 4,
      generoPreferido: "rock",
      limit: 15,
    },
  });
}
