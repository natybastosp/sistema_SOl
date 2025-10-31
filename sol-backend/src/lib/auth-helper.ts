import { NextRequest } from "next/server";
import { extractTokenFromHeader, verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AuthError } from "@/lib/errors";

/**
 * Extrair usuário autenticado do request
 */
export async function getUserFromRequest(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      throw new AuthError("Token não fornecido");
    }

    const payload = verifyToken(token);
    if (!payload) {
      throw new AuthError("Token inválido");
    }

    // Buscar usuário no banco
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new AuthError("Usuário não encontrado");
    }

    return user;
  } catch (error) {
    if (error instanceof AuthError) throw error;
    throw new AuthError("Autenticação falhou");
  }
}
