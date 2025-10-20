import { NextRequest, NextResponse } from "next/server";
import { SpotifyPlaybackService } from "@/services/spotifyPlaybackService";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/playback/play
 * Body: { musicId: number, deviceId?: string }
 * Inicia reprodução de uma música específica
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
    const body = await request.json();
    const { musicId, deviceId } = body;

    // Valida parâmetros
    if (!musicId) {
      return NextResponse.json(
        { success: false, error: "musicId é obrigatório" },
        { status: 400 }
      );
    }

    // Busca música no banco para pegar spotifyId
    const music = await prisma.music.findUnique({
      where: { id: musicId },
      select: {
        spotifyId: true,
        name: true,
        artist: true,
      },
    });

    if (!music) {
      return NextResponse.json(
        { success: false, error: "Música não encontrada" },
        { status: 404 }
      );
    }

    if (!music.spotifyId) {
      return NextResponse.json(
        {
          success: false,
          error: "Esta música não está disponível no Spotify",
          musicName: music.name,
          artist: music.artist,
        },
        { status: 400 }
      );
    }

    // Converte spotifyId para URI (formato que a API aceita)
    const spotifyUri = `spotify:track:${music.spotifyId}`;

    // Inicia reprodução
    const result = await SpotifyPlaybackService.playTrack(
      userId,
      spotifyUri,
      deviceId
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Erro ao tocar música:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao iniciar reprodução",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
