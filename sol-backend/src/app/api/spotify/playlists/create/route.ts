import { NextRequest, NextResponse } from "next/server";
import { SpotifyService } from "@/lib/spotify-service";
import { getUserFromRequest } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { Logger } from "@/lib/logger";
import { z } from "zod";
import { errorHandler } from "@/middleware/error-handler";

const createPlaylistSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().default("Criada pelo SOL"),
  trackUris: z.array(z.string()).min(1, "Pelo menos 1 track necessário"),
  isPublic: z.boolean().default(false),
});

/**
 * POST /api/spotify/playlists/create
 * Cria playlist no Spotify e adiciona tracks
 * 🔐 ROTA PROTEGIDA
 */
export async function POST(request: NextRequest) {
  try {
    Logger.info("📝 Criando playlist no Spotify...");

    // Autenticação
    const user = await getUserFromRequest(request);

    // Parse body
    const body = await request.json();
    const { name, description, trackUris, isPublic } =
      createPlaylistSchema.parse(body);

    Logger.debug("✅ Dados validados", { name, tracks: trackUris.length });

    // Buscar tokens do Spotify
    const spotifyAuth = await prisma.spotifyAuth.findUnique({
      where: { userId: user.id },
    });

    if (!spotifyAuth) {
      return NextResponse.json(
        {
          success: false,
          error: "Conecte sua conta do Spotify primeiro",
        },
        { status: 401 }
      );
    }

    // Verificar se token não expirou
    if (new Date() > spotifyAuth.expiresAt) {
      Logger.warn("⚠️ Token Spotify expirado");
      return NextResponse.json(
        {
          success: false,
          error: "Token Spotify expirado. Reconecte sua conta.",
        },
        { status: 401 }
      );
    }

    // Buscar spotifyUserId
    const spotifyUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!spotifyUser?.spotifyUserId) {
      return NextResponse.json(
        {
          success: false,
          error: "Perfil do Spotify não encontrado",
        },
        { status: 400 }
      );
    }

    // Criar playlist no Spotify
    const playlist = await SpotifyService.createPlaylist(
      spotifyUser.spotifyUserId,
      name,
      description,
      isPublic,
      spotifyAuth.accessToken
    );

    Logger.debug("✅ Playlist criada no Spotify", { id: playlist.id });

    // Adicionar tracks
    await SpotifyService.addTracksToPlaylist(
      playlist.id,
      trackUris,
      spotifyAuth.accessToken
    );

    Logger.info("✅ Tracks adicionadas à playlist");

    return NextResponse.json({
      success: true,
      data: {
        playlistId: playlist.id,
        playlistUrl: playlist.externalUrl,
        name: playlist.name,
        uri: playlist.uri,
        image: playlist.image,
        tracksCount: trackUris.length,
      },
    });
  } catch (error) {
    Logger.error("❌ Erro ao criar playlist", error);
    return errorHandler(error);
  }
}
