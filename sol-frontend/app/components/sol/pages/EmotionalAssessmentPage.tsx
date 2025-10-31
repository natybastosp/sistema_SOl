import { useState } from "react";
import { Button } from "~/components/ui/button";
import Header from "../Header";
import SunLogo from "../SunLogo";
import type { UserData } from "~/types/sol";
import { PAGES } from "~/constants/sol";
import { EmotionalService } from "~/services/emotionalService";

interface EmotionalAssessmentPageProps {
  userData: UserData;
  setUserData: (userData: UserData | ((prev: UserData) => UserData)) => void;
  setCurrentPage: (page: string) => void;
  onPlaylistGenerated?: (playlist: any) => void;
}

interface EmocaoSlider {
  id: "sadness" | "joy" | "anger" | "fear";
  label: string;
  descricao: string;
  icone: string;
}

const emocoes: EmocaoSlider[] = [
  {
    id: "sadness",
    label: "Tristeza",
    descricao: "Como você se sente em relação à tristeza?",
    icone: "😢",
  },
  {
    id: "joy",
    label: "Alegria",
    descricao: "Qual é seu nível de alegria neste momento?",
    icone: "😊",
  },
  {
    id: "anger",
    label: "Raiva",
    descricao: "Como está seu nível de raiva?",
    icone: "😠",
  },
  {
    id: "fear",
    label: "Medo",
    descricao: "Qual é seu nível de medo ou ansiedade?",
    icone: "😨",
  },
];

export default function EmotionalAssessmentPage({
  userData,
  setUserData,
  setCurrentPage,
  onPlaylistGenerated,
}: EmotionalAssessmentPageProps) {
  // Estados das 4 emoções
  const [emocoes_valores, setEmocoes_valores] = useState<
    Record<string, number>
  >({
    sadness: 5,
    joy: 5,
    anger: 5,
    fear: 5,
  });

  const [selectedGenre, setSelectedGenre] = useState<string>(
    userData.preferences?.[0] || ""
  );

  // Estados de carregamento e erro
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [showResults, setShowResults] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Gêneros disponíveis
  const genres = ["rock", "mpb", "samba", "funk", "rap"];

  const handleSliderChange = (id: string, valor: number) => {
    setEmocoes_valores((prev) => ({
      ...prev,
      [id]: valor,
    }));
  };

  /**
   * 🎯 Gerar Recomendação com Sistema Fuzzy (4 emoções)
   */
  const handleGeneratePlaylist = async () => {
    setIsGenerating(true);
    setError(undefined);
    setShowResults(false);

    try {
      console.log("🎵 Gerando playlist com análise fuzzy...");
      console.log("   Emoções:", emocoes_valores);
      console.log("   Gênero Preferido:", selectedGenre || "Todos");

      // Chamar serviço de análise emocional COM TODAS AS 4 EMOÇÕES
      const result = await EmotionalService.analyzeWithFuzzy({
        sadness: emocoes_valores.sadness,
        joy: emocoes_valores.joy,
        anger: emocoes_valores.anger,
        fear: emocoes_valores.fear,
        generoPreferido: selectedGenre || undefined,
      });

      if (result.success && result.data) {
        console.log("✅ Análise gerada com sucesso!");
        console.log("   Intenção:", result.data.fuzzyAnalysis.intencao);
        console.log("   Confiança:", result.data.fuzzyAnalysis.confianca);
        console.log("   Músicas:", result.data.playlist.length);

        // Salvar resultado
        setAnalysisResult(result.data);
        setShowResults(true);

        // Salvar playlist no estado global
        if (onPlaylistGenerated) {
          onPlaylistGenerated(result.data);
        }

        // Aguardar 2 segundos antes de navegar
        setTimeout(() => {
          setCurrentPage(PAGES.PLAYLIST);
        }, 2000);
      } else {
        setError(result.error || "Erro ao gerar recomendação");
      }
    } catch (err) {
      console.error("❌ Erro:", err);
      setError("Erro de conexão. Verifique se o backend está rodando.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header pageTitle="Análise Emocional" />

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          {/* Logo e Título */}
          <div className="text-center mb-8">
            <SunLogo size="large" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Como você está se sentindo?
            </h2>
            <p className="text-gray-600">
              Vou usar inteligência artificial para criar uma playlist perfeita
              para você
            </p>
          </div>

          {/* Card Principal */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            {!showResults ? (
              <>
                {/* Título */}
                <h3 className="text-lg font-semibold mb-6 text-gray-800">
                  📊 Avalie seu estado emocional
                </h3>

                {/* 4 Sliders de Emoção */}
                <div className="space-y-8 mb-8">
                  {emocoes.map((emocao) => (
                    <div key={emocao.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-3xl">{emocao.icone}</span>
                          <div>
                            <label className="text-base font-semibold text-gray-700">
                              {emocao.label}
                            </label>
                            <p className="text-sm text-gray-500">
                              {emocao.descricao}
                            </p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-blue-600 min-w-12 text-right">
                          {emocoes_valores[emocao.id]}
                        </span>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={emocoes_valores[emocao.id]}
                        onChange={(e) =>
                          handleSliderChange(
                            emocao.id,
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        disabled={isGenerating}
                      />

                      <div className="flex justify-between text-xs text-gray-500 px-1">
                        <span>Nada</span>
                        <span>Bastante</span>
                        <span>Máximo</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Seletor de Gênero */}
                <div className="mb-8">
                  <label className="block text-lg font-medium text-gray-700 mb-4">
                    🎵 Gênero musical preferido (opcional)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Opção "Todos" */}
                    <button
                      onClick={() => setSelectedGenre("")}
                      disabled={isGenerating}
                      className={`px-4 py-3 rounded-lg font-medium transition-all ${
                        selectedGenre === ""
                          ? "bg-orange-400 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Todos
                    </button>

                    {/* Gêneros */}
                    {genres.map((genre) => (
                      <button
                        key={genre}
                        onClick={() => setSelectedGenre(genre)}
                        disabled={isGenerating}
                        className={`px-4 py-3 rounded-lg font-medium transition-all capitalize ${
                          selectedGenre === genre
                            ? "bg-orange-400 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {selectedGenre
                      ? `✓ ${selectedGenre.toUpperCase()} selecionado`
                      : "Nenhum gênero selecionado (todos os gêneros)"}
                  </p>
                </div>

                {/* Mensagem de Erro */}
                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Botão Gerar Playlist */}
                <div className="text-center">
                  <Button
                    onClick={handleGeneratePlaylist}
                    disabled={isGenerating}
                    className="bg-orange-400 text-white px-12 py-4 rounded-lg font-semibold text-lg hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <span className="flex items-center justify-center gap-3">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Analisando com IA...
                      </span>
                    ) : (
                      "🎵 Gerar Playlist Personalizada"
                    )}
                  </Button>
                </div>
              </>
            ) : (
              /* Resultados da Análise */
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">✅</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Playlist Gerada com Sucesso!
                  </h3>
                </div>

                {analysisResult && (
                  <div className="space-y-4 mb-6">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <p className="text-sm text-orange-700 font-medium mb-1">
                        Intenção da Playlist
                      </p>
                      <p className="text-xl font-bold text-orange-900 capitalize">
                        {analysisResult.analysis.intencaoPlaylist}
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-700 font-medium mb-1">
                        Confiança da IA
                      </p>
                      <p className="text-xl font-bold text-blue-900">
                        {(analysisResult.analysis.grauConfianca * 100).toFixed(
                          1
                        )}
                        %
                      </p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-700 font-medium mb-1">
                        Músicas Selecionadas
                      </p>
                      <p className="text-xl font-bold text-green-900">
                        {analysisResult.playlist.length} músicas
                      </p>
                    </div>

                    <p className="text-gray-600 text-sm italic">
                      {analysisResult.analysis.descricao}
                    </p>
                  </div>
                )}

                <p className="text-gray-500 text-sm">
                  Redirecionando para a playlist...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
