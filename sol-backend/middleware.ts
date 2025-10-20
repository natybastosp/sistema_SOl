import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractTokenFromHeader } from "./src/lib/auth";

export async function middleware(request: NextRequest) {
  const startTime = Date.now(); // Para medir tempo de processamento

  const protectedRoutes = [
    "/api/music/recommend", // Recomendações musicais personalizadas
    "/api/emotions", // Análise emocional do usuário
    "/api/user/preferences", // Preferências do usuário
    "/api/profile", // Perfil do usuário
    "/api/auth/spotify", // Iniciar conexão com Spotify
    "/api/playback", // Todos os controles de reprodução
  ];

  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (request.nextUrl.pathname === "/api/auth/spotify/callback") {
    console.log(
      "🔓 Callback do Spotify - rota pública, passando sem autenticação"
    );
    return NextResponse.next(); // Deixa passar sem verificar JWT
  }

  if (!isProtectedRoute) {
    return NextResponse.next(); // Passa direto sem verificar nada
  }

  console.log(`🔐 Verificando autenticação para: ${request.nextUrl.pathname}`);

  const authHeader = request.headers.get("Authorization");
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    console.warn(
      `❌ Token ausente na requisição para: ${request.nextUrl.pathname}`
    );

    return new NextResponse(
      JSON.stringify({
        success: false,
        error: "Token de acesso requerido",
        code: "MISSING_TOKEN",
        message: "Você precisa estar autenticado para acessar este recurso",
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const payload = verifyToken(token);

  if (!payload) {
    console.warn(
      `❌ Token inválido ou expirado para: ${request.nextUrl.pathname}`
    );

    return new NextResponse(
      JSON.stringify({
        success: false,
        error: "Token inválido ou expirado",
        code: "INVALID_TOKEN",
        message: "Faça login novamente para obter um novo token",
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const response = NextResponse.next();

  response.headers.set("X-User-Id", payload.userId.toString());
  response.headers.set("X-User-Email", payload.email);
  response.headers.set("X-User-Name", payload.name);

  const processingTime = Date.now() - startTime;
  console.log(
    `✅ Usuário ${payload.email} (ID: ${payload.userId}) autenticado em ${processingTime}ms para ${request.nextUrl.pathname}`
  );

  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
