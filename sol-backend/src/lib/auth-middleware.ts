import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
}

/**
 * Middleware para verificar autenticação JWT
 * Extrai e valida o token do header Authorization
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<
  | { authenticated: true; user: AuthenticatedUser }
  | { authenticated: false; error: string; status: number }
> {
  try {
    // 1. Extrair token do header Authorization
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return {
        authenticated: false,
        error: "Token de autenticação não fornecido",
        status: 401,
      };
    }

    // 2. Verificar formato "Bearer TOKEN"
    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return {
        authenticated: false,
        error: "Formato de token inválido. Use: Bearer {token}",
        status: 401,
      };
    }

    const token = parts[1];

    // 3. Verificar se JWT_SECRET existe
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error("❌ JWT_SECRET não configurado no .env");
      return {
        authenticated: false,
        error: "Erro de configuração do servidor",
        status: 500,
      };
    }

    // 4. Validar e decodificar token
    let decoded: JWTPayload;

    try {
      decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    } catch (jwtError: any) {
      if (jwtError.name === "TokenExpiredError") {
        return {
          authenticated: false,
          error: "Token expirado. Faça login novamente",
          status: 401,
        };
      }

      return {
        authenticated: false,
        error: "Token inválido",
        status: 401,
      };
    }

    // 5. Buscar usuário no banco
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return {
        authenticated: false,
        error: "Usuário não encontrado",
        status: 401,
      };
    }

    // 6. Retornar usuário autenticado
    return {
      authenticated: true,
      user,
    };
  } catch (error: any) {
    console.error("❌ Erro na autenticação:", error);
    return {
      authenticated: false,
      error: "Erro ao processar autenticação",
      status: 500,
    };
  }
}

/**
 * Helper para retornar resposta de erro não autenticado
 */
export function unauthorizedResponse(message: string, status: number = 401) {
  return new Response(
    JSON.stringify({
      error: message,
      authenticated: false,
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
