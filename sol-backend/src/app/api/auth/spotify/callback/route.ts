import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { spotifyAuthService } from "@/lib/spotifyAuth";
import { Logger } from "@/lib/logger";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Verificar se houve erro no callback do Spotify
    if (error) {
      Logger.error(`Spotify OAuth Error: ${error}`, null);
      return NextResponse.redirect(
        `${FRONTEND_URL}/login?error=${error}&error_description=${
          searchParams.get("error_description") || "Unknown error"
        }`
      );
    }

    // Validar parâmetros obrigatórios
    if (!code || !state) {
      Logger.error("Missing code or state parameter", null);
      return NextResponse.json(
        { error: "Missing authorization code or state" },
        { status: 400 }
      );
    }

    // SEGURANÇA: Validar state (CSRF protection)
    Logger.info(`🔒 Validating OAuth state for CSRF protection`);
    const oauthState = await prisma.oAuthState.findUnique({
      where: { state },
    });

    if (!oauthState) {
      Logger.error(`Invalid or expired state token: ${state}`, null);
      return NextResponse.json(
        { error: "Invalid or expired state token" },
        { status: 400 }
      );
    }

    // Verificar se expirou (5 minutos)
    if (new Date() > oauthState.expiresAt) {
      Logger.error("State token expired", null);
      await prisma.oAuthState.delete({ where: { state } });
      return NextResponse.json(
        { error: "State token expired" },
        { status: 400 }
      );
    }

    // Remover state já usado
    await prisma.oAuthState.delete({ where: { state } });

    // Trocar code por access token com Spotify
    Logger.info("🔄 Exchanging code for Spotify access token");
    const tokens = await spotifyAuthService.exchangeCodeForTokens(code);

    if (!tokens || !tokens.accessToken) {
      Logger.error("Failed to exchange code for tokens", null);
      return NextResponse.json(
        { error: "Failed to authenticate with Spotify" },
        { status: 500 }
      );
    }

    // Buscar perfil do usuário no Spotify
    Logger.info("👤 Fetching Spotify user profile");
    const spotifyUser = await spotifyAuthService.getUserProfile(
      tokens.accessToken
    );

    if (!spotifyUser || !spotifyUser.id) {
      Logger.error("Failed to fetch Spotify user profile", null);
      return NextResponse.json(
        { error: "Failed to fetch user profile" },
        { status: 500 }
      );
    }

    Logger.success(`✅ Spotify user fetched: ${spotifyUser.id}`);

    // Procurar ou criar usuário por Spotify ID
    let user = await prisma.user.findFirst({
      where: { spotifyUserId: spotifyUser.id },
    });

    if (!user) {
      Logger.info(`📝 Creating new user with Spotify ID: ${spotifyUser.id}`);
      user = await prisma.user.create({
        data: {
          email: spotifyUser.email || `${spotifyUser.id}@spotify.local`,
          name: spotifyUser.displayName || "Spotify User",
          spotifyUserId: spotifyUser.id,
          spotifyAccessToken: tokens.accessToken,
          spotifyRefreshToken: tokens.refreshToken || null,
          spotifyTokenExpiry: new Date(
            Date.now() + (tokens.expiresIn || 3600) * 1000
          ),
          password: "oauth", // Usuários OAuth não têm senha
        },
      });
      Logger.success(`✅ New user created: ${user.id}`);
    } else {
      Logger.info(`✅ Existing user found: ${user.id}`);
      // Atualizar tokens
      await prisma.user.update({
        where: { id: user.id },
        data: {
          spotifyAccessToken: tokens.accessToken,
          spotifyRefreshToken: tokens.refreshToken || undefined,
          spotifyTokenExpiry: new Date(
            Date.now() + (tokens.expiresIn || 3600) * 1000
          ),
        },
      });
      Logger.info("💾 Spotify tokens updated");
    }

    Logger.success("✅ Spotify tokens stored");

    // Gerar JWT próprio
    Logger.info("🔐 Generating JWT token");
    const jwtToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        spotifyId: user.spotifyUserId,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    Logger.success("✅ JWT generated");

    // Redirecionar para frontend com token
    const redirectUrl = new URL(`${FRONTEND_URL}/dashboard`);
    redirectUrl.searchParams.set("token", jwtToken);
    redirectUrl.searchParams.set("user_id", user.id);
    redirectUrl.searchParams.set("spotify_id", user.spotifyUserId || "");

    Logger.success(`✅ OAuth flow completed successfully for user ${user.id}`);

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    Logger.error("OAuth callback error", error);

    // Redirecionar para frontend com erro
    const errorUrl = new URL(`${FRONTEND_URL}/login`);
    errorUrl.searchParams.set(
      "error",
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.redirect(errorUrl);
  }
}

export async function POST(request: NextRequest) {
  // Spotify usa GET para callback, mas por segurança também aceitamos POST
  return GET(request);
}
