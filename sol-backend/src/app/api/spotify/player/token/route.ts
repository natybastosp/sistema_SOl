import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { spotifyAuthService } from "@/lib/spotifyAuth";

export async function GET(request: NextRequest) {
  try {
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

    // Pegar token válido (renova automaticamente se necessário)
    const accessToken = await spotifyAuthService.getValidAccessToken(
      payload.userId
    );

    console.log(
      `🎫 Token fornecido para frontend do usuário ${payload.userId}`
    );

    return NextResponse.json({
      success: true,
      accessToken,
      // Informar quando o token expira para o frontend saber quando renovar
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hora
    });
  } catch (error: any) {
    console.error("❌ Erro ao fornecer token:", error);

    if (error.message.includes("não autenticou")) {
      return NextResponse.json(
        {
          success: false,
          error: "not_connected",
          message: "Você precisa conectar sua conta Spotify primeiro",
        },
        { status: 403 }
      );
    }

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
