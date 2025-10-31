import { NextRequest, NextResponse } from "next/server";
import { FuzzyMusicEngine } from "@/core/fuzzy/engine";
import { getUserFromRequest } from "@/lib/auth-helper";
import { Logger } from "@/lib/logger";
import { errorHandler } from "@/middleware/error-handler";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

/**
 * Schema de validação para entrada emocional
 */
const emotionalInputSchema = z.object({
  sadness: z.number().min(0).max(10),
  joy: z.number().min(0).max(10),
  anger: z.number().min(0).max(10),
  fear: z.number().min(0).max(10),
  surprise: z.number().min(0).max(10),
  generoPreferido: z.string().optional(),
});

export type EmotionalInput = z.infer<typeof emotionalInputSchema>;

/**
 * Interface de resposta
 */
interface FuzzyAnalysisResponse {
  success: boolean;
  data: {
    fuzzy_output: {
      recommendation: string;
      genres: string[];
      intensity: number;
      therapy_type: string;
      confidence: number;
      top_tracks: string[];
    };
    emotional_state: {
      sadness: number;
      joy: number;
      anger: number;
      fear: number;
      surprise: number;
    };
    suggested_playlists: {
      name: string;
      description: string;
      reason: string;
      tracks_count: number;
    }[];
  };
  message: string;
}

/**
 * POST /api/ai/analyze
 *
 * Analisa estado emocional usando Lógica Fuzzy
 * Retorna recomendações inteligentes de música
 * 🔐 ROTA PROTEGIDA
 *
 * Body:
 * {
 *   sadness: 0-10,
 *   joy: 0-10,
 *   anger: 0-10,
 *   fear: 0-10,
 *   surprise: 0-10,
 *   generoPreferido?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    Logger.info("🧠 Iniciando análise Fuzzy...");

    // 1. Verificar autenticação
    const user = await getUserFromRequest(request);
    Logger.debug(`👤 Usuário: ${user.id}`);

    // 2. Parse e validar corpo da requisição
    const body = await request.json();
    const emotionalInput = emotionalInputSchema.parse(body);
    Logger.debug("✅ Entrada validada", emotionalInput);

    // 3. Inicializar motor Fuzzy
    const fuzzyEngine = new FuzzyMusicEngine();
    Logger.debug("⚙️ Motor Fuzzy inicializado");

    // 4. Executar análise Fuzzy
    const fuzzyRecommendation = fuzzyEngine.analyzeDatasetMusic(
      {
        raiva: emotionalInput.anger,
        medo: emotionalInput.fear,
        alegria: emotionalInput.joy,
        tristeza: emotionalInput.sadness,
        surpresa: emotionalInput.surprise,
      },
      emotionalInput.generoPreferido
    );

    Logger.info("🎯 Análise Fuzzy completada", {
      intention: fuzzyRecommendation.output.intencaoPlaylist,
      confidence: fuzzyRecommendation.output.grauConfianca,
    });

    // 5. Mapear intenção para gêneros recomendados
    const genreMapping: Record<string, string[]> = {
      relaxation: ["Ambient", "Classical", "Lo-fi", "Jazz"],
      energetic: ["Electronic", "Dance", "Pop", "Rock"],
      reflective: ["Indie", "Alternative", "Singer-songwriter", "Folk"],
      party: ["Dance", "Hip-hop", "Pop", "Funk"],
      focus: ["Classical", "Ambient", "Lo-fi", "Instrumental"],
      melancholic: ["Blues", "Sad", "Indie", "Alternative"],
      neutral: ["Pop", "Rock", "Alternative", "Indie"],
    };

    const recommendedGenres =
      genreMapping[fuzzyRecommendation.output.intencaoPlaylist.toLowerCase()] ||
      genreMapping.neutral;

    Logger.debug("🎵 Gêneros recomendados:", recommendedGenres);

    // 6. Buscar músicas do banco de dados
    const topTracks = await prisma.music.findMany({
      where: {
        genre: {
          in: recommendedGenres,
        },
      },
      select: {
        id: true,
        name: true,
        artist: true,
        genre: true,
      },
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
    });

    Logger.info(`✅ ${topTracks.length} faixas encontradas`);

    // 7. Salvar análise emocional no histórico
    await prisma.emotionalState.create({
      data: {
        userId: user.id,
        sadness: emotionalInput.sadness,
        joy: emotionalInput.joy,
        anger: emotionalInput.anger,
        fear: emotionalInput.fear,
        surprise: emotionalInput.surprise,
      },
    });

    Logger.info("💾 Estado emocional salvo no histórico");

    // 8. Mapear intensity e therapy type
    const intensityMap: Record<string, number> = {
      relaxation: 0.3,
      energetic: 0.8,
      reflective: 0.5,
      party: 0.9,
      focus: 0.4,
      melancholic: 0.4,
      neutral: 0.5,
    };

    const therapyTypeMap: Record<string, string> = {
      relaxation: "Relaxamento e Alívio",
      energetic: "Elevação e Energia",
      reflective: "Introspecção e Reflexão",
      party: "Celebração e Movimento",
      focus: "Concentração e Foco",
      melancholic: "Processamento Emocional",
      neutral: "Equilíbrio Geral",
    };

    const intention = fuzzyRecommendation.output.intencaoPlaylist.toLowerCase();
    const intensity = intensityMap[intention] || 0.5;
    const therapyType = therapyTypeMap[intention] || "Equilíbrio Geral";

    // 9. Criar resposta formatada
    const response: FuzzyAnalysisResponse = {
      success: true,
      data: {
        fuzzy_output: {
          recommendation: fuzzyRecommendation.output.intencaoPlaylist,
          genres: recommendedGenres,
          intensity,
          therapy_type: therapyType,
          confidence: Number(
            fuzzyRecommendation.output.grauConfianca.toFixed(2)
          ),
          top_tracks: topTracks.map((t) => `${t.name} - ${t.artist}`),
        },
        emotional_state: {
          sadness: emotionalInput.sadness,
          joy: emotionalInput.joy,
          anger: emotionalInput.anger,
          fear: emotionalInput.fear,
          surprise: emotionalInput.surprise,
        },
        suggested_playlists: [
          {
            name: `Playlist ${fuzzyRecommendation.output.intencaoPlaylist}`,
            description: `Seleção personalizada para ${fuzzyRecommendation.output.intencaoPlaylist.toLowerCase()}`,
            reason: `Baseado na análise fuzzy: ${fuzzyRecommendation.output.intencaoPlaylist}`,
            tracks_count: topTracks.length,
          },
        ],
      },
      message: `✨ Análise realizada com sucesso. Recomendação: ${fuzzyRecommendation.output.intencaoPlaylist}`,
    };

    Logger.info("🎉 Resposta preparada", {
      recommendation: response.data.fuzzy_output.recommendation,
      confidence: response.data.fuzzy_output.confidence,
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    Logger.error("❌ Erro na análise Fuzzy", error);
    return NextResponse.json(
      {
        success: false,
        data: {
          fuzzy_output: {},
          emotional_state: {},
          suggested_playlists: [],
        } as any,
        message: "Erro ao analisar emoções",
      },
      { status: 500 }
    );
  }
}
