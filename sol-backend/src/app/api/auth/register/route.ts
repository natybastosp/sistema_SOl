import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyPassword,
  generateToken,
  removePasswordFromUser,
  isValidEmail,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Extrair dados do corpo da requisição
    const body = await request.json();
    const { email, password } = body;

    // Validações básicas
    if (!email || !password) {
      return createErrorResponse("Email e senha são obrigatórios");
    }

    // Validar formato do email
    if (!isValidEmail(email)) {
      return createErrorResponse("Formato de email inválido");
    }

    // Buscar usuário no banco
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return createErrorResponse("Credenciais inválidas", 401);
    }

    // Verificar senha
    const passwordMatch = await verifyPassword(password, user.password);
    if (!passwordMatch) {
      return createErrorResponse("Credenciais inválidas", 401);
    }

    // Remover senha do objeto
    const userWithoutPassword = removePasswordFromUser(user);

    // Gerar token JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    // Atualizar timestamp de último login (opcional)
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() },
    });

    // Logs para debug
    console.log(`✅ Login realizado: ${user.email}`);

    // Retornar sucesso com token e dados do usuário
    return createSuccessResponse(
      {
        user: userWithoutPassword,
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      },
      "Login realizado com sucesso"
    );
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return createErrorResponse("Erro interno do servidor", 500);
  }
}

// Método GET para informações sobre o endpoint
export async function GET() {
  return createSuccessResponse(
    {
      endpoint: "/api/auth/login",
      method: "POST",
      description: "Autenticar usuário existente",
      requiredFields: ["email", "password"],
      example: {
        email: "naty@exemplo.com",
        password: "123456",
      },
      response: {
        user: "Dados do usuário (sem senha)",
        token: "JWT token para autenticação",
        expiresIn: "Tempo de expiração do token",
      },
    },
    "Informações do endpoint de login"
  );
}
