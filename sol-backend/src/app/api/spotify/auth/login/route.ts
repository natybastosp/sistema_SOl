import { NextRequest, NextResponse } from "next/server";
import { spotifyAuthService } from "@/lib/spotifyAuth";
import { verifyToken } from "@/lib/auth";
import crypto from "crypto";

/**
 * POST /api/spotify/auth/login
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar se o usuário está autenticado no sistema SOL
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        {
          success: false,
          error: "Token de autenticação não fornecido",
          message: "Você precisa estar logado para conectar com Spotify",
        },
        { status: 401 }
      );
    }

    // Extrair e validar o token JWT
    const token = authHeader.replace("Bearer ", "");
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: "Token inválido",
          message: "Sua sessão expirou. Faça login novamente",
        },
        { status: 401 }
      );
    }

    const state = crypto.randomBytes(32).toString("hex");

    const stateToken = Buffer.from(
      JSON.stringify({
        state,
        userId: payload.userId,
        timestamp: Date.now(),
      })
    ).toString("base64");

    // Gerar a URL de autorização do Spotify
    const authUrl = spotifyAuthService.getAuthorizationUrl(state);

    // Retornar a URL e o token de state para o frontend
    // O frontend vai guardar o stateToken e depois mandar de volta
    // no callback para validarmos
    return NextResponse.json({
      success: true,
      authUrl,
      stateToken, // Frontend precisa guardar isso!
      message: "Redirecionando para autorização do Spotify",
    });
  } catch (error: any) {
    console.error("❌ Erro ao iniciar autenticação Spotify:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno",
        message: "Não foi possível iniciar a autenticação",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
