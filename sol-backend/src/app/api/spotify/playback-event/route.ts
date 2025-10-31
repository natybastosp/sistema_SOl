import { NextRequest, NextResponse } from "next/server";
import { Logger } from "@/lib/logger";
import { getUserFromRequest } from "@/lib/auth-helper";
import { z } from "zod";

/**
 * POST /api/spotify/playback-event
 *
 * Recebe eventos de playback do frontend
 * Pode ser usado para analytics, atualizar estado de reprodução, etc.
 */

const playbackEventSchema = z.object({
  event: z.enum(["play", "pause", "skip", "track_changed", "error"]),
  trackId: z.string().optional(),
  trackName: z.string().optional(),
  artist: z.string().optional(),
  duration: z.number().optional(),
  currentPosition: z.number().optional(),
  timestamp: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    Logger.info("🎵 Received playback event");

    // Autenticar usuário
    const user = await getUserFromRequest(request);

    // Parse request body
    const body = await request.json();

    // Validar evento
    const validated = playbackEventSchema.parse(body);

    // Log o evento para analytics/debugging
    Logger.info(`📊 Playback event: ${validated.event}`, {
      userId: user.id,
      track: validated.trackName,
      artist: validated.artist,
      position: validated.currentPosition,
    });

    // Aqui você pode:
    // 1. Salvar eventos em banco para analytics
    // 2. Atualizar estado de reprodução atual
    // 3. Enviar para serviço de BI
    // 4. Ajustar recomendações baseado no comportamento

    return NextResponse.json({
      success: true,
      data: {
        event: validated.event,
        processed: true,
      },
    });
  } catch (error) {
    Logger.error("Error processing playback event", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process event",
      },
      { status: 400 }
    );
  }
}

/**
 * GET /api/spotify/playback-event
 *
 * Retorna histórico de eventos de playback do usuário (últimos 10)
 */
export async function GET(request: NextRequest) {
  try {
    Logger.info("📜 Fetching playback events history");

    // Autenticar usuário
    const user = await getUserFromRequest(request);

    // Retornar eventos fictícios ou do banco se implementado
    const events = [
      {
        event: "play",
        trackName: "Song Name",
        artist: "Artist Name",
        timestamp: new Date(),
      },
    ];

    Logger.success(`✅ Retrieved playback events for user ${user.id}`);

    return NextResponse.json({
      success: true,
      data: {
        events,
        total: events.length,
      },
    });
  } catch (error) {
    Logger.error("Error fetching playback events", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch events",
      },
      { status: 400 }
    );
  }
}
