import { NextRequest, NextResponse } from "next/server";
import { SpotifyPlaybackService } from "@/services/spotifyPlaybackService";

/**
 * GET /api/playback/current
 * Retorna informações sobre o que está tocando agora
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
    const playbackState = await SpotifyPlaybackService.getCurrentPlayback(
      userId
    );

    return NextResponse.json({
      success: true,
      playback: playbackState,
    });
  } catch (error: any) {
    console.error("Erro ao obter estado:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao obter estado da reprodução" },
      { status: 500 }
    );
  }
}
