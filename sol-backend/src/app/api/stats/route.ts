import { NextRequest, NextResponse } from "next/server";
import { AuthError } from "@/lib/errors";
import { errorHandler } from "@/middleware/error-handler";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth-helper";
import { Logger } from "@/lib/logger";
import { rateLimit } from "@/middleware/rate-limit";

const limiter = rateLimit(100, 60000);

/**
 * GET /api/stats
 *
 * Retorna estatísticas do usuário
 * 🔐 ROTA PROTEGIDA
 */
export async function GET(request: NextRequest) {
  try {
    const rateLimitResponse = limiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    Logger.info("📊 Buscando estatísticas...");

    const user = await getUserFromRequest(request);

    // Total de análises
    const totalAnalises = await prisma.emotionalState.count({
      where: { userId: user.id },
    });

    // Total de playlists
    const totalPlaylists = await prisma.playlist.count({
      where: { userId: user.id },
    });

    // Total de feedbacks
    const totalFeedbacks = await prisma.feedback.count({
      where: { userId: user.id },
    });

    // Estados emocionais média
    const estadoMedio = await prisma.emotionalState.aggregate({
      where: { userId: user.id },
      _avg: {
        sadness: true,
        joy: true,
        anger: true,
        fear: true,
        surprise: true,
      },
    });

    // Rating médio dos feedbacks
    const feedbackMedio = await prisma.feedback.aggregate({
      where: {
        playlist: {
          userId: user.id,
        },
      },
      _avg: { rating: true },
    });

    Logger.success("✅ Estatísticas compiladas");

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalAnalises,
          totalPlaylists,
          totalFeedbacks,
          estadoMedio: {
            sadness: Math.round((estadoMedio._avg.sadness || 0) * 100) / 100,
            joy: Math.round((estadoMedio._avg.joy || 0) * 100) / 100,
            anger: Math.round((estadoMedio._avg.anger || 0) * 100) / 100,
            fear: Math.round((estadoMedio._avg.fear || 0) * 100) / 100,
            surprise: Math.round((estadoMedio._avg.surprise || 0) * 100) / 100,
          },
          ratingMedio: Math.round((feedbackMedio._avg.rating || 0) * 100) / 100,
        },
      },
    });
  } catch (error) {
    Logger.error("❌ Erro ao buscar estatísticas", error);
    return errorHandler(error);
  }
}
