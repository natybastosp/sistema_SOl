import { NextRequest, NextResponse } from "next/server";
import { SpotifyAuthService } from "@/services/spotifyAuthService";

/**
 * GET /api/auth/spotify/callback?code=xxx&state=userId
 * Spotify redireciona usuário para cá após autorização
 * Esta rota é PÚBLICA (não precisa de auth), pois o usuário vem do Spotify
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code"); // Código temporário do Spotify
  const state = searchParams.get("state"); // userId que enviamos antes
  const error = searchParams.get("error"); // Se usuário negou permissão

  // Se usuário negou permissão no Spotify
  if (error) {
    console.log("❌ Usuário negou permissão no Spotify:", error);
    return NextResponse.redirect(
      `${process.env.FRONTEND_URL}/settings?spotify=denied`
    );
  }

  // Valida parâmetros obrigatórios
  if (!code || !state) {
    console.error("❌ Callback sem code ou state");
    return NextResponse.redirect(
      `${process.env.FRONTEND_URL}/error?message=Parametros invalidos`
    );
  }

  try {
    const userId = parseInt(state);

    // Troca código temporário por tokens de longa duração
    await SpotifyAuthService.exchangeCodeForTokens(code, userId);

    console.log(`✅ Usuário ${userId} conectado ao Spotify com sucesso`);

    // Redireciona usuário de volta ao frontend com sucesso
    return NextResponse.redirect(
      `${process.env.FRONTEND_URL}/settings?spotify=connected`
    );
  } catch (error: any) {
    console.error("❌ Erro no callback do Spotify:", error);
    return NextResponse.redirect(
      `${process.env.FRONTEND_URL}/error?message=Falha ao conectar Spotify`
    );
  }
}
