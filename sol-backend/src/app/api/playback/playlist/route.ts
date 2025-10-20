import { NextRequest, NextResponse } from "next/server";
import { SpotifyPlaybackService } from "@/services/spotifyPlaybackService";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/playback/playlist
 * Body: { playlistId: number, deviceId?: string }
 * Toca todas as músicas de uma playlist
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
    const { playlistId, deviceId } = body;

    if (!playlistId) {
      return NextResponse.json(
        { success: false, error: "playlistId é obrigatório" },
        { status: 400 }
      );
    }

    // Busca todas as músicas da playlist
    const playlistMusics = await prisma.playlistMusic.findMany({
      where: { playlistId },
      include: {
        music: {
          select: {
            spotifyId: true,
            name: true,
            artist: true,
          },
        },
      },
      orderBy: { position: "asc" },
    });

    if (playlistMusics.length === 0) {
      return NextResponse.json(
        { success: false, error: "Playlist vazia ou não encontrada" },
        { status: 404 }
      );
    }

    // Filtra apenas músicas com spotifyId e converte para URIs
    const trackUris = playlistMusics
      .filter((pm) => pm.music.spotifyId)
      .map((pm) => `spotify:track:${pm.music.spotifyId}`);

    if (trackUris.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Nenhuma música desta playlist está disponível no Spotify",
          totalMusics: playlistMusics.length,
        },
        { status: 400 }
      );
    }

    // Inicia reprodução da playlist
    const result = await SpotifyPlaybackService.playPlaylist(
      userId,
      trackUris,
      deviceId
    );

    return NextResponse.json({
      ...result,
      totalMusics: playlistMusics.length,
      availableOnSpotify: trackUris.length,
    });
  } catch (error: any) {
    console.error("Erro ao tocar playlist:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao iniciar playlist" },
      { status: 500 }
    );
  }
}
