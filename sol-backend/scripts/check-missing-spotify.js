const fs = require("fs-extra");
const csv = require("csv-parser");
const path = require("path");

async function checkMissingSpotifyIds() {
  console.log("🔍 Verificando músicas sem Spotify ID...\n");

  const dataPath = path.join(process.cwd(), "data");

  // Ler o arquivo principal de músicas
  const emotionDataPath = path.join(dataPath, "emotion_music_data.csv");
  const musicasPerifericasPath = path.join(dataPath, "musicas_perifericas.csv");

  if (!fs.existsSync(emotionDataPath)) {
    console.log("❌ Arquivo emotion_music_data.csv não encontrado");
    return;
  }

  return new Promise((resolve) => {
    const musicasWithoutSpotifyId = [];
    const musicasWithSpotifyId = [];

    fs.createReadStream(emotionDataPath)
      .pipe(csv())
      .on("data", (data) => {
        const nomeMusica = data["Nome da Música"];
        const artista = data["ID do Artista"] || "Artista Desconhecido";

        if (nomeMusica && nomeMusica.trim()) {
          // Como emotion_music_data não tem Spotify ID, todas são "sem ID"
          musicasWithoutSpotifyId.push({
            nome: nomeMusica.trim(),
            artista: artista.trim(),
            genero: data["Gênero"] || "Desconhecido",
          });
        }
      })
      .on("end", () => {
        console.log(`📊 Análise dos arquivos CSV:`);
        console.log(
          `🎵 Músicas SEM Spotify ID: ${musicasWithoutSpotifyId.length}`
        );

        // Mostrar alguns exemplos
        console.log(`\n🔍 Exemplos de músicas SEM Spotify ID (primeiras 10):`);
        musicasWithoutSpotifyId.slice(0, 10).forEach((musica, index) => {
          console.log(
            `${index + 1}. "${musica.nome}" - ${musica.artista} [${
              musica.genero
            }]`
          );
        });

        console.log(`\n💡 Potencial de expansão:`);
        console.log(
          `   ${musicasWithoutSpotifyId.length} músicas podem ser buscadas na API do Spotify`
        );
        console.log(`   Isso pode dobrar ou triplicar seu catálogo musical!`);

        // Análise por gênero
        const generos = {};
        musicasWithoutSpotifyId.forEach((musica) => {
          generos[musica.genero] = (generos[musica.genero] || 0) + 1;
        });

        console.log(`\n🎭 Distribuição por gênero (sem Spotify ID):`);
        Object.entries(generos)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 8)
          .forEach(([genero, count]) => {
            console.log(`   ${genero}: ${count} músicas`);
          });

        resolve();
      })
      .on("error", (error) => {
        console.error("❌ Erro ao ler arquivo:", error.message);
        resolve();
      });
  });
}

checkMissingSpotifyIds();
