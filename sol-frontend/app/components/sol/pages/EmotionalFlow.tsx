import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import Header from "../Header";
import SunLogo from "../SunLogo";
import EmotionalAnalysisView from "../EmotionalAnalysisView";
import PlaylistDetailView from "../PlaylistDetailView";
import { EmotionalService } from "~/services/emotionalService";
import type { EmotionalRecommendation } from "~/services/emotionalService";

// PROPS

interface EmotionalFlowProps {
  onBack?: () => void;
  userName?: string;
}

// TIPOS INTERNOS

type FlowStep = "form" | "loading" | "results";

const GENRES = ["Rock", "Funk", "MPB", "Sertanejo"];

// COMPONENTE PRINCIPAL

export default function EmotionalFlow({
  onBack,
  userName = "Usuário",
}: EmotionalFlowProps) {
  // ESTADOS

  const [currentStep, setCurrentStep] = useState<FlowStep>("form");
  const [estadoEmocional, setEstadoEmocional] = useState<number>(5);
  const [generoPreferido, setGeneroPreferido] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [recommendation, setRecommendation] = useState<
    EmotionalRecommendation | undefined
  >();

  // HANDLERS

  /**
   * Submeter análise emocional
   */
  const handleSubmit = async () => {
    setError(undefined);
    setCurrentStep("loading");

    console.log("📝 Submetendo análise...", {
      estadoEmocional,
      generoPreferido,
    });

    try {
      const result = await EmotionalService.analyzeWithFuzzy({
        estadoEmocional,
        generoPreferido,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || "Erro na análise");
      }

      console.log("✅ Análise recebida!", result.data);

      setRecommendation(result.data);
      setCurrentStep("results");
    } catch (err: any) {
      console.error("❌ Erro:", err);
      setError(err.message || "Erro ao processar análise");
      setCurrentStep("form");
    }
  };

  /**
   * Recomeçar análise
   */
  const handleRestart = () => {
    setCurrentStep("form");
    setEstadoEmocional(5);
    setGeneroPreferido(undefined);
    setRecommendation(undefined);
    setError(undefined);
  };

  /**
   * Tocar música (placeholder)
   */
  const handlePlayTrack = (track: any) => {
    console.log("▶️ Tocando:", track.name);
    // TODO: Integrar com player Spotify
    alert(`Tocando: ${track.name} - ${track.artist}`);
  };

  /**
   * Feedback de música (placeholder)
   */
  const handleFeedback = (trackId: string, liked: boolean) => {
    console.log(`${liked ? "👍" : "👎"} Feedback:`, trackId);
    // TODO: Enviar para API de feedback
    alert(`Obrigado pelo feedback! ${liked ? "👍 Gostou" : "👎 Não gostou"}`);
  };

  // HELPERS

  const getEmotionLabel = (value: number): string => {
    if (value <= 2) return "Muito Triste";
    if (value <= 4) return "Ansioso";
    if (value <= 6) return "Neutro";
    if (value <= 8) return "Bem";
    return "Muito Feliz";
  };

  const getEmotionEmoji = (value: number): string => {
    if (value <= 2) return "😢";
    if (value <= 4) return "😟";
    if (value <= 6) return "😐";
    if (value <= 8) return "🙂";
    return "😊";
  };

  // RENDER

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex flex-col">
      {/* Header */}
      <Header pageTitle="Análise Emocional" showBackButton={!!onBack} />

      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <SunLogo size="md" />
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* PASSO 1: FORMULÁRIO */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {currentStep === "form" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Mensagem de Boas-Vindas */}
            <Card className="bg-white border-2 border-orange-200">
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  Olá, {userName}! 👋
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-600">
                  Como você está se sentindo hoje? Vamos criar uma playlist
                  personalizada para você!
                </p>
              </CardContent>
            </Card>

            {/* Formulário */}
            <Card className="bg-white border-2 border-gray-200">
              <CardHeader>
                <CardTitle>📊 Avalie seu estado emocional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Slider de Estado Emocional */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Como você se sente agora?
                  </label>

                  {/* Visualização atual */}
                  <div className="text-center mb-4">
                    <div className="text-6xl mb-2">
                      {getEmotionEmoji(estadoEmocional)}
                    </div>
                    <div className="text-2xl font-bold text-gray-800">
                      {estadoEmocional}/10
                    </div>
                    <div className="text-sm text-gray-600">
                      {getEmotionLabel(estadoEmocional)}
                    </div>
                  </div>

                  {/* Slider */}
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={estadoEmocional}
                    onChange={(e) =>
                      setEstadoEmocional(parseFloat(e.target.value))
                    }
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />

                  {/* Labels */}
                  <div className="flex justify-between text-xs text-gray-600 mt-2">
                    <span>😢 Muito Triste</span>
                    <span>😊 Muito Feliz</span>
                  </div>
                </div>

                {/* Seleção de Gênero */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gênero musical preferido (opcional)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {GENRES.map((genre) => (
                      <button
                        key={genre}
                        onClick={() =>
                          setGeneroPreferido(
                            generoPreferido === genre ? undefined : genre
                          )
                        }
                        className={`p-4 rounded-lg border-2 transition-all ${
                          generoPreferido === genre
                            ? "border-orange-500 bg-orange-50 font-bold"
                            : "border-gray-200 bg-white hover:border-orange-300"
                        }`}
                      >
                        🎵 {genre}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {generoPreferido
                      ? `Selecionado: ${generoPreferido}`
                      : "Nenhum gênero selecionado (todos os gêneros)"}
                  </p>
                </div>

                {/* Erro (se houver) */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-700">❌ {error}</p>
                  </div>
                )}

                {/* Botão Gerar */}
                <Button
                  onClick={handleSubmit}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-6 text-lg"
                >
                  🎵 Gerar Playlist Personalizada
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* PASSO 2: LOADING */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {currentStep === "loading" && (
          <Card className="bg-white border-2 border-orange-200">
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <div className="animate-spin text-6xl">🎵</div>
                <div className="text-xl font-bold text-gray-800">
                  Analisando seu estado emocional...
                </div>
                <div className="text-sm text-gray-600">
                  Aguarde enquanto criamos a playlist perfeita para você
                </div>
                <div className="flex justify-center gap-2 mt-4">
                  <div
                    className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* PASSO 3: RESULTADOS */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {currentStep === "results" && recommendation && (
          <div className="space-y-6 animate-fadeIn">
            {/* Análise Fuzzy */}
            <EmotionalAnalysisView
              analysis={recommendation.fuzzyAnalysis}
              showDetails={true}
            />

            {/* Playlist Detalhada */}
            <PlaylistDetailView
              playlist={recommendation.playlist}
              stats={recommendation.stats}
              onPlayTrack={handlePlayTrack}
              onFeedback={handleFeedback}
            />

            {/* Botões de Ação */}
            <div className="flex gap-4">
              <Button
                onClick={handleRestart}
                variant="outline"
                className="flex-1"
              >
                🔄 Nova Análise
              </Button>
              {onBack && (
                <Button onClick={onBack} variant="outline" className="flex-1">
                  ⬅️ Voltar
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
