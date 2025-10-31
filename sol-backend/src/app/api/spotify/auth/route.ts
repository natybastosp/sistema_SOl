import { NextRequest, NextResponse } from "next/server";
import { Logger } from "@/lib/logger";
import { getUserFromRequest } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/spotify/auth
 *
 * Verifica se o usuário está autenticado com Spotify
 * Retorna informações sobre a conexão
 */
export async function GET(request: NextRequest) {
  try {
    Logger.info("🔐 Checking Spotify authentication status");

    // Autenticar usuário
    const user = await getUserFromRequest(request);

    // Buscar dados do usuário
    const userWithSpotify = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        spotifyUserId: true,
        spotifyAccessToken: true,
        spotifyTokenExpiry: true,
      },
    });

    if (!userWithSpotify?.spotifyAccessToken) {
      Logger.info(`ℹ️ User ${user.id} is not connected to Spotify`);
      return NextResponse.json({
        success: true,
        data: {
          connected: false,
          message: "Not connected to Spotify",
        },
      });
    }

    // Verificar se o token expirou
    const now = new Date();
    const isExpired =
      userWithSpotify.spotifyTokenExpiry &&
      now > userWithSpotify.spotifyTokenExpiry;

    Logger.success(`✅ User ${user.id} is connected to Spotify`);

    return NextResponse.json({
      success: true,
      data: {
        connected: true,
        spotifyId: userWithSpotify.spotifyUserId,
        tokenExpired: isExpired,
        expiresAt: userWithSpotify.spotifyTokenExpiry,
      },
    });
  } catch (error) {
    Logger.error("Error checking Spotify auth", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to check auth",
      },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/spotify/auth
 *
 * Desconecta o usuário do Spotify, removendo os tokens
 */
export async function DELETE(request: NextRequest) {
  try {
    Logger.info("🔌 Disconnecting Spotify account");

    // Autenticar usuário
    const user = await getUserFromRequest(request);

    // Remover tokens Spotify
    await prisma.user.update({
      where: { id: user.id },
      data: {
        spotifyUserId: null,
        spotifyAccessToken: null,
        spotifyRefreshToken: null,
        spotifyTokenExpiry: null,
      },
    });

    Logger.success(`✅ Spotify account disconnected for user ${user.id}`);

    return NextResponse.json({
      success: true,
      data: {
        message: "Spotify account disconnected",
      },
    });
  } catch (error) {
    Logger.error("Error disconnecting Spotify", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to disconnect",
      },
      { status: 400 }
    );
  }
}
