/**
 * Classe base para erros da aplicação
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Erro de validação (400)
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(400, message, details);
    this.name = "ValidationError";
  }
}

/**
 * Erro de autenticação (401)
 */
export class AuthError extends AppError {
  constructor(message: string = "Não autenticado") {
    super(401, message);
    this.name = "AuthError";
  }
}

/**
 * Erro de permissão (403)
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "Acesso negado") {
    super(403, message);
    this.name = "ForbiddenError";
  }
}

/**
 * Erro de recurso não encontrado (404)
 */
export class NotFoundError extends AppError {
  constructor(message: string = "Recurso não encontrado") {
    super(404, message);
    this.name = "NotFoundError";
  }
}

/**
 * Erro de conflito (409)
 */
export class ConflictError extends AppError {
  constructor(message: string = "Conflito") {
    super(409, message);
    this.name = "ConflictError";
  }
}

/**
 * Erro de limite de taxa (429)
 */
export class RateLimitError extends AppError {
  constructor(message: string = "Muitas requisições") {
    super(429, message);
    this.name = "RateLimitError";
  }
}

/**
 * Erro interno do servidor (500)
 */
export class InternalServerError extends AppError {
  constructor(message: string = "Erro interno do servidor") {
    super(500, message);
    this.name = "InternalServerError";
  }
}
