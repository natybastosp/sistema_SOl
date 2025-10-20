import { NextRequest, NextResponse } from "next/server";
import { SpotifyAuthService } from "@/services/spotifyAuthService";

/**
 * GET /api/auth/spotify
 * Retorna URL para usuário autorizar o app no Spotify
 */
export async function GET(request: NextRequest) {
  try {
    // O middleware adiciona o userId nos headers após validar JWT
    const userIdHeader = request.headers.get("X-User-Id");

    if (!userIdHeader) {
      return NextResponse.json(
        { success: false, error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const userId = parseInt(userIdHeader);

    // Gera URL de autorização do Spotify
    const authUrl = SpotifyAuthService.getAuthorizationUrl(userId);

    return NextResponse.json({
      success: true,
      authUrl,
      message: "Redirecione o usuário para esta URL",
    });
  } catch (error: any) {
    console.error("Erro ao gerar URL de autenticação:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
