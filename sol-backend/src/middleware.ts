import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // 1. Criar resposta
  const response = NextResponse.next();

  // 2. Obter origem do request
  const origin = request.headers.get("origin");

  // 3. Lista de origens permitidas
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:5173",
  ];

  // 4. Verificar se a origem está permitida
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  // 5. Headers CORS necessários
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );

  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );

  response.headers.set("Access-Control-Allow-Credentials", "true");

  // 6. Duração do preflight cache (24 horas)
  response.headers.set("Access-Control-Max-Age", "86400");

  // 7. Tratar requisições OPTIONS (preflight)
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: response.headers,
    });
  }

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
