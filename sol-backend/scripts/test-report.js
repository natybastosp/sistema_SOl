const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testReport() {
  try {
    console.log('🧪 Testando sistema de relatórios...');
    
    const totalMusics = await prisma.music.count();
    console.log(`✓ Total de músicas: ${totalMusics}`);
    
    const genreStats = await prisma.music.groupBy({
      by: ['genre'],
      _count: { genre: true },
      orderBy: { _count: { genre: 'desc' } }
    });
    
    console.log('🎼 Distribuição por gêneros:');
    genreStats.slice(0, 10).forEach(genre => {
      console.log(`   ${genre.genre}: ${genre._count.genre} músicas`);
    });
    
    console.log('✅ Sistema de relatórios funcionando perfeitamente!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testReport();
