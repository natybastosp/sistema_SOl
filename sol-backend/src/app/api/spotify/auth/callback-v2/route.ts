/**
 * GET /api/spotify/auth/callback
 * Recebe o authorization code do Spotify
 * Troca code por access_token + refresh_token
 * Usa Authorization Code Flow
 */

import { NextRequest, NextResponse } from "next/server";
import { spotifyService } from "@/lib/spotify-service-v2";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Verificar se user clicou "Recusar"
    if (error) {
      const errorDescription = searchParams.get("error_description");
      console.log(`❌ User recusou autorização: ${errorDescription}`);

      // Redirecionar para frontend com erro
      return NextResponse.redirect(
        `http://localhost:3001/spotify-callback?error=${error}&description=${errorDescription}`
      );
    }

    if (!code || !state) {
      return NextResponse.json(
        {
          success: false,
          error: "Code e state são obrigatórios",
        },
        { status: 400 }
      );
    }

    // Decodificar stateToken para validar CSRF e obter userId
    let stateData: { userId: string; timestamp: number };
    try {
      const decodedState = JSON.parse(
        Buffer.from(state, "base64").toString("utf-8")
      );
      stateData = decodedState;
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "State token inválido",
        },
        { status: 400 }
      );
    }

    const { userId } = stateData;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "UserId não encontrado no state token",
        },
        { status: 400 }
      );
    }

    console.log(`✅ Recebido code para usuário: ${userId}`);

    // Trocar code por tokens
    console.log("🔄 Trocando code por tokens...");
    const tokenData = await spotifyService.exchangeCodeForTokens(code);

    const { access_token, refresh_token, expires_in } = tokenData;

    // Obter perfil do user no Spotify
    console.log("👤 Buscando perfil no Spotify...");
    const spotifyProfile = await spotifyService.getUserProfile(access_token);

    console.log(`✅ Perfil obtido: ${spotifyProfile.display_name}`);

    // Verificar se é Premium
    if (spotifyProfile.product !== "premium") {
      console.log(`❌ User não é Premium: ${spotifyProfile.product || "free"}`);

      return NextResponse.json(
        {
          success: false,
          error: "Apenas usuários Spotify Premium podem usar Web Playback SDK",
        },
        { status: 403 }
      );
    }

    // Salvar tokens no banco
    console.log("💾 Salvando tokens no banco...");

    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + expires_in);

    await prisma.user.update({
      where: { id: userId },
      data: {
        spotifyUserId: spotifyProfile.id,
        spotifyAccessToken: access_token,
        spotifyRefreshToken: refresh_token,
        spotifyTokenExpiry: expiryDate,
      },
    });

    console.log(`✅ Tokens salvos para usuário: ${userId}`);

    // Redirecionar para frontend com sucesso
    const redirectUrl = new URL("http://localhost:3001/spotify-callback");
    redirectUrl.searchParams.set("success", "true");
    redirectUrl.searchParams.set("spotifyId", spotifyProfile.id);

    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error("❌ Erro no callback:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";

    // Redirecionar para frontend com erro
    return NextResponse.redirect(
      `http://localhost:3001/spotify-callback?error=${encodeURIComponent(
        errorMessage
      )}`
    );
  }
}
