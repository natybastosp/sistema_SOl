import { NextRequest, NextResponse } from "next/server";
import { RateLimitError } from "@/lib/errors";

/**
 * Sistema de Rate Limiting em memória
 * Nota: Para produção, use Redis
 */
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const requestCounts = new Map<string, RateLimitRecord>();

/**
 * Middleware de Rate Limiting
 * @param maxRequests Número máximo de requisições
 * @param windowMs Janela de tempo em milissegundos
 */
export function rateLimit(maxRequests: number = 100, windowMs: number = 60000) {
  return (request: NextRequest) => {
    // Pegar IP do cliente
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const now = Date.now();
    const current = requestCounts.get(ip);

    // Se não existe ou expirou a janela
    if (!current || now > current.resetTime) {
      requestCounts.set(ip, {
        count: 1,
        resetTime: now + windowMs,
      });
      return null;
    }

    // Se ultrapassou o limite
    if (current.count >= maxRequests) {
      return NextResponse.json(
        {
          success: false,
          error: "Muitas requisições, tente novamente mais tarde",
          retryAfter: Math.ceil((current.resetTime - now) / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((current.resetTime - now) / 1000)),
          },
        }
      );
    }

    // Incrementar contador
    current.count++;
    return null;
  };
}

/**
 * Aplicar rate limit em um endpoint
 */
export function createRateLimiter(
  maxRequests: number = 100,
  windowMs: number = 60000
) {
  return rateLimit(maxRequests, windowMs);
}
