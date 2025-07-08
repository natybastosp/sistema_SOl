import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  generateToken,
  removePasswordFromUser,
  isValidEmail,
  isValidPassword,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Extrair dados do corpo da requisição
    const body = await request.json();
    const { name, email, password, musicPreferences } = body;

    // Validações básicas
    if (!name || !email || !password) {
      return createErrorResponse("Nome, email e senha são obrigatórios");
    }

    // Validar formato do email
    if (!isValidEmail(email)) {
      return createErrorResponse("Formato de email inválido");
    }

    // Validar força da senha
    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      return createErrorResponse(passwordValidation.message!);
    }

    // Validar nome
    if (name.trim().length < 2) {
      return createErrorResponse("Nome deve ter pelo menos 2 caracteres");
    }

    if (name.length > 100) {
      return createErrorResponse("Nome muito longo (máximo 100 caracteres)");
    }

    // Validar preferências musicais (opcional)
    let validatedPreferences: string[] = [];
    if (musicPreferences) {
      if (Array.isArray(musicPreferences)) {
        validatedPreferences = musicPreferences
          .filter((pref) => typeof pref === "string" && pref.trim().length > 0)
          .map((pref) => pref.trim())
          .slice(0, 10); // Máximo 10 preferências
      }
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return createErrorResponse("Email já está em uso", 409);
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password);

    // Criar usuário no banco
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
        musicPreferences: validatedPreferences,
      },
    });

    // Remover senha do objeto retornado
    const userWithoutPassword = removePasswordFromUser(newUser);

    // Gerar token JWT
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });

    // Logs para debug (removível em produção)
    console.log(`✅ Novo usuário registrado: ${newUser.email}`);

    // Retornar sucesso com token e dados do usuário
    return createSuccessResponse(
      {
        user: userWithoutPassword,
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      },
      "Usuário registrado com sucesso"
    );
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);

    // Verificar se é erro de constraint do banco
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return createErrorResponse("Email já está em uso", 409);
    }

    return createErrorResponse("Erro interno do servidor", 500);
  }
}

// Método GET para informações sobre o endpoint
export async function GET() {
  return createSuccessResponse(
    {
      endpoint: "/api/auth/register",
      method: "POST",
      description: "Registrar novo usuário",
      requiredFields: ["name", "email", "password"],
      optionalFields: ["musicPreferences (array)"],
      example: {
        name: "João Silva",
        email: "joao@exemplo.com",
        password: "minhasenha123",
        musicPreferences: ["Rock", "Pop", "MPB"],
      },
    },
    "Informações do endpoint de registro"
  );
}
