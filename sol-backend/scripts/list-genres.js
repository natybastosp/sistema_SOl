const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function listGenres() {
  console.log("🎭 Listando todos os gêneros musicais...\n");

  try {
    // Buscar todos os gêneros únicos com contagem
    const genresWithCount = await prisma.music.groupBy({
      by: ["genre"],
      _count: {
        genre: true,
      },
      orderBy: {
        _count: {
          genre: "desc",
        },
      },
    });

    console.log(`📊 Total de gêneros encontrados: ${genresWithCount.length}\n`);

    console.log("🎵 Lista completa de gêneros (ordenado por quantidade):");
    console.log("=".repeat(60));

    genresWithCount.forEach((genreData, index) => {
      const position = `${index + 1}`.padStart(3, " ");
      const count = `${genreData._count.genre}`.padStart(5, " ");
      console.log(
        `${position}. ${genreData.genre.padEnd(30)} | ${count} músicas`
      );
    });

    console.log("=".repeat(60));

    // Estatísticas adicionais
    const totalMusics = genresWithCount.reduce(
      (sum, genre) => sum + genre._count.genre,
      0
    );
    const avgMusicsPerGenre = (totalMusics / genresWithCount.length).toFixed(1);

    console.log(`\n📈 Estatísticas:`);
    console.log(`   Total de músicas: ${totalMusics}`);
    console.log(`   Média por gênero: ${avgMusicsPerGenre} músicas`);

    // Top 5 gêneros
    console.log(`\n🏆 Top 5 gêneros mais populares:`);
    genresWithCount.slice(0, 5).forEach((genre, index) => {
      console.log(
        `   ${index + 1}. ${genre.genre} (${genre._count.genre} músicas)`
      );
    });

    // Gêneros com poucas músicas (menos de 10)
    const rareGenres = genresWithCount.filter((g) => g._count.genre < 10);
    if (rareGenres.length > 0) {
      console.log(`\n🔍 Gêneros com poucas músicas (< 10):`);
      rareGenres.forEach((genre) => {
        console.log(
          `   ${genre.genre} (${genre._count.genre} ${
            genre._count.genre === 1 ? "música" : "músicas"
          })`
        );
      });
    }

    // Apenas lista dos nomes (para fácil cópia)
    console.log(`\n📋 Lista simples dos gêneros (para copiar):`);
    const genreNames = genresWithCount.map((g) => g.genre);
    console.log(genreNames.join(", "));

    // Array para usar no código
    console.log(`\n💻 Array para usar no código:`);
    console.log(`const genres = ${JSON.stringify(genreNames, null, 2)};`);
  } catch (error) {
    console.error("❌ Erro ao buscar gêneros:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

listGenres();
