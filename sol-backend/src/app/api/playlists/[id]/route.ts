import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { Logger } from "@/lib/logger";
import { errorHandler } from "@/middleware/error-handler";

/**
 * GET /api/playlists/:id
 * Busca uma playlist específica do usuário
 * 🔐 ROTA PROTEGIDA
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const playlistId = params.id;
    Logger.info(`📋 Buscando playlist ${playlistId}...`);

    // Autenticação
    const user = await getUserFromRequest(request);

    // Buscar playlist
    const playlist = await prisma.playlist.findUnique({
      where: {
        id: playlistId,
      },
      include: {
        emotionalState: true,
        playlistMusics: {
          include: {
            music: true,
          },
          orderBy: {
            position: "asc",
          },
        },
        feedbacks: true,
      },
    });

    // Verificar se existe e pertence ao usuário
    if (!playlist) {
      return NextResponse.json(
        {
          success: false,
          error: "Playlist não encontrada",
        },
        { status: 404 }
      );
    }

    if (playlist.userId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Você não tem permissão para acessar esta playlist",
        },
        { status: 403 }
      );
    }

    Logger.info(`✅ Playlist encontrada: ${playlist.name}`);

    // Formatar dados
    const totalDurationMs = playlist.playlistMusics.reduce(
      (sum, pm) => sum + (pm.music.duration || 0),
      0
    );
    const totalMinutes = Math.floor(totalDurationMs / 60000);
    const totalSeconds = Math.floor((totalDurationMs % 60000) / 1000);
    const duration = `${totalMinutes}:${totalSeconds
      .toString()
      .padStart(2, "0")}`;

    const emotions = {
      sadness: playlist.emotionalState.sadness,
      joy: playlist.emotionalState.joy,
      anger: playlist.emotionalState.anger,
      fear: playlist.emotionalState.fear,
      surprise: playlist.emotionalState.surprise,
    };

    let cover = playlist.cover;
    if (!cover) {
      const dominantEmotion = Object.entries(emotions).reduce((max, curr) =>
        curr[1] > max[1] ? curr : max
      )[0];

      const emotionEmojis: Record<string, string> = {
        joy: "😊",
        sadness: "😢",
        anger: "😠",
        fear: "😨",
        surprise: "😮",
      };
      cover = emotionEmojis[dominantEmotion] || "🎵";
    }

    return NextResponse.json({
      success: true,
      data: {
        id: playlist.id,
        name: playlist.name,
        description: playlist.description || "",
        date: playlist.createdAt.toISOString().split("T")[0],
        musicCount: playlist.playlistMusics.length,
        duration,
        likes: playlist.likes || playlist.feedbacks.length,
        cover,
        emotions,
        spotifyPlaylistId: playlist.spotifyPlaylistId,
        musics: playlist.playlistMusics.map((pm) => ({
          id: pm.music.id,
          name: pm.music.name,
          artist: pm.music.artist,
          album: pm.music.album,
          duration: pm.music.duration,
          spotifyId: pm.music.spotifyId,
          spotifyUri: pm.music.spotifyUri,
        })),
      },
    });
  } catch (error) {
    Logger.error("❌ Erro ao buscar playlist:", error);
    return errorHandler(error);
  }
}

/**
 * DELETE /api/playlists/:id
 * Deleta uma playlist do usuário
 * 🔐 ROTA PROTEGIDA
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const playlistId = params.id;
    Logger.info(`🗑️ Deletando playlist ${playlistId}...`);

    // Autenticação
    const user = await getUserFromRequest(request);

    // Buscar playlist
    const playlist = await prisma.playlist.findUnique({
      where: {
        id: playlistId,
      },
    });

    // Verificar se existe e pertence ao usuário
    if (!playlist) {
      return NextResponse.json(
        {
          success: false,
          error: "Playlist não encontrada",
        },
        { status: 404 }
      );
    }

    if (playlist.userId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Você não tem permissão para deletar esta playlist",
        },
        { status: 403 }
      );
    }

    // Deletar playlist (cascade vai deletar relacionamentos)
    await prisma.playlist.delete({
      where: {
        id: playlistId,
      },
    });

    Logger.info(`✅ Playlist deletada: ${playlist.name}`);

    return NextResponse.json({
      success: true,
      message: "Playlist deletada com sucesso",
    });
  } catch (error) {
    Logger.error("❌ Erro ao deletar playlist:", error);
    return errorHandler(error);
  }
}

/**
 * PATCH /api/playlists/:id
 * Atualiza uma playlist (curtir, editar nome/descrição)
 * 🔐 ROTA PROTEGIDA
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const playlistId = params.id;
    Logger.info(`✏️ Atualizando playlist ${playlistId}...`);

    // Autenticação
    const user = await getUserFromRequest(request);

    // Parse body
    const body = await request.json();
    const { name, description, likes, cover } = body;

    // Buscar playlist
    const playlist = await prisma.playlist.findUnique({
      where: {
        id: playlistId,
      },
    });

    // Verificar se existe e pertence ao usuário
    if (!playlist) {
      return NextResponse.json(
        {
          success: false,
          error: "Playlist não encontrada",
        },
        { status: 404 }
      );
    }

    if (playlist.userId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Você não tem permissão para atualizar esta playlist",
        },
        { status: 403 }
      );
    }

    // Atualizar playlist
    const updatedPlaylist = await prisma.playlist.update({
      where: {
        id: playlistId,
      },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(likes !== undefined && { likes }),
        ...(cover !== undefined && { cover }),
      },
    });

    Logger.info(`✅ Playlist atualizada: ${updatedPlaylist.name}`);

    return NextResponse.json({
      success: true,
      data: updatedPlaylist,
    });
  } catch (error) {
    Logger.error("❌ Erro ao atualizar playlist:", error);
    return errorHandler(error);
  }
}
