import { NextRequest, NextResponse } from "next/server";
import { SpotifyService } from "@/lib/spotify-service";
import { getUserFromRequest } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { Logger } from "@/lib/logger";
import { z } from "zod";
import { errorHandler } from "@/middleware/error-handler";

const searchSchema = z.object({
  query: z.string().min(1, "Query é obrigatório"),
  limit: z.string().transform(Number).default("20"),
});

/**
 * GET /api/spotify/search?query=...&limit=20
 * Busca músicas no Spotify
 * 🔐 ROTA PROTEGIDA
 */
export async function GET(request: NextRequest) {
  try {
    Logger.info("🔍 Buscando no Spotify...");

    // Autenticação
    const user = await getUserFromRequest(request);

    // Parse query params
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const { query, limit } = searchSchema.parse(params);

    Logger.debug("✅ Params validados", { query, limit });

    // Buscar token do Spotify
    const spotifyAuth = await prisma.spotifyAuth.findUnique({
      where: { userId: user.id },
    });

    if (!spotifyAuth) {
      return NextResponse.json(
        {
          success: false,
          error: "Conecte sua conta do Spotify primeiro",
        },
        { status: 401 }
      );
    }

    // Verificar se token não expirou
    if (new Date() > spotifyAuth.expiresAt) {
      Logger.warn("⚠️ Token Spotify expirado");
      return NextResponse.json(
        {
          success: false,
          error: "Token Spotify expirado. Reconecte sua conta.",
        },
        { status: 401 }
      );
    }

    // Buscar no Spotify
    const tracks = await SpotifyService.searchTracks(
      query,
      spotifyAuth.accessToken,
      limit
    );

    Logger.success(`✅ ${tracks.length} músicas encontradas`);

    return NextResponse.json({
      success: true,
      data: {
        query: query,
        count: tracks.length,
        tracks: tracks,
      },
    });
  } catch (error) {
    Logger.error("❌ Erro ao buscar no Spotify", error);
    return errorHandler(error);
  }
}
