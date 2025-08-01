// Teste simples de conexão com banco
console.log('🔍 Testando conexão com banco...');

try {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  async function testConnection() {
    try {
      await prisma.$connect();
      console.log('✅ Conexão estabelecida!');
      
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      console.log('✅ Query executada com sucesso:', result);
      
      const musicCount = await prisma.music.count();
      const userCount = await prisma.user.count();
      console.log(`✅ Tabelas acessíveis - Músicas: ${musicCount}, Usuários: ${userCount}`);
      
      await prisma.$disconnect();
      console.log('✅ Teste de conexão bem-sucedido!');
      
    } catch (error) {
      console.error('❌ Erro:', error.message);
    }
  }

  testConnection();

} catch (error) {
  console.error('❌ Erro ao importar Prisma:', error.message);
}
