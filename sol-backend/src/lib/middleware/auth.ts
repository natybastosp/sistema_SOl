import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyToken,
  extractTokenFromHeader,
  createErrorResponse,
  JWTPayload,
} from "@/lib/auth";

// Interface para request autenticado
export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    name: string;
    musicPreferences: string[];
  };
}

/**
 * Middleware para verificar autenticação
 * Use este middleware em rotas que precisam de autenticação
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ user: any } | Response> {
  try {
    // Extrair token do header Authorization
    const authHeader = request.headers.get("authorization");
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return createErrorResponse("Token de acesso obrigatório", 401);
    }

    // Verificar e decodificar token
    const decoded = verifyToken(token);
    if (!decoded) {
      return createErrorResponse("Token inválido ou expirado", 401);
    }

    // Buscar usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        musicPreferences: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return createErrorResponse("Usuário não encontrado", 401);
    }

    // Retornar dados do usuário
    return { user };
  } catch (error) {
    console.error("Erro no middleware de autenticação:", error);
    return createErrorResponse("Erro interno de autenticação", 500);
  }
}

/**
 * Middleware opcional - não retorna erro se não autenticado
 * Útil para rotas que funcionam com ou sem autenticação
 */
export async function optionalAuth(
  request: NextRequest
): Promise<{ user: any | null }> {
  try {
    const authHeader = request.headers.get("authorization");
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return { user: null };
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return { user: null };
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        musicPreferences: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { user: user || null };
  } catch (error) {
    console.error("Erro no middleware de autenticação opcional:", error);
    return { user: null };
  }
}

/**
 * Função helper para usar em API routes
 * Retorna o usuário autenticado ou lança erro
 */
export async function getAuthenticatedUser(request: NextRequest) {
  const result = await requireAuth(request);

  if (result instanceof Response) {
    // É uma resposta de erro
    throw new Error("Usuário não autenticado");
  }

  return result.user;
}

/**
 * Validar se o usuário tem permissão para acessar recurso
 * (Extensível para futuras implementações de roles/permissões)
 */
export function hasPermission(
  user: any,
  resource: string,
  action: string
): boolean {
  // Por enquanto, todos os usuários autenticados têm acesso a tudo
  // No futuro, pode implementar sistema de roles aqui

  // Usuário pode sempre acessar seus próprios recursos
  if (resource === "own_data") {
    return true;
  }

  // Exemplos de permissões futuras:
  // if (user.role === 'admin') return true
  // if (resource === 'music' && action === 'read') return true

  return true;
}
