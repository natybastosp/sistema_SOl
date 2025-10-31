import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";
import { ZodError } from "zod";

/**
 * Middleware global de tratamento de erros
 */
export function errorHandler(error: any) {
  console.error("❌ Error Handler:", error);

  // Se for AppError customizado
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error.details,
      },
      { status: error.statusCode }
    );
  }

  // Se for erro de validação Zod
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: "Dados inválidos",
        details: error.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      },
      { status: 400 }
    );
  }

  // Se for erro de JWT
  if (error.name === "JsonWebTokenError") {
    return NextResponse.json(
      {
        success: false,
        error: "Token inválido",
      },
      { status: 401 }
    );
  }

  // Se for erro de Prisma
  if (error.code === "P2002") {
    return NextResponse.json(
      {
        success: false,
        error: "Registro duplicado",
        details: { field: error.meta?.target?.[0] },
      },
      { status: 409 }
    );
  }

  if (error.code === "P2025") {
    return NextResponse.json(
      {
        success: false,
        error: "Recurso não encontrado",
      },
      { status: 404 }
    );
  }

  // Erro genérico
  return NextResponse.json(
    {
      success: false,
      error: "Erro interno do servidor",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    },
    { status: 500 }
  );
}
