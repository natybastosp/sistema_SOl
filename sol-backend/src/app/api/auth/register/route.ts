import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  generateToken,
  removePasswordFromUser,
  isValidEmail,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, musicPreferences } = body;

    // Validações
    if (!name || !email || !password) {
      return createErrorResponse("Nome, email e senha são obrigatórios");
    }

    if (!isValidEmail(email)) {
      return createErrorResponse("Formato de email inválido");
    }

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return createErrorResponse("Usuário já existe", 409);
    }

    // Hash da senha e criar usuário
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        musicPreferences: musicPreferences || [],
      },
    });

    const userWithoutPassword = removePasswordFromUser(user);
    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    return createSuccessResponse(
      {
        user: userWithoutPassword,
        token,
        expiresIn: "7d",
      },
      "Usuário registrado com sucesso"
    );
  } catch (error) {
    console.error("Erro ao registrar:", error);
    return createErrorResponse("Erro interno do servidor", 500);
  }
}
