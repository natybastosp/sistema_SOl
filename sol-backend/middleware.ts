// middleware.ts (na raiz do projeto)
import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractTokenFromHeader } from "./src/lib/auth";

export async function middleware(request: NextRequest) {
  const startTime = Date.now();

  // Definir rotas que precisam de autenticação automática
  const protectedRoutes = [
    "/api/music/recommend",
    "/api/emotions",
    "/api/user/preferences",
    "/api/profile",
  ];

  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Rotas públicas passam direto
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  console.log(`🔐 Verificando autenticação para: ${request.nextUrl.pathname}`);

  // Verificar token
  const authHeader = request.headers.get("Authorization");
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    console.warn(`❌ Token ausente para: ${request.nextUrl.pathname}`);
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: "Token de acesso requerido",
        code: "MISSING_TOKEN",
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const payload = verifyToken(token);
  if (!payload) {
    console.warn(`❌ Token inválido para: ${request.nextUrl.pathname}`);
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: "Token inválido ou expirado",
        code: "INVALID_TOKEN",
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // Adicionar dados do usuário aos headers da requisição
  const response = NextResponse.next();
  response.headers.set("X-User-Id", payload.userId);
  response.headers.set("X-User-Email", payload.email);
  response.headers.set("X-User-Name", payload.name);

  const processingTime = Date.now() - startTime;
  console.log(
    `✅ ${payload.email} autenticado em ${processingTime}ms para ${request.nextUrl.pathname}`
  );

  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
