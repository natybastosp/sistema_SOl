import { PrismaClient } from "@prisma/client";

// Implementação singleton do Prisma para evitar múltiplas conexões
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Função para conectar e verificar saúde do banco
export async function connectToDatabase() {
  try {
    await prisma.$connect();
    console.log("✅ Conectado ao banco de dados PostgreSQL via Docker");
    return true;
  } catch (error) {
    console.error("❌ Erro ao conectar com banco de dados:", error);
    return false;
  }
}

// Função para desconectar (útil em testes)
export async function disconnectFromDatabase() {
  await prisma.$disconnect();
}
