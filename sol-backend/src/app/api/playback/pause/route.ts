import { NextRequest, NextResponse } from "next/server";
import { SpotifyPlaybackService } from "@/services/spotifyPlaybackService";

/**
 * POST /api/playback/pause
 * Pausa a reprodução atual
 */
export async function POST(request: NextRequest) {
  try {
    const userIdHeader = request.headers.get("X-User-Id");

    if (!userIdHeader) {
      return NextResponse.json(
        { success: false, error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const userId = parseInt(userIdHeader);
    const result = await SpotifyPlaybackService.pausePlayback(userId);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Erro ao pausar:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao pausar reprodução" },
      { status: 500 }
    );
  }
}
