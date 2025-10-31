import { NextRequest, NextResponse } from "next/server";
import { recommendationSchema } from "@/lib/validators";
import { ValidationError } from "@/lib/errors";
import { errorHandler } from "@/middleware/error-handler";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth-helper";
import { Logger } from "@/lib/logger";
import { rateLimit } from "@/middleware/rate-limit";

const limiter = rateLimit(50, 60000);

/**
 * POST /api/recommendations/generate
 *
 * Gera recomendação baseada em histórico emocional
 * 🔐 ROTA PROTEGIDA
 */
export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = limiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    Logger.info("🎵 Gerando recomendação...");

    const user = await getUserFromRequest(request);

    const body = await request.json();
    const validatedData = recommendationSchema.parse(body);
    Logger.debug("✅ Dados validados", validatedData);

    // Buscar histórico emocional
    const historico = await prisma.emotionalState.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    Logger.debug(`📊 Histórico: ${historico.length} análises`);

    // Buscar músicas
    const maxSongs = validatedData.preferences?.maxSongs || 20;
    const musicasLocais = await prisma.music.findMany({
      where: {
        genre: validatedData.emotionalData.generoPreferido,
      },
      take: maxSongs,
      select: {
        id: true,
        name: true,
        artist: true,
        genre: true,
        energy: true,
        valence: true,
        spotifyId: true,
        duration: true,
        joyScore: true,
      },
      orderBy: { joyScore: "desc" },
    });

    if (musicasLocais.length === 0) {
      throw new ValidationError("Nenhuma música encontrada");
    }

    Logger.info(`✅ ${musicasLocais.length} músicas encontradas`);

    return NextResponse.json({
      success: true,
      data: {
        analysis: validatedData.emotionalData,
        musics: musicasLocais.map((m) => ({
          id: m.id,
          title: m.name,
          artist: m.artist,
          genre: m.genre,
          spotifyId: m.spotifyId,
          duration: m.duration,
        })),
      },
    });
  } catch (error) {
    Logger.error("❌ Erro ao gerar recomendação", error);
    return errorHandler(error);
  }
}
