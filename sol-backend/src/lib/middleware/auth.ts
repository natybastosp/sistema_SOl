// lib/middleware/auth.ts (versão melhorada)
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyToken,
  extractTokenFromHeader,
  createErrorResponse,
  JWTPayload,
} from "@/lib/auth";

// Cache simples em memória para evitar consultas desnecessárias ao banco
const userCache = new Map<string, { user: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Interface melhorada para request autenticado
export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    name: string;
    musicPreferences: string[];
  };
}

/**
 * Middleware otimizado para verificar autenticação
 * Agora com cache para reduzir consultas ao banco
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ user: any } | Response> {
  try {
    // Extrair token do header Authorization
    const authHeader = request.headers.get("authorization");
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      console.warn(
        `Tentativa de acesso sem token à rota: ${request.nextUrl?.pathname}`
      );
      return createErrorResponse("Token de acesso obrigatório", 401);
    }

    // Verificar e decodificar token
    const decoded = verifyToken(token);
    if (!decoded) {
      console.warn(
        `Token inválido usado na rota: ${request.nextUrl?.pathname}`
      );
      return createErrorResponse("Token inválido ou expirado", 401);
    }

    // Verificar cache primeiro para evitar consulta desnecessária ao banco
    const cacheKey = decoded.userId;
    const cached = userCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`✅ Usuário ${decoded.email} autenticado via cache`);
      return { user: cached.user };
    }

    // Se não está em cache ou expirou, buscar no banco
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
      console.warn(`Usuário não encontrado no banco: ${decoded.userId}`);
      return createErrorResponse("Usuário não encontrado", 401);
    }

    // Atualizar cache
    userCache.set(cacheKey, { user, timestamp: Date.now() });

    console.log(`✅ Usuário ${user.email} autenticado via banco de dados`);
    return { user };
  } catch (error) {
    console.error("Erro no middleware de autenticação:", error);
    return createErrorResponse("Erro interno de autenticação", 500);
  }
}

/**
 * Versão mais segura e clara da função helper
 * Agora com melhor tratamento de erros
 */
export async function getAuthenticatedUser(request: NextRequest) {
  const result = await requireAuth(request);

  // Verificação de tipo mais robusta
  if (result instanceof Response) {
    // É uma resposta de erro - extrair a mensagem para melhor debugging
    const errorText = await result.text();
    console.error(`Falha na autenticação: ${errorText}`);
    throw new Error("Usuário não autenticado");
  }

  return result.user;
}

/**
 * Nova função: verificação leve de token sem consulta ao banco
 * Útil para verificações frequentes onde você só precisa do userId
 */
export function verifyTokenOnly(request: NextRequest): JWTPayload | null {
  try {
    const authHeader = request.headers.get("authorization");
    const token = extractTokenFromHeader(authHeader);

    if (!token) return null;

    return verifyToken(token);
  } catch (error) {
    console.error("Erro na verificação simples de token:", error);
    return null;
  }
}

/**
 * Middleware específico para rotas que lidam com dados emocionais sensíveis
 * Adiciona verificações extras de segurança
 */
export async function requireAuthForSensitiveData(
  request: NextRequest
): Promise<{ user: any } | Response> {
  // Primeiro, fazer a verificação normal
  const authResult = await requireAuth(request);

  if (authResult instanceof Response) {
    return authResult; // Retornar erro se não autenticado
  }

  // Verificações adicionais para dados sensíveis
  const decoded = verifyTokenOnly(request);

  if (!decoded) {
    return createErrorResponse(
      "Falha na verificação de segurança adicional",
      401
    );
  }

  // Verificar se o token não está muito próximo do vencimento
  // Para dados emocionais, queremos tokens "frescos"
  const now = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = (decoded.exp || 0) - now;

  if (timeUntilExpiry < 300) {
    // Menos de 5 minutos restantes
    console.warn(
      `Token próximo do vencimento para dados sensíveis: ${decoded.email}`
    );
    return createErrorResponse(
      "Token próximo do vencimento. Faça login novamente para acessar dados sensíveis.",
      401
    );
  }

  console.log(`✅ Acesso autorizado a dados sensíveis para: ${decoded.email}`);
  return authResult;
}

/**
 * Middleware opcional - não retorna erro se não autenticado
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
 * Validar se o usuário tem permissão para acessar recurso
 */
export function hasPermission(
  user: any,
  resource: string,
  action: string
): boolean {
  // Por enquanto, todos os usuários autenticados têm acesso a tudo
  if (resource === "own_data") {
    return true;
  }
  return true;
}

// Manter suas funções existentes para compatibilidade
//export { optionalAuth, hasPermission };
