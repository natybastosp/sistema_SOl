import { NextRequest, NextResponse } from "next/server";
import { Logger } from "@/lib/logger";
import { getUserFromRequest } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { spotifyAuthService } from "@/lib/spotifyAuth";
import { z } from "zod";

/**
 * POST /api/spotify/play
 *
 * Inicia reprodução de uma música ou playlist no Spotify
 * Requer um device_id do Web Playback SDK do Spotify
 */

const playSchema = z.object({
  context_uri: z.string().optional(), // spotify:album:id, spotify:playlist:id
  uris: z.array(z.string()).optional(), // [spotify:track:id, ...]
  offset: z.number().default(0).optional(), // Posição inicial
  position_ms: z.number().default(0).optional(), // Tempo inicial em ms
  device_id: z.string(), // Device Spotify ativo
});

export async function POST(request: NextRequest) {
  try {
    Logger.info("▶️  Iniciating Spotify playback");

    // Autenticar usuário
    const user = await getUserFromRequest(request);

    // Parse request body
    const body = await request.json();

    // Validar payload
    const validated = playSchema.parse(body);

    // Buscar access token do usuário
    const userWithTokens = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!userWithTokens?.spotifyAccessToken) {
      Logger.warn(`User ${user.id} has no Spotify token`);
      return NextResponse.json(
        { error: "User not connected to Spotify" },
        { status: 401 }
      );
    }

    // Construir payload para Spotify Web API
    const playPayload: any = {};

    if (validated.context_uri) {
      playPayload.context_uri = validated.context_uri;
      if ((validated.offset ?? 0) > 0) {
        playPayload.offset = { position: validated.offset };
      }
      if ((validated.position_ms ?? 0) > 0) {
        playPayload.position_ms = validated.position_ms;
      }
    } else if (validated.uris && validated.uris.length > 0) {
      playPayload.uris = validated.uris;
      // Para uris, offset é opcional
      if ((validated.offset ?? 0) > 0) {
        playPayload.offset = { position: 0 }; // Começar na primeira track
      }
    } else {
      return NextResponse.json(
        { error: "Either context_uri or uris is required" },
        { status: 400 }
      );
    }

    Logger.debug("▶️  Play payload:", JSON.stringify(playPayload));
    Logger.debug("🎵 Device ID:", validated.device_id);

    // Enviar para Spotify API
    // device_id deve ser passado como query parameter, não no body
    const response = await fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${validated.device_id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${userWithTokens.spotifyAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playPayload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      Logger.error(`Spotify API error: ${response.status}`, errorData);

      // Se token expirou (401), tentar renovar
      if (response.status === 401 && userWithTokens.spotifyRefreshToken) {
        Logger.info("🔄 Token expirado, tentando renovar...");
        // Aqui você renova o token usando refreshAccessToken
        return NextResponse.json(
          { error: "Spotify token expired, please reconnect" },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: errorData.error?.message || "Failed to play track" },
        { status: response.status }
      );
    }

    Logger.success(`✅ Playback started successfully`);

    return NextResponse.json({
      success: true,
      data: {
        message: "Playback started",
      },
    });
  } catch (error) {
    Logger.error("Error initiating playback", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to play" },
      { status: 400 }
    );
  }
}
