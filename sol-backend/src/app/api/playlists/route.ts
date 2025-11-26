import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { Logger } from "@/lib/logger";
import { errorHandler } from "@/middleware/error-handler";
import { z } from "zod";

const createPlaylistSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  emotionalStateId: z.string(),
  musics: z.array(
    z.object({
      musicId: z.string(),
      position: z.number(),
    })
  ),
  cover: z.string().optional(),
});

/**
 * GET /api/playlists
 * Lista todas as playlists do usuário autenticado
 * 🔐 ROTA PROTEGIDA
 */
export async function GET(request: NextRequest) {
  try {
    Logger.info("📋 Listando playlists do usuário...");

    // Autenticação
    const user = await getUserFromRequest(request);

    // Buscar playlists do usuário com todas as informações necessárias
    const playlists = await prisma.playlist.findMany({
      where: {
        userId: user.id,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    Logger.info(`✅ ${playlists.length} playlists encontradas`);

    // Formatar dados para o frontend
    const formattedPlaylists = playlists.map((playlist) => {
      // Calcular duração total
      const totalDurationMs = playlist.playlistMusics.reduce(
        (sum, pm) => sum + (pm.music.duration || 0),
        0
      );
      const totalMinutes = Math.floor(totalDurationMs / 60000);
      const totalSeconds = Math.floor((totalDurationMs % 60000) / 1000);
      const duration = `${totalMinutes}:${totalSeconds
        .toString()
        .padStart(2, "0")}`;

      // Calcular média de likes (feedbacks)
      const likes = playlist.feedbacks.length;

      // Extrair emoções do estado emocional
      const emotions = {
        sadness: playlist.emotionalState.sadness,
        joy: playlist.emotionalState.joy,
        anger: playlist.emotionalState.anger,
        fear: playlist.emotionalState.fear,
        surprise: playlist.emotionalState.surprise,
      };

      // Determinar emoji da capa baseado na emoção dominante
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

      return {
        id: playlist.id,
        name: playlist.name,
        description: playlist.description || "",
        date: playlist.createdAt.toISOString().split("T")[0],
        musicCount: playlist.playlistMusics.length,
        duration,
        likes: playlist.likes || likes,
        cover,
        emotions,
        spotifyPlaylistId: playlist.spotifyPlaylistId,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedPlaylists,
      total: formattedPlaylists.length,
    });
  } catch (error) {
    Logger.error("❌ Erro ao listar playlists:", error);
    return errorHandler(error);
  }
}

/**
 * POST /api/playlists
 * Cria uma nova playlist no banco de dados
 * 🔐 ROTA PROTEGIDA
 */
export async function POST(request: NextRequest) {
  try {
    Logger.info("💾 Salvando nova playlist...");

    // Autenticação
    const user = await getUserFromRequest(request);

    // Parse e validação
    const body = await request.json();
    const { name, description, emotionalStateId, musics, cover } =
      createPlaylistSchema.parse(body);

    Logger.debug("✅ Dados validados", {
      name,
      musicCount: musics.length,
      emotionalStateId,
    });

    // Verificar se o emotional state pertence ao usuário
    const emotionalState = await prisma.emotionalState.findUnique({
      where: { id: emotionalStateId },
    });

    if (!emotionalState || emotionalState.userId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Estado emocional não encontrado ou não pertence ao usuário",
        },
        { status: 404 }
      );
    }

    // Criar playlist
    const playlist = await prisma.playlist.create({
      data: {
        userId: user.id,
        emotionalStateId,
        name,
        description: description || "",
        cover: cover || "🎵",
        likes: 0,
      },
    });

    Logger.debug("✅ Playlist criada", { id: playlist.id });

    // Adicionar músicas à playlist
    if (musics.length > 0) {
      await prisma.playlistMusic.createMany({
        data: musics.map((m) => ({
          playlistId: playlist.id,
          musicId: m.musicId,
          position: m.position,
        })),
      });

      Logger.debug(`✅ ${musics.length} músicas adicionadas à playlist`);
    }

    // Buscar playlist completa para retornar
    const playlistCompleta = await prisma.playlist.findUnique({
      where: { id: playlist.id },
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
      },
    });

    Logger.info("✅ Playlist salva com sucesso!");

    return NextResponse.json({
      success: true,
      data: {
        id: playlistCompleta!.id,
        name: playlistCompleta!.name,
        description: playlistCompleta!.description,
        musicCount: playlistCompleta!.playlistMusics.length,
        cover: playlistCompleta!.cover,
      },
      message: "Playlist salva com sucesso!",
    });
  } catch (error) {
    Logger.error("❌ Erro ao salvar playlist:", error);
    return errorHandler(error);
  }
}
