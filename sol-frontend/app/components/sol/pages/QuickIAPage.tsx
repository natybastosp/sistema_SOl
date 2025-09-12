import React, { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import Header from "../Header";
import SunLogo from "../SunLogo";
import { EMOTIONS, PAGES } from "~/constants/sol";
import type { UserData, EmotionalAnalysis } from "~/types/sol";

interface QuickIAPageProps {
  userData: UserData;
  setUserData: (userData: UserData | ((prev: UserData) => UserData)) => void;
  onPlaylistGenerated: (playlist: any[], analysis: EmotionalAnalysis) => void;
  onNavigate: (page: string) => void;
}

/**
 * ⚡ QuickIAPage - A Sala de Emergência Emocional do Sistema SOL
 *
 * Este componente é como ter um paramédico emocional que:
 * - Avalia rapidamente a situação emocional
 * - Toma decisões baseadas no histórico da pessoa
 * - Oferece intervenção imediata quando necessário
 * - Conecta a pessoa ao cuidado apropriado em segundos
 *
 * A experiência é como chegar a um pronto-socorro onde o médico já conhece
 * seu histórico médico e pode agir imediatamente, ou como ter um terapeuta
 * que lembra exatamente de onde vocês pararam na última sessão.
 */
export default function QuickIAPage({
  userData,
  setUserData,
  onPlaylistGenerated,
  onNavigate,
}: QuickIAPageProps) {
  // 🎯 Estados para captura rápida de emoção
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [intensityLevel, setIntensityLevel] = useState<number>(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quickContext, setQuickContext] = useState<string>("");

  // 🧠 Estados para análise inteligente
  const [suggestedEmotions, setSuggestedEmotions] = useState<string[]>([]);
  const [personalizedGreeting, setPersonalizedGreeting] = useState<string>("");

  /**
   * 🔍 Análise inteligente do perfil do usuário
   *
   * Como um médico que revisa rapidamente o prontuário antes de entrar no quarto,
   * este efeito analisa o histórico emocional do usuário para personalizar
   * completamente a experiência de entrada.
   */
  useEffect(() => {
    const analyzeUserContext = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const userName = userData.name || "amigo";

      // Análise temporal para saudação contextual
      let timeGreeting = "";
      if (currentHour < 12) {
        timeGreeting = "Bom dia";
      } else if (currentHour < 18) {
        timeGreeting = "Boa tarde";
      } else {
        timeGreeting = "Boa noite";
      }

      // Análise do perfil emocional para sugestões inteligentes
      const emotionalProfile = userData.emotionalProfile;
      let suggestions: string[] = [];

      if (emotionalProfile?.dominantEmotion) {
        // Se tem histórico, sugere emoções relacionadas ao padrão
        const dominant = emotionalProfile.dominantEmotion;
        suggestions = getRelatedEmotions(dominant);
      } else {
        // Para novos usuários, sugere emoções mais comuns
        suggestions = ["anxiety", "sadness", "calm", "joy"];
      }

      // Personalização baseada no histórico de sessões
      let contextualGreeting = "";
      if (emotionalProfile?.progressMetrics.sessionsCompleted > 0) {
        const lastSessionDays = calculateDaysSinceLastSession();
        if (lastSessionDays === 0) {
          contextualGreeting =
            "Que bom te ver novamente hoje! Como você está se sentindo agora?";
        } else if (lastSessionDays <= 3) {
          contextualGreeting =
            "Olá novamente! Como tem sido estes últimos dias?";
        } else {
          contextualGreeting =
            "Que bom ter você de volta! Como você está se sentindo?";
        }
      } else {
        contextualGreeting =
          "Vamos começar esta jornada juntos. Como você está se sentindo agora?";
      }

      setPersonalizedGreeting(
        `${timeGreeting}, ${userName}! ${contextualGreeting}`
      );
      setSuggestedEmotions(suggestions);
    };

    analyzeUserContext();
  }, [userData]);

  /**
   * 🎵 Geração inteligente de playlist
   *
   * Como um DJ terapeuta que conhece exatamente qual música tocar
   * para cada estado emocional específico, baseado não apenas na
   * emoção atual, mas no perfil completo da pessoa.
   */
  const generateQuickPlaylist = async () => {
    if (!selectedEmotion) return;

    setIsGenerating(true);

    try {
      // Simula processamento da IA (em produção, seria chamada para backend)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Análise emocional baseada na seleção e contexto
      const analysis: EmotionalAnalysis = {
        dominant: selectedEmotion,
        intensity: intensityLevel,
        stability: calculateEmotionalStability(),
        recommendations: generateContextualRecommendations(
          selectedEmotion,
          intensityLevel
        ),
      };

      // Atualiza estado emocional do usuário
      setUserData((prev) => ({
        ...prev,
        emotionalState: {
          ...prev.emotionalState,
          [selectedEmotion]: intensityLevel,
          timestamp: new Date().toISOString(),
        },
      }));

      // Gera playlist baseada na análise
      const playlist = generateContextualPlaylist(analysis, userData);

      onPlaylistGenerated(playlist, analysis);
    } catch (error) {
      console.error("Erro na geração de playlist:", error);
      // Em caso de erro, oferece opção de IA completa
      onNavigate(PAGES.EMOTIONAL_ASSESSMENT);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * 🎨 Renderização da interface de emergência emocional
   *
   * Cada elemento é posicionado para minimizar fricção cognitiva
   * e maximizar a velocidade de acesso ao cuidado emocional.
   */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <Header pageTitle="Como você está hoje?" />

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-3xl w-full">
          {/* Saudação personalizada e contextual */}
          <div className="text-center mb-8">
            <SunLogo size="medium" />
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              IA Rápida para Bem-Estar
            </h1>
            <p className="text-lg text-gray-600 mb-2">{personalizedGreeting}</p>
            <p className="text-sm text-gray-500">
              Com base no que você me disser, vou criar uma playlist
              personalizada em segundos.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
            {/* Seleção rápida de emoção com botões inteligentes */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Como você está se sentindo agora?
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {EMOTIONS.map((emotion) => {
                  const isRecommended = suggestedEmotions.includes(emotion.key);
                  const isSelected = selectedEmotion === emotion.key;

                  return (
                    <button
                      key={emotion.key}
                      onClick={() => setSelectedEmotion(emotion.key)}
                      className={`
                        relative p-4 rounded-lg border-2 transition-all text-left
                        ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 transform scale-105"
                            : "border-gray-200 hover:border-blue-300 hover:bg-blue-25"
                        }
                        ${isRecommended ? "ring-2 ring-orange-200" : ""}
                      `}
                    >
                      {/* Indicador de recomendação baseada no histórico */}
                      {isRecommended && (
                        <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                          Comum para você
                        </div>
                      )}

                      <div
                        className={`w-3 h-3 rounded-full ${emotion.color} mb-2`}
                      ></div>
                      <div className="font-medium text-gray-800">
                        {emotion.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {getEmotionDescription(emotion.key)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Controle de intensidade emocional */}
            {selectedEmotion && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Qual a intensidade desta emoção? (1-10)
                </h3>

                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">Leve</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={intensityLevel}
                    onChange={(e) => setIntensityLevel(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-sm text-gray-500">Intensa</span>
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium min-w-[3rem] text-center">
                    {intensityLevel}
                  </div>
                </div>

                <p className="text-sm text-gray-500 mt-2">
                  {getIntensityDescription(intensityLevel)}
                </p>
              </div>
            )}

            {/* Contexto adicional opcional */}
            {selectedEmotion && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Quer me contar mais? (opcional)
                </h3>
                <textarea
                  value={quickContext}
                  onChange={(e) => setQuickContext(e.target.value)}
                  placeholder="Ex: 'Estou ansioso por causa de uma apresentação' ou 'Dia difícil no trabalho'..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={3}
                  maxLength={200}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Isso me ajuda a personalizar ainda mais suas músicas
                </p>
              </div>
            )}

            {/* Botões de ação com opções inteligentes */}
            <div className="space-y-3">
              <Button
                onClick={generateQuickPlaylist}
                disabled={!selectedEmotion || isGenerating}
                className="w-full bg-blue-500 text-white py-4 text-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Criando sua playlist personalizada...
                  </div>
                ) : (
                  "🎵 Criar playlist agora"
                )}
              </Button>

              {/* Opções alternativas para diferentes necessidades */}
              <div className="flex space-x-3">
                <Button
                  onClick={() => onNavigate(PAGES.EMOTIONAL_ASSESSMENT)}
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  disabled={isGenerating}
                >
                  🧠 Análise completa
                </Button>

                <Button
                  onClick={() => onNavigate(PAGES.DASHBOARD)}
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  disabled={isGenerating}
                >
                  📊 Ver meu progresso
                </Button>
              </div>
            </div>

            {/* Informação de segurança e suporte */}
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>💛 Lembre-se:</strong> Se você está enfrentando
                pensamentos de autolesão, procure ajuda profissional
                imediatamente. O SOL é um complemento, não um substituto para
                cuidados de saúde mental profissionais.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 🛠️ FUNÇÕES AUXILIARES PARA INTELIGÊNCIA CONTEXTUAL

/**
 * Encontra emoções relacionadas baseadas em padrões conhecidos
 */
function getRelatedEmotions(dominantEmotion: string): string[] {
  const emotionClusters: Record<string, string[]> = {
    sadness: ["sadness", "calm", "anxiety"],
    anxiety: ["anxiety", "calm", "sadness"],
    anger: ["anger", "calm", "sadness"],
    joy: ["joy", "calm", "anxiety"],
    calm: ["calm", "joy", "sadness"],
  };

  return emotionClusters[dominantEmotion] || ["calm", "sadness", "anxiety"];
}

/**
 * Calcula dias desde última sessão (simulado)
 */
function calculateDaysSinceLastSession(): number {
  // Em produção, seria baseado em dados reais do backend
  return Math.floor(Math.random() * 7);
}

/**
 * Calcula estabilidade emocional baseada em histórico
 */
function calculateEmotionalStability(): number {
  // Algoritmo simplificado - em produção seria muito mais sofisticado
  return Math.floor(Math.random() * 40) + 30; // 30-70
}

/**
 * Gera recomendações contextuais baseadas na emoção e intensidade
 */
function generateContextualRecommendations(
  emotion: string,
  intensity: number
): any {
  const isHighIntensity = intensity > 7;

  return {
    immediate: isHighIntensity
      ? ["respiracao_profunda", "ouvir_playlist", "contato_suporte"]
      : ["ouvir_playlist", "reflexao_guiada"],
    longTerm: ["pratica_regular", "acompanhamento_progresso"],
    musicTherapy: {
      approach: isHighIntensity ? "iso-mood" : "progressive",
      targetEmotion: "calm",
      sessionLength: isHighIntensity ? 20 : 15,
      intensity: isHighIntensity ? "gentle" : "moderate",
    },
  };
}

/**
 * Gera playlist contextual baseada na análise
 */
function generateContextualPlaylist(
  analysis: EmotionalAnalysis,
  userData: UserData
): any[] {
  // Simulação de playlist inteligente
  // Em produção, seria gerada pelo backend com IA real
  return [
    {
      id: Date.now(),
      title: `Playlist para ${analysis.dominant}`,
      description: `Criada especialmente para seu estado atual`,
      tracks: [], // Seria populada com tracks reais
      therapeuticApproach: analysis.recommendations.musicTherapy.approach,
    },
  ];
}

/**
 * Fornece descrição contextual da emoção
 */
function getEmotionDescription(emotionKey: string): string {
  const descriptions: Record<string, string> = {
    sadness: "Sentindo-se para baixo",
    anxiety: "Preocupado ou tenso",
    joy: "Feliz e energizado",
    anger: "Irritado ou frustrado",
    calm: "Tranquilo e relaxado",
  };

  return descriptions[emotionKey] || "Estado emocional";
}

/**
 * Fornece descrição da intensidade emocional
 */
function getIntensityDescription(intensity: number): string {
  if (intensity <= 3) return "Uma sensação leve e manejável";
  if (intensity <= 6) return "Um sentimento moderado que você nota";
  if (intensity <= 8) return "Uma emoção forte que está afetando seu dia";
  return "Uma intensidade muito alta que pode precisar de atenção especial";
}
