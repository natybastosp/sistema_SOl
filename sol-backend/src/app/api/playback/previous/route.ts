import { NextRequest, NextResponse } from "next/server";
import { SpotifyPlaybackService } from "@/services/spotifyPlaybackService";

/**
 * POST /api/playback/previous
 * Volta para música anterior
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
    const result = await SpotifyPlaybackService.skipToPrevious(userId);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Erro ao voltar música:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao voltar para música anterior" },
      { status: 500 }
    );
  }
}
