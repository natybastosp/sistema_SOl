/**
 * GET /api/spotify/auth/token
 * Retorna o access token do Spotify do usuário
 */

import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { spotifyService } from "@/lib/spotify-service-v2";

export async function GET(request: NextRequest) {
  try {
    // Validar que user está autenticado no SoL
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      );
    }

    // Buscar tokens do Spotify no banco
    const userWithTokens = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        spotifyAccessToken: true,
        spotifyRefreshToken: true,
        spotifyTokenExpiry: true,
      },
    });

    if (!userWithTokens?.spotifyAccessToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Spotify não conectado. Faça login no Spotify primeiro",
        },
        { status: 403 }
      );
    }

    const now = new Date();
    const expiryDate = userWithTokens.spotifyTokenExpiry;

    // Verificar se token expirou
    if (expiryDate && now > expiryDate) {
      console.log("🔄 Access token expirou, renovando...");

      if (!userWithTokens.spotifyRefreshToken) {
        return NextResponse.json(
          {
            success: false,
            error: "Refresh token não disponível",
          },
          { status: 403 }
        );
      }

      try {
        // Renovar token
        const refreshedTokens = await spotifyService.refreshAccessToken(
          userWithTokens.spotifyRefreshToken
        );

        // Salvar novo token no banco
        const newExpiryDate = new Date();
        newExpiryDate.setSeconds(
          newExpiryDate.getSeconds() + refreshedTokens.expires_in
        );

        await prisma.user.update({
          where: { id: user.id },
          data: {
            spotifyAccessToken: refreshedTokens.access_token,
            spotifyRefreshToken:
              refreshedTokens.refresh_token ||
              userWithTokens.spotifyRefreshToken,
            spotifyTokenExpiry: newExpiryDate,
          },
        });

        console.log("✅ Token renovado com sucesso");

        return NextResponse.json({
          success: true,
          data: {
            accessToken: refreshedTokens.access_token,
            expiresIn: refreshedTokens.expires_in,
          },
        });
      } catch (error) {
        console.error("❌ Falha ao renovar token:", error);
        return NextResponse.json(
          {
            success: false,
            error: "Falha ao renovar token",
          },
          { status: 403 }
        );
      }
    }

    // Token ainda válido
    return NextResponse.json({
      success: true,
      data: {
        accessToken: userWithTokens.spotifyAccessToken,
      },
    });
  } catch (error) {
    console.error("❌ Erro ao obter token:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
