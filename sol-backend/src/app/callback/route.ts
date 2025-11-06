/**
 * GET /callback
 * Rota simplificada de callback do Spotify
 * Redireciona para a rota real em /api/spotify/auth/callback-v2
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Pega os parâmetros do Spotify
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // Redireciona para a rota real passando os parâmetros
  const callbackUrl = new URL("/api/spotify/auth/callback-v2", request.url);

  if (code) callbackUrl.searchParams.set("code", code);
  if (state) callbackUrl.searchParams.set("state", state);
  if (error) callbackUrl.searchParams.set("error", error);

  return NextResponse.redirect(callbackUrl.toString());
}
