import { NextRequest, NextResponse } from "next/server";
import { feedbackSchema } from "@/lib/validators";
import { AuthError, ValidationError, NotFoundError } from "@/lib/errors";
import { errorHandler } from "@/middleware/error-handler";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth-helper";
import { Logger } from "@/lib/logger";
import { rateLimit } from "@/middleware/rate-limit";

const limiter = rateLimit(100, 60000);

/**
 * POST /api/feedback
 *
 * Registra feedback sobre uma playlist
 * 🔐 ROTA PROTEGIDA
 */
export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = limiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    Logger.info("💬 Registrando feedback...");

    const user = await getUserFromRequest(request);

    const body = await request.json();
    const validatedData = feedbackSchema.parse(body);
    Logger.debug("✅ Dados validados", validatedData);

    // Verificar se playlist existe
    const playlist = await prisma.playlist.findUnique({
      where: { id: validatedData.playlistId },
    });

    if (!playlist) {
      throw new NotFoundError("Playlist não encontrada");
    }

    if (playlist.userId !== user.id) {
      throw new AuthError(
        "Você não tem permissão para dar feedback nessa playlist"
      );
    }

    // Salvar feedback
    const feedback = await prisma.feedback.create({
      data: {
        userId: user.id,
        playlistId: validatedData.playlistId,
        rating: validatedData.rating,
        comment: validatedData.comment || null,
        postSadness: null,
        postJoy: null,
        postAnger: null,
        postFear: null,
        postSurprise: null,
      },
    });

    Logger.success("✅ Feedback registrado", { id: feedback.id });

    return NextResponse.json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    Logger.error("❌ Erro ao registrar feedback", error);
    return errorHandler(error);
  }
}

/**
 * GET /api/feedback?playlistId=...
 *
 * Retorna feedbacks de uma playlist
 * 🔐 ROTA PROTEGIDA
 */
export async function GET(request: NextRequest) {
  try {
    const rateLimitResponse = limiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    Logger.info("📊 Buscando feedbacks...");

    const user = await getUserFromRequest(request);

    const searchParams = request.nextUrl.searchParams;
    const playlistId = searchParams.get("playlistId");

    if (!playlistId) {
      throw new ValidationError("playlistId é obrigatório");
    }

    // Verificar permissão
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    });

    if (!playlist) {
      throw new NotFoundError("Playlist não encontrada");
    }

    if (playlist.userId !== user.id) {
      throw new AuthError("Sem permissão para ver feedbacks");
    }

    // Buscar feedbacks
    const feedbacks = await prisma.feedback.findMany({
      where: { playlistId },
      orderBy: { createdAt: "desc" },
    });

    Logger.info(`✅ ${feedbacks.length} feedbacks encontrados`);

    return NextResponse.json({
      success: true,
      data: feedbacks,
    });
  } catch (error) {
    Logger.error("❌ Erro ao buscar feedbacks", error);
    return errorHandler(error);
  }
}
