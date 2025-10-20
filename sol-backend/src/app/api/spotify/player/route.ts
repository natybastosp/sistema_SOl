import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { spotifyAuthService } from "@/lib/spotifyAuth";
import axios from "axios";

const SPOTIFY_API = "https://api.spotify.com/v1";

async function makeSpotifyRequest(
  userId: string,
  method: string,
  endpoint: string,
  data?: any
) {
  try {
    // Pegar token válido (renova automaticamente se expirado)
    const accessToken = await spotifyAuthService.getValidAccessToken(userId);

    const response = await axios({
      method,
      url: `${SPOTIFY_API}${endpoint}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data,
    });

    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(`❌ Erro na requisição Spotify ${method} ${endpoint}:`, {
      status: error.response?.status,
      message: error.response?.data?.error?.message,
    });

    // Tratar erros específicos do Spotify
    if (error.response?.status === 404) {
      return {
        success: false,
        error: "not_found",
        message: "Dispositivo ou recurso não encontrado",
      };
    }

    if (error.response?.status === 403) {
      return {
        success: false,
        error: "premium_required",
        message: "Esta ação requer Spotify Premium",
      };
    }

    if (error.response?.status === 429) {
      return {
        success: false,
        error: "rate_limit",
        message: "Muitas requisições. Aguarde um momento",
      };
    }

    return {
      success: false,
      error: "spotify_error",
      message:
        error.response?.data?.error?.message || "Erro ao comunicar com Spotify",
    };
  }
}

/**
 * POST /api/spotify/player/play
 *
 * Inicia a reprodução de uma música ou playlist.
 *
 * Body esperado:
 * {
 *   uris?: string[],        // URIs das músicas (spotify:track:xxx)
 *   context_uri?: string,   // URI de playlist/álbum (spotify:playlist:xxx)
 *   device_id?: string      // ID do dispositivo (opcional)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Token inválido" },
        { status: 401 }
      );
    }

    // Extrair dados do body
    const body = await request.json();
    const { uris, context_uri, device_id, position_ms } = body;

    // Validar que pelo menos um dos parâmetros foi fornecido
    if (!uris && !context_uri) {
      return NextResponse.json(
        {
          success: false,
          error: "Parâmetros inválidos",
          message: "Forneça 'uris' ou 'context_uri'",
        },
        { status: 400 }
      );
    }

    // Construir payload para o Spotify
    const playbackData: any = {};
    if (uris) playbackData.uris = uris;
    if (context_uri) playbackData.context_uri = context_uri;
    if (position_ms) playbackData.position_ms = position_ms;

    // Fazer requisição ao Spotify
    let endpoint = "/me/player/play";
    if (device_id) {
      endpoint += `?device_id=${device_id}`;
    }

    const result = await makeSpotifyRequest(
      payload.userId,
      "PUT",
      endpoint,
      playbackData
    );

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    console.log(`▶️  Reprodução iniciada para usuário ${payload.userId}`);

    return NextResponse.json({
      success: true,
      message: "Reprodução iniciada",
    });
  } catch (error: any) {
    console.error("❌ Erro ao iniciar reprodução:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
