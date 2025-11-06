/**
 * POST /api/spotify/auth/authorize
 * Gera URL de autorização do Spotify para o frontend
 * Usa Authorization Code Flow
 */

import { NextRequest, NextResponse } from "next/server";
import { spotifyService } from "@/lib/spotify-service-v2";
import { getUserFromRequest } from "@/lib/auth-helper";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    // Validar user está logado no SoL
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      );
    }

    // Gerar state token com userId para CSRF protection
    const state = crypto.randomBytes(32).toString("hex");
    const stateData = {
      state,
      userId: user.id,
      timestamp: Date.now(),
    };
    const stateToken = Buffer.from(JSON.stringify(stateData)).toString(
      "base64"
    );

    // Gerar URL de autorização Spotify
    const authUrl = spotifyService.getAuthorizationUrl(stateToken);

    return NextResponse.json({
      success: true,
      data: {
        authUrl,
        stateToken, // Frontend deve guardar isto
      },
      message: "URL de autorização gerada",
    });
  } catch (error) {
    console.error("Erro ao gerar URL de autorização:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
