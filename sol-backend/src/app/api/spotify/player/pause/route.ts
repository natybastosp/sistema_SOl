import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { spotifyAuthService } from "@/lib/spotifyAuth";
import axios from "axios";

/**
 * PUT /api/spotify/player/pause
 *
 * Pausa a reprodução atual.
 */
export async function PUT(request: NextRequest) {
  try {
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

    const accessToken = await spotifyAuthService.getValidAccessToken(
      payload.userId
    );

    await axios.put(
      "https://api.spotify.com/v1/me/player/pause",
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log(`⏸️  Reprodução pausada para usuário ${payload.userId}`);

    return NextResponse.json({
      success: true,
      message: "Reprodução pausada",
    });
  } catch (error: any) {
    console.error("❌ Erro ao pausar reprodução:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Erro ao pausar",
        message: error.response?.data?.error?.message || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
