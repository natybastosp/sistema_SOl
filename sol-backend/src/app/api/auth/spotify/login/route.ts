import { NextRequest, NextResponse } from "next/server";
import { spotifyAuthService } from "@/lib/spotifyAuth";
import { Logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    Logger.info("🎵 Iniciando login Spotify");

    // Gerar URL de autorização
    const state = Math.random().toString(36).substring(7);
    const authUrl = spotifyAuthService.getAuthorizationUrl(state);

    Logger.debug("✅ URL gerada", { state });

    return NextResponse.json({
      success: true,
      data: {
        authUrl: authUrl,
        state: state,
      },
    });
  } catch (error) {
    Logger.error("❌ Erro ao iniciar login Spotify", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao iniciar autenticação",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/spotify/login
 * Redireciona para Spotify
 */
export async function GET(request: NextRequest) {
  try {
    Logger.info("🎵 Iniciando login Spotify (GET)");

    const state = Math.random().toString(36).substring(7);
    const authUrl = spotifyAuthService.getAuthorizationUrl(state);

    Logger.debug("✅ Redirecionando para Spotify");

    return NextResponse.redirect(authUrl);
  } catch (error) {
    Logger.error("❌ Erro ao redirecionar para Spotify", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao redirecionar",
      },
      { status: 500 }
    );
  }
}
