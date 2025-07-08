import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Configurações JWT
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Interface para o payload do JWT
export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

// Interface para usuário sem senha
export interface UserWithoutPassword {
  id: string;
  email: string;
  name: string;
  musicPreferences: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Gerar hash da senha
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Verificar senha
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * Gerar token JWT
 */
export function generateToken(
  payload: Omit<JWTPayload, "iat" | "exp">
): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verificar e decodificar token JWT
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    return null;
  }
}

/**
 * Extrair token do header Authorization
 */
export function extractTokenFromHeader(
  authHeader: string | null
): string | null {
  if (!authHeader) return null;

  // Formato esperado: "Bearer TOKEN_AQUI"
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
}

/**
 * Remover senha do objeto usuário
 */
export function removePasswordFromUser(user: any): UserWithoutPassword {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Validar formato de email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validar força da senha
 */
export function isValidPassword(password: string): {
  valid: boolean;
  message?: string;
} {
  if (password.length < 6) {
    return { valid: false, message: "Senha deve ter pelo menos 6 caracteres" };
  }

  if (password.length > 100) {
    return {
      valid: false,
      message: "Senha muito longa (máximo 100 caracteres)",
    };
  }

  // Verificar se tem pelo menos uma letra e um número
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  if (!hasLetter || !hasNumber) {
    return {
      valid: false,
      message: "Senha deve conter pelo menos uma letra e um número",
    };
  }

  return { valid: true };
}

/**
 * Criar resposta de erro padronizada
 */
export function createErrorResponse(message: string, status: number = 400) {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  );
}

/**
 * Criar resposta de sucesso padronizada
 */
export function createSuccessResponse(data: any, message?: string) {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
