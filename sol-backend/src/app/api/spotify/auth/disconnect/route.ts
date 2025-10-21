import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/spotify/auth/disconnect
 *
 * Desconecta a conta Spotify do usuário.
 *
 * Remove todos os tokens do banco de dados, efetivamente
 * revogando o acesso do nosso app à conta Spotify do usuário.
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Token inválido" },
        { status: 401 }
      );
    }

    // Limpar os tokens do Spotify do banco de dados
    await prisma.user.update({
      where: { id: payload.userId },
      data: {
        spotifyAccessToken: null,
        spotifyRefreshToken: null,
        spotifyTokenExpiry: null,
        spotifyUserId: null,
      },
    });

    console.log(`🔓 Usuário ${payload.userId} desconectou do Spotify`);

    return NextResponse.json({
      success: true,
      message: "Spotify desconectado com sucesso",
    });
  } catch (error: any) {
    console.error("❌ Erro ao desconectar Spotify:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
