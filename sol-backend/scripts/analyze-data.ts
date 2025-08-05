import * as fs from "fs-extra";
import csv from "csv-parser";
import * as path from "path";

// Função para ler e analisar CSV
function analyzeCSV(filePath: string, fileName: string): Promise<void> {
  return new Promise((resolve) => {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ Arquivo não encontrado: ${fileName}`);
      resolve();
      return;
    }

    const results: any[] = [];
    let headers: string[] = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("headers", (headerList) => {
        headers = headerList;
      })
      .on("data", (data) => {
        results.push(data);
      })
      .on("end", () => {
        console.log(`\n📊 Análise do arquivo: ${fileName}`);
        console.log(`📄 Total de registros: ${results.length}`);
        console.log(`📋 Colunas (${headers.length}):`);
        headers.forEach((header, index) => {
          console.log(`  ${index + 1}. ${header}`);
        });

        // Mostrar exemplo de dados
        if (results.length > 0) {
          console.log(`\n🔍 Exemplo de dados (primeiro registro):`);
          Object.entries(results[0]).forEach(([key, value]) => {
            const displayValue =
              typeof value === "string" && value.length > 50
                ? value.substring(0, 50) + "..."
                : value;
            console.log(`  ${key}: ${displayValue}`);
          });
        }

        // Verificar Spotify IDs se aplicável
        if (fileName.includes("original") || fileName.includes("perifericas")) {
          const spotifyIdColumn = fileName.includes("original")
            ? "Spotify ID"
            : "ID do Spotify";
          const spotifyIds = results
            .map((r) => r[spotifyIdColumn])
            .filter((id) => id && id.trim() !== "");

          console.log(
            `\n🎵 Spotify IDs válidos: ${spotifyIds.length}/${results.length}`
          );
        }

        resolve();
      })
      .on("error", (error) => {
        console.error(`❌ Erro ao ler ${fileName}:`, error.message);
        resolve();
      });
  });
}

async function main() {
  console.log("🔍 Analisando arquivos CSV...\n");

  const dataPath = path.join(process.cwd(), "data");

  if (!fs.existsSync(dataPath)) {
    console.log('❌ Pasta "data" não encontrada!');
    console.log(
      "💡 Certifique-se de que os arquivos CSV estão em: sol-backend/data/"
    );
    return;
  }

  const files = [
    {
      name: "emotion_music_data.csv",
      path: path.join(dataPath, "emotion_music_data.csv"),
    },
    {
      name: "emotion_music_data_original.csv",
      path: path.join(dataPath, "emotion_music_data_original.csv"),
    },
    {
      name: "musicas_perifericas.csv",
      path: path.join(dataPath, "musicas_perifericas.csv"),
    },
  ];

  for (const file of files) {
    await analyzeCSV(file.path, file.name);
  }

  console.log("\n✅ Análise concluída!");
  console.log("\n💡 Para executar o seed dos dados, use: npm run db:seed");
}

main().catch(console.error);
