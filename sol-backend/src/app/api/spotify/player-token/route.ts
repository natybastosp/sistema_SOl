import { NextRequest, NextResponse } from "next/server";
import { Logger } from "@/lib/logger";
import { getUserFromRequest } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { spotifyAuthService } from "@/lib/spotifyAuth";

/**
 * POST /api/spotify/player-token
 *
 * Retorna um access token Spotify válido para usar com o Web Playback SDK
 * O token é atualizado automaticamente se expirou
 */
export async function POST(request: NextRequest) {
  try {
    Logger.info("🎵 Requesting Spotify player token");

    // Autenticar usuário
    const user = await getUserFromRequest(request);

    // Buscar tokens salvos do usuário
    const userWithTokens = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!userWithTokens?.spotifyAccessToken) {
      Logger.warn(`User ${user.id} has no Spotify tokens`);
      return NextResponse.json(
        { error: "User not connected to Spotify" },
        { status: 401 }
      );
    }

    // Verificar se o token expirou
    const now = new Date();
    if (
      userWithTokens.spotifyTokenExpiry &&
      now > userWithTokens.spotifyTokenExpiry
    ) {
      Logger.info(`🔄 Spotify token expired, refreshing...`);

      if (!userWithTokens.spotifyRefreshToken) {
        Logger.error("No refresh token available", null);
        return NextResponse.json(
          { error: "Unable to refresh Spotify token" },
          { status: 401 }
        );
      }

      // Renovar token
      const newTokens = await spotifyAuthService.refreshAccessToken(
        userWithTokens.spotifyRefreshToken
      );

      if (!newTokens?.accessToken) {
        Logger.error("Failed to refresh Spotify token", null);
        return NextResponse.json(
          { error: "Failed to refresh Spotify token" },
          { status: 401 }
        );
      }

      // Atualizar no banco
      const expiresAt = new Date(
        Date.now() + (newTokens.expiresIn || 3600) * 1000
      );
      await prisma.user.update({
        where: { id: user.id },
        data: {
          spotifyAccessToken: newTokens.accessToken,
          spotifyTokenExpiry: expiresAt,
        },
      });

      Logger.success(`✅ Spotify token refreshed`);

      return NextResponse.json({
        success: true,
        data: {
          access_token: newTokens.accessToken,
          expires_in: newTokens.expiresIn || 3600,
          token_type: "Bearer",
        },
      });
    }

    // Token ainda é válido
    Logger.success(`✅ Returning valid Spotify access token`);

    const expiresIn = userWithTokens.spotifyTokenExpiry
      ? Math.floor(
          (userWithTokens.spotifyTokenExpiry.getTime() - now.getTime()) / 1000
        )
      : 3600;

    return NextResponse.json({
      success: true,
      data: {
        access_token: userWithTokens.spotifyAccessToken,
        expires_in: Math.max(0, expiresIn),
        token_type: "Bearer",
      },
    });
  } catch (error) {
    Logger.error("Error requesting player token", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get token" },
      { status: 400 }
    );
  }
}
