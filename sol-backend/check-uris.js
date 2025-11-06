const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const withUri = await prisma.music.count({ where: { spotifyUri: { not: null } } });
  const withoutUri = await prisma.music.count({ where: { spotifyUri: null } });
  const total = await prisma.music.count();
  
  console.log(`Total: ${total}`);
  console.log(`Com spotifyUri: ${withUri}`);
  console.log(`Sem spotifyUri: ${withoutUri}`);
  console.log(`Taxa: ${((withUri / total) * 100).toFixed(1)}%`);
}

main().then(() => process.exit(0));
