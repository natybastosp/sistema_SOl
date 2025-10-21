import { useState } from "react";
import { Button } from "~/components/ui/button";
import Header from "../Header";
import SunLogo from "../SunLogo";
import type { UserData } from "~/types/sol";
import { PAGES } from "~/constants/sol";
import { RecommendationService } from "~/services/recommendationService";

interface EmotionalAssessmentPageProps {
  userData: UserData;
  setUserData: (userData: UserData | ((prev: UserData) => UserData)) => void;
  setCurrentPage: (page: string) => void;
  onPlaylistGenerated?: (playlist: any) => void;
}

export default function EmotionalAssessmentPage({
  userData,
  setUserData,
  setCurrentPage,
  onPlaylistGenerated,
}: EmotionalAssessmentPageProps) {
  // Estado emocional (0-10)
  const [emotionalState, setEmotionalState] = useState(5);
  const [selectedGenre, setSelectedGenre] = useState<string>(
    userData.preferences?.[0] || ""
  );

  // Estados de carregamento e erro
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [showResults, setShowResults] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Gêneros disponíveis
  const genres = [
    "rock",
    "mpb",
    "sertanejo",
    "samba",
    "funk",
    "rap",
    "funk carioca",
    "trilha sonora",
  ];

  /**
   * 🎯 Gerar Recomendação com Sistema Fuzzy
   */
  const handleGeneratePlaylist = async () => {
    setIsGenerating(true);
    setError(undefined);
    setShowResults(false);

    try {
      console.log("🎵 Gerando playlist...");
      console.log("   Estado Emocional:", emotionalState);
      console.log("   Gênero Preferido:", selectedGenre || "Todos");

      // Chamar API de recomendação
      const result = await RecommendationService.generateRecommendation({
        estadoEmocional: emotionalState,
        generoPreferido: selectedGenre || undefined,
        limit: 10,
      });

      if (result.success && result.data) {
        console.log("✅ Playlist gerada com sucesso!");
        console.log("   Intenção:", result.data.analysis.intencaoPlaylist);
        console.log("   Confiança:", result.data.analysis.grauConfianca);
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

  /**
   * 🎨 Obter cor baseada no estado emocional
   */
  const getEmotionColor = (value: number) => {
    if (value <= 2) return "bg-blue-500"; // Muito triste
    if (value <= 4) return "bg-indigo-500"; // Ansioso
    if (value <= 6) return "bg-yellow-500"; // Neutro
    if (value <= 8) return "bg-orange-500"; // Contente
    return "bg-green-500"; // Muito feliz
  };

  /**
   * 🎨 Obter label do estado emocional
   */
  const getEmotionLabel = (value: number) => {
    if (value <= 2) return "Muito Triste 😢";
    if (value <= 4) return "Ansioso/Preocupado 😰";
    if (value <= 6) return "Neutro/Equilibrado 😐";
    if (value <= 8) return "Contente/Bem 😊";
    return "Muito Feliz 😄";
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
                {/* Slider de Estado Emocional */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-lg font-medium text-gray-700">
                      Seu estado emocional atual
                    </label>
                    <span className="text-2xl font-bold text-orange-500">
                      {emotionalState}
                    </span>
                  </div>

                  {/* Slider */}
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={emotionalState}
                      onChange={(e) =>
                        setEmotionalState(parseInt(e.target.value))
                      }
                      className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, 
                          #3b82f6 0%, 
                          #6366f1 20%, 
                          #eab308 40%, 
                          #f97316 60%, 
                          #22c55e 80%, 
                          #22c55e 100%)`,
                      }}
                      disabled={isGenerating}
                    />
                  </div>

                  {/* Label do Estado */}
                  <div className="mt-4 text-center">
                    <div
                      className={`inline-block px-6 py-3 rounded-full text-white font-semibold ${getEmotionColor(
                        emotionalState
                      )}`}
                    >
                      {getEmotionLabel(emotionalState)}
                    </div>
                  </div>

                  {/* Descrição */}
                  <p className="text-sm text-gray-500 mt-4 text-center">
                    Deslize para indicar como você se sente agora
                  </p>
                </div>

                {/* Seletor de Gênero */}
                <div className="mb-8">
                  <label className="block text-lg font-medium text-gray-700 mb-4">
                    Gênero musical preferido (opcional)
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
