const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log("🔍 Verificando dados no banco...\n");

  try {
    // Testar conexão primeiro
    await prisma.$connect();
    console.log("✅ Conexão com banco estabelecida");

    // Contar registros em cada tabela
    const musicCount = await prisma.music.count();
    const userCount = await prisma.user.count();
    const emotionalStateCount = await prisma.emotionalState.count();
    const playlistCount = await prisma.playlist.count();
    const feedbackCount = await prisma.feedback.count();

    console.log("\n📊 Resumo das tabelas:");
    console.log(`🎵 Músicas: ${musicCount}`);
    console.log(`👥 Usuários: ${userCount}`);
    console.log(`😊 Estados emocionais: ${emotionalStateCount}`);
    console.log(`📋 Playlists: ${playlistCount}`);
    console.log(`💬 Feedbacks: ${feedbackCount}`);

    if (musicCount > 0) {
      // Mostrar exemplos de músicas
      console.log("\n🎵 Primeiras 5 músicas:");
      const sampleMusics = await prisma.music.findMany({
        take: 5,
        select: {
          name: true,
          artist: true,
          genre: true,
          joyScore: true,
          sadnessScore: true,
        },
      });

      sampleMusics.forEach((music, index) => {
        console.log(`${index + 1}. ${music.name} - ${music.artist}`);
        console.log(
          `   Gênero: ${music.genre} | Alegria: ${music.joyScore} | Tristeza: ${music.sadnessScore}`
        );
      });

      // Mostrar gêneros disponíveis
      console.log("\n🎭 Top 10 gêneros musicais:");
      const genres = await prisma.music.groupBy({
        by: ["genre"],
        _count: {
          genre: true,
        },
        orderBy: {
          _count: {
            genre: "desc",
          },
        },
        take: 10,
      });

      genres.forEach((genre) => {
        console.log(`  ${genre.genre}: ${genre._count.genre} músicas`);
      });
    } else {
      console.log("\n⚠️  Nenhuma música encontrada no banco!");
      console.log("💡 Execute: npm run db:seed");
    }

    if (userCount > 0) {
      // Mostrar usuários (sem _count que estava causando erro)
      console.log("\n👥 Usuários cadastrados:");
      const users = await prisma.user.findMany({
        select: {
          name: true,
          email: true,
          musicPreferences: true,
          createdAt: true,
        },
      });

      // Buscar contagem de estados emocionais separadamente
      for (const user of users) {
        const emotionalStatesCount = await prisma.emotionalState.count({
          where: { userId: user.id },
        });

        console.log(`  ${user.name} (${user.email})`);
        console.log(`    Preferências: ${user.musicPreferences.join(", ")}`);
        console.log(`    Estados emocionais: ${emotionalStatesCount}`);
        console.log(
          `    Criado em: ${user.createdAt.toLocaleDateString("pt-BR")}`
        );
      }
    } else {
      console.log("\n👥 Nenhum usuário cadastrado ainda");
    }

    // Mostrar último estado emocional se existir
    if (emotionalStateCount > 0) {
      console.log("\n😊 Último estado emocional registrado:");
      const lastEmotion = await prisma.emotionalState.findFirst({
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { name: true },
          },
        },
      });

      if (lastEmotion) {
        console.log(`  Usuário: ${lastEmotion.user.name}`);
        console.log(
          `  Tristeza: ${lastEmotion.sadness} | Alegria: ${lastEmotion.joy}`
        );
        console.log(
          `  Raiva: ${lastEmotion.anger} | Medo: ${lastEmotion.fear} | Surpresa: ${lastEmotion.surprise}`
        );
        console.log(`  Data: ${lastEmotion.createdAt.toLocaleString("pt-BR")}`);
      }
    }

    console.log("\n✅ Verificação do banco concluída!");
  } catch (error) {
    console.error("\n❌ Erro ao verificar banco:", error.message);

    if (error.code === "P1001") {
      console.log("\n💡 Dicas para resolver:");
      console.log("1. Verificar se PostgreSQL está rodando: npm run docker:up");
      console.log("2. Verificar se as tabelas existem: npm run db:push");
      console.log("3. Verificar URL do banco no arquivo .env");
    }

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
