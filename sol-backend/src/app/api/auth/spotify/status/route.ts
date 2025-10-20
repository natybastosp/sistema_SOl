import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/auth/spotify/status
 * Verifica se usuário está conectado ao Spotify
 */
export async function GET(request: NextRequest) {
  try {
    const userIdHeader = request.headers.get("X-User-Id");

    if (!userIdHeader) {
      return NextResponse.json(
        { success: false, error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const userId = parseInt(userIdHeader);

    // Busca status da conexão no banco
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        spotifyConnected: true,
        spotifyTokenExpiry: true,
      },
    });

    // Verifica se token ainda é válido
    const isTokenValid = user?.spotifyTokenExpiry
      ? user.spotifyTokenExpiry > new Date()
      : false;

    return NextResponse.json({
      success: true,
      connected: user?.spotifyConnected || false,
      tokenValid: isTokenValid,
    });
  } catch (error: any) {
    console.error("Erro ao verificar status:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/spotify/status
 * Desconecta usuário do Spotify
 */
export async function DELETE(request: NextRequest) {
  try {
    const userIdHeader = request.headers.get("X-User-Id");

    if (!userIdHeader) {
      return NextResponse.json(
        { success: false, error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const userId = parseInt(userIdHeader);

    // Remove tokens do banco
    await SpotifyAuthService.disconnectSpotify(userId);

    return NextResponse.json({
      success: true,
      message: "Desconectado do Spotify",
    });
  } catch (error: any) {
    console.error("Erro ao desconectar:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
