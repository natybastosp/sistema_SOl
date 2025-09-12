import React, { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import Header from "../Header";
import SunLogo from "../SunLogo";
import {
  GenreSelector,
  DiscoveryWillingnessSlider,
  EmotionalConnectionInput,
  MusicalMemoriesInput,
  PreferencesPreview,
  type MusicPreferences,
} from "../shared/MusicPreferencesComponents";
import type { UserData } from "~/types/sol";

interface PreferencesPagesProps {
  userData: UserData;
  setUserData: (userData: UserData | ((prev: UserData) => UserData)) => void;
  setCurrentPage: (page: string) => void;
  mode?: "standalone" | "settings" | "onboarding";
}

/**
 * 🎵 PreferencesPages - Configuração Musical Inteligente e Modular
 *
 * Esta versão refatorada funciona como um estúdio de personalização musical que:
 * - Utiliza componentes modulares reutilizáveis para máxima flexibilidade
 * - Adapta sua apresentação baseada no contexto de uso
 * - Oferece insights em tempo real sobre as escolhas do usuário
 * - Integra perfeitamente com outros sistemas do SOL
 *
 * A experiência é como trabalhar com um produtor musical que entende
 * não apenas o que você gosta, mas por que você gosta e como isso
 * pode ser usado para criar experiências transformadoras.
 */
export default function PreferencesPages({
  userData,
  setUserData,
  setCurrentPage,
  mode = "standalone",
}: PreferencesPagesProps) {
  // 🎵 Estado local para preferências musicais expandidas
  const [musicPreferences, setMusicPreferences] = useState<MusicPreferences>(
    () => ({
      favoriteGenres: userData.preferences || [],
      discoveryWillingness: userData.discoverySettings?.allowExplicitContent
        ? 7
        : 5,
      emotionalConnection: "",
      musicalMemories: "",
      energyPreferences: {},
      timeOfDayPreferences: {},
    })
  );

  // 🎯 Estados para experiência do usuário
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [currentSection, setCurrentSection] = useState<
    "basic" | "advanced" | "insights"
  >("basic");

  /**
   * 🔄 Monitoramento de mudanças para feedback visual
   */
  useEffect(() => {
    const initialGenres = userData.preferences || [];
    const hasGenreChanges =
      JSON.stringify(musicPreferences.favoriteGenres) !==
      JSON.stringify(initialGenres);
    const hasOtherChanges =
      musicPreferences.emotionalConnection !== "" ||
      musicPreferences.musicalMemories !== "" ||
      musicPreferences.discoveryWillingness !== 5;

    setHasChanges(hasGenreChanges || hasOtherChanges);
  }, [musicPreferences, userData.preferences]);

  /**
   * 🎵 Atualização inteligente de preferências
   */
  const updateMusicPreferences = (updates: Partial<MusicPreferences>) => {
    setMusicPreferences((prev) => ({ ...prev, ...updates }));

    // Feedback imediato para mudanças significativas
    if (updates.favoriteGenres && updates.favoriteGenres.length > 0) {
      setSuccessMessage("");
    }
  };

  /**
   * 💾 Salvamento inteligente com feedback
   */
  const handleSavePreferences = async () => {
    setIsSaving(true);

    try {
      // Simula salvamento no backend
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Atualiza userData com as novas preferências
      setUserData((prev) => ({
        ...prev,
        preferences: musicPreferences.favoriteGenres,
        discoverySettings: {
          ...prev.discoverySettings,
          allowExplicitContent: musicPreferences.discoveryWillingness > 5,
          discoveryMode: musicPreferences.discoveryWillingness > 3,
          preferredDecades: [], // Seria calculado baseado na idade
          artistBlacklist: [],
          genreWeights: calculateGenreWeights(musicPreferences.favoriteGenres),
        },
      }));

      setSuccessMessage(
        "Preferências salvas com sucesso! Suas recomendações serão ainda mais personalizadas. ✨"
      );
      setHasChanges(false);

      // Se não está em modo configurações, avança no fluxo
      if (mode === "standalone") {
        setTimeout(() => {
          setCurrentPage("emotional-assessment");
        }, 1500);
      }
    } catch (error) {
      console.error("Erro ao salvar preferências:", error);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * 📊 Renderização inteligente baseada no modo
   */
  const getPageTitle = (): string => {
    switch (mode) {
      case "settings":
        return "Configurações Musicais";
      case "onboarding":
        return "Personalize Sua Experiência Musical";
      default:
        return "Suas Preferências Musicais";
    }
  };

  const getPageDescription = (): string => {
    switch (mode) {
      case "settings":
        return "Ajuste suas preferências para recomendações ainda mais precisas";
      case "onboarding":
        return "Vamos conhecer seus gostos musicais para criar experiências perfeitas";
      default:
        return "Quanto mais soubermos sobre seus gostos, melhor poderemos cuidar de você";
    }
  };

  const getProgressEncouragement = (): string => {
    const genreCount = musicPreferences.favoriteGenres.length;
    const hasEmotional =
      musicPreferences.emotionalConnection &&
      musicPreferences.emotionalConnection.length > 10;
    const hasMemories =
      musicPreferences.musicalMemories &&
      musicPreferences.musicalMemories.length > 10;

    let completeness = 0;
    if (genreCount > 0) completeness += 40;
    if (hasEmotional) completeness += 30;
    if (hasMemories) completeness += 30;

    if (completeness >= 80)
      return "Perfil musical completo! Você receberá recomendações super personalizadas. 🌟";
    if (completeness >= 50)
      return "Ótimo progresso! Quanto mais você compartilhar, melhor poderemos ajudar. 💫";
    if (completeness >= 20)
      return "Bom começo! Continue compartilhando para experiências mais personalizadas. 🎵";
    return "Vamos começar conhecendo seus gostos musicais básicos. 🎶";
  };

  /**
   * 🎨 Renderização principal com seções adaptáveis
   */
  return (
    <div
      className={`min-h-screen flex flex-col ${
        mode === "settings"
          ? "bg-gray-50"
          : "bg-gradient-to-br from-purple-50 to-pink-50"
      }`}
    >
      <Header pageTitle={getPageTitle()} />

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          {/* Cabeçalho contextual */}
          <div className="text-center mb-8">
            {mode !== "settings" && <SunLogo size="medium" />}
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {getPageTitle()}
            </h1>
            <p className="text-lg text-gray-600 mb-4">{getPageDescription()}</p>
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {getProgressEncouragement()}
            </div>
          </div>

          {/* Navegação por seções (apenas para modo settings) */}
          {mode === "settings" && (
            <div className="flex justify-center mb-8">
              <div className="bg-white rounded-lg p-1 shadow-sm border">
                {[
                  { key: "basic", label: "Básico", icon: "🎵" },
                  { key: "advanced", label: "Avançado", icon: "🔧" },
                  { key: "insights", label: "Insights", icon: "📊" },
                ].map((section) => (
                  <button
                    key={section.key}
                    onClick={() => setCurrentSection(section.key as any)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      currentSection === section.key
                        ? "bg-orange-500 text-white"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    {section.icon} {section.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Conteúdo principal */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="space-y-8">
              {/* Seção Básica - sempre visível */}
              {(currentSection === "basic" || mode !== "settings") && (
                <>
                  <GenreSelector
                    preferences={musicPreferences}
                    updatePreferences={updateMusicPreferences}
                    mode={mode === "settings" ? "settings" : "registration"}
                  />

                  <DiscoveryWillingnessSlider
                    preferences={musicPreferences}
                    updatePreferences={updateMusicPreferences}
                    mode={mode === "settings" ? "settings" : "registration"}
                  />
                </>
              )}

              {/* Seção Avançada */}
              {(currentSection === "advanced" ||
                (mode !== "settings" &&
                  musicPreferences.favoriteGenres.length > 0)) && (
                <>
                  <EmotionalConnectionInput
                    preferences={musicPreferences}
                    updatePreferences={updateMusicPreferences}
                    mode={mode === "settings" ? "settings" : "registration"}
                  />

                  <MusicalMemoriesInput
                    preferences={musicPreferences}
                    updatePreferences={updateMusicPreferences}
                    mode={mode === "settings" ? "settings" : "registration"}
                  />
                </>
              )}

              {/* Seção de Insights */}
              {(currentSection === "insights" ||
                (mode !== "settings" &&
                  musicPreferences.favoriteGenres.length > 1)) && (
                <PreferencesPreview
                  preferences={musicPreferences}
                  mode={mode === "settings" ? "settings" : "registration"}
                />
              )}
            </div>

            {/* Mensagem de sucesso */}
            {successMessage && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm font-medium">
                  {successMessage}
                </p>
              </div>
            )}

            {/* Ações */}
            <div className="mt-8 flex justify-between items-center">
              {mode === "settings" ? (
                <Button
                  onClick={() => setCurrentPage("dashboard")}
                  variant="outline"
                  className="border-gray-300 text-gray-700"
                >
                  ← Voltar ao Dashboard
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentPage("login")}
                  variant="outline"
                  className="border-gray-300 text-gray-700"
                >
                  ← Voltar
                </Button>
              )}

              <div className="flex space-x-3">
                {mode === "settings" && (
                  <Button
                    onClick={() => {
                      setMusicPreferences({
                        favoriteGenres: userData.preferences || [],
                        discoveryWillingness: 5,
                        emotionalConnection: "",
                        musicalMemories: "",
                        energyPreferences: {},
                        timeOfDayPreferences: {},
                      });
                      setSuccessMessage("Preferências restauradas ao padrão.");
                    }}
                    variant="outline"
                    className="border-gray-300 text-gray-700"
                    disabled={isSaving}
                  >
                    Restaurar Padrão
                  </Button>
                )}

                <Button
                  onClick={handleSavePreferences}
                  disabled={
                    !hasChanges ||
                    isSaving ||
                    musicPreferences.favoriteGenres.length === 0
                  }
                  className="bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Salvando...
                    </div>
                  ) : mode === "settings" ? (
                    "Salvar Alterações"
                  ) : (
                    "Continuar →"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 🧮 FUNÇÃO AUXILIAR PARA CÁLCULO DE PESOS DE GÊNERO

/**
 * Calcula pesos relativos dos gêneros baseado nas preferências
 */
function calculateGenreWeights(genres: string[]): Record<string, number> {
  if (genres.length === 0) return {};

  const baseWeight = 1.0 / genres.length;
  const weights: Record<string, number> = {};

  genres.forEach((genre) => {
    weights[genre] = baseWeight;
  });

  return weights;
}
