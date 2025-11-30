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
  id: "sadness" | "joy" | "anger" | "anxiety" /* | "surprise" */;
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
    label: "Neutro",
    descricao: "Como está seu nível de neutro?",
    icone: "😐",
  },
  {
    id: "anxiety",
    label: "Ansiedade",
    descricao: "Qual é seu nível de ansiedade?",
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
    anxiety: 5,
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
  const genres = ["Rock", "Funk", "Rap", "Samba", "Mpb"];

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

      // Chamar serviço de análise emocional COM AS 4 EMOÇÕES
      const result = await EmotionalService.analyzeWithFuzzy({
        sadness: emocoes_valores.sadness,
        joy: emocoes_valores.joy,
        anger: emocoes_valores.anger,
        anxiety: emocoes_valores.anxiety,
        generoPreferido: selectedGenre === "Todos" ? undefined : selectedGenre,
      });

      if (result.success && result.data) {
        console.log("✅ Análise gerada com sucesso!");
        console.log("   Intenção:", result.data.fuzzyAnalysis.intencao);
        console.log("   Confiança:", result.data.fuzzyAnalysis.confianca);
        console.log("   Músicas:", result.data.playlist.length);
        console.log(
          "   Musicas a tocar:",
          result.data.playlist.map((m: any) => m.name).join(", ")
        );

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
    <div className="min-h-screen bg-gradient-to-br from-sol-light via-sol-pale to-sol-primary flex flex-col">
      <Header
        pageTitle="Análise Emocional"
        showBackButton={true}
        showLogoutButton={true}
        onBack={() => setCurrentPage(PAGES.DASHBOARD)}
        onLogout={() => setCurrentPage(PAGES.LOGIN)}
        userName={userData?.name}
      />

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          {/* Logo e Título */}
          <div className="text-center mb-8">
            <SunLogo size="large" />
            <h2 className="text-2xl font-bold text-sol-darker mb-4">
              Como você está se sentindo?
            </h2>
            <p className="text-sol-dark">
              Vou usar inteligência artificial para criar uma playlist perfeita
              para você
            </p>
          </div>

          {/* Card Principal */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-sol-primary">
            {!showResults ? (
              <>
                {/* Título */}
                <h3 className="text-lg font-semibold mb-6 text-sol-darker">
                  📊 Avalie seu estado emocional
                </h3>

                {/* 5 Sliders de Emoção com Cores Fortes */}
                <div className="space-y-8 mb-8">
                  {emocoes.map((emocao) => {
                    const emotionColors: Record<
                      string,
                      { bg: string; accent: string; border: string }
                    > = {
                      sadness: {
                        bg: "bg-emotion-sadness/10",
                        accent: "accent-emotion-sadness",
                        border: "border-emotion-sadness",
                      },
                      joy: {
                        bg: "bg-emotion-joy/10",
                        accent: "accent-emotion-joy",
                        border: "border-emotion-joy",
                      },
                      anger: {
                        bg: "bg-emotion-anger/10",
                        accent: "accent-emotion-anger",
                        border: "border-emotion-anger",
                      },
                      anxiety: {
                        bg: "bg-emotion-anxiety/10",
                        accent: "accent-emotion-anxiety",
                        border: "border-emotion-anxiety",
                      },
                      /* surprise: {
                        bg: "bg-emotion-surprise/10",
                        accent: "accent-emotion-surprise",
                        border: "border-emotion-surprise",
                      }, */
                    };
                    const emotionColor = emotionColors[emocao.id];
                    const percentage = (emocoes_valores[emocao.id] / 10) * 100;

                    return (
                      <div
                        key={emocao.id}
                        className={`${emotionColor.bg} border-2 ${emotionColor.border} rounded-xl p-4 transition-all duration-200`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-4xl">{emocao.icone}</span>
                            <div>
                              <label className="text-base font-bold text-sol-darker block">
                                {emocao.label}
                              </label>
                              <p className="text-xs text-gray-600">
                                {emocao.descricao}
                              </p>
                            </div>
                          </div>
                          <div className="text-center">
                            <span className="text-3xl font-bold ${emotionColor.accent.replace('accent-', 'text-')}">
                              {emocoes_valores[emocao.id]}
                            </span>
                            <p className="text-xs text-gray-500">/10</p>
                          </div>
                        </div>

                        {/* Barra de progresso visual */}
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={emocoes_valores[emocao.id]}
                          onChange={(e) =>
                            handleSliderChange(
                              emocao.id,
                              parseInt(e.target.value)
                            )
                          }
                          className={`w-full h-3 bg-gray-300 rounded-lg appearance-none cursor-pointer ${emotionColor.accent} transition-all duration-200`}
                          disabled={isGenerating}
                          style={{
                            background: `linear-gradient(to right, ${
                              {
                                sadness: "#4A90E2",
                                joy: "#FFD700",
                                anger: "#FF4444",
                                anxiety: "#9C27B0",
                                /* surprise: "#00BCD4", */
                              }[emocao.id]
                            } 0%, ${
                              // map 1..10 to 0..100%
                              ((emocoes_valores[emocao.id] - 1) / 9) * 100
                            }%, #e5e7eb ${((emocoes_valores[emocao.id] - 1) / 9) * 100}%, #e5e7eb 100%)`,
                          }}
                        />

                        <div className="flex justify-between text-xs text-gray-600 px-1 mt-2">
                          <span>😐 Nada</span>
                          <span>😊 Bastante</span>
                          <span>😍 Máximo</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Seletor de Gênero */}
                <div className="mb-8">
                  <label className="block text-lg font-medium text-sol-darker mb-4">
                    🎵 Gênero musical preferido 
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Opção "Todos" */}
                    <button
                      onClick={() => setSelectedGenre("")}
                      disabled={isGenerating}
                      className={`px-4 py-3 rounded-lg font-medium transition-all ${
                        selectedGenre === ""
                          ? "bg-sol-primary text-black shadow-md border-2 border-sol-dark"
                          : "bg-sol-light text-sol-dark hover:bg-sol-pale border border-sol-pale"
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
                            ? "bg-sol-primary text-black shadow-md border-2 border-sol-dark"
                            : "bg-sol-light text-sol-dark hover:bg-sol-pale border border-sol-pale"
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-sol-dark mt-2">
                    {selectedGenre
                      ? `✓ ${selectedGenre.toUpperCase()} selecionado`
                      : "Nenhum gênero selecionado (todos os gêneros)"}
                  </p>
                </div>

                {/* Mensagem de Erro */}
                {error && (
                  <div className="mb-6 bg-emotion-anger/20 border-2 border-emotion-anger text-emotion-anger px-4 py-3 rounded-lg text-sm font-medium">
                    {error}
                  </div>
                )}

                {/* Botão Gerar Playlist */}
                <div className="text-center">
                  <Button
                    onClick={handleGeneratePlaylist}
                    disabled={isGenerating}
                    className="bg-sol-primary text-black px-12 py-4 rounded-lg font-semibold text-lg hover:bg-sol-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-2 border-sol-dark"
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
                  <div className="w-20 h-20 bg-emotion-joy rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">✅</span>
                  </div>
                  <h3 className="text-2xl font-bold text-sol-darker mb-2">
                    Playlist Gerada com Sucesso!
                  </h3>
                </div>

                {analysisResult && (
                  <div className="space-y-4 mb-6">
                    <div className="bg-sol-pale/50 border-2 border-sol-primary rounded-lg p-4">
                      <p className="text-sm text-sol-dark font-medium mb-1">
                        Intenção da Playlist
                      </p>
                      <p className="text-xl font-bold text-sol-darker capitalize">
                        {analysisResult.fuzzyAnalysis.intencao}
                      </p>
                    </div>

                    <div className="bg-emotion-calm/20 border-2 border-emotion-calm rounded-lg p-4">
                      <p className="text-sm text-emotion-calm font-medium mb-1">
                        Confiança da IA
                      </p>
                      <p className="text-xl font-bold text-emotion-calm">
                        {(analysisResult.fuzzyAnalysis.confianca * 100).toFixed(
                          1
                        )}
                        %
                      </p>
                    </div>

                    <div className="bg-emotion-joy/20 border-2 border-emotion-joy rounded-lg p-4">
                      <p className="text-sm text-emotion-joy font-medium mb-1">
                        Músicas Selecionadas
                      </p>
                      <p className="text-xl font-bold text-emotion-joy">
                        {analysisResult.playlist.length} músicas
                      </p>
                    </div>

                    <p className="text-gray-700 text-sm italic">
                      {analysisResult.fuzzyAnalysis.descricao}
                    </p>
                  </div>
                )}

                <p className="text-gray-600 text-sm">
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
