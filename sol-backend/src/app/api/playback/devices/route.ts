import { NextRequest, NextResponse } from "next/server";
import { SpotifyPlaybackService } from "@/services/spotifyPlaybackService";

/**
 * GET /api/playback/devices
 * Lista dispositivos Spotify disponíveis do usuário
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
    const devices = await SpotifyPlaybackService.getAvailableDevices(userId);

    return NextResponse.json({
      success: true,
      devices,
      totalDevices: devices.length,
    });
  } catch (error: any) {
    console.error("Erro ao listar dispositivos:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao listar dispositivos" },
      { status: 500 }
    );
  }
}
