// src/pages/EmotionalAssessmentPage.jsx

import React, { useState, useEffect } from "react";
import Header from "../components/common/Header";
import SunLogo from "../components/common/SunLogo";
import Button from "../components/common/Button";
import useEmotionalState from "../hooks/useEmotionalState";

/**
 * Página de Avaliação Emocional Refatorada
 *
 * Esta página demonstra como usar o hook useEmotionalState para
 * capturar e gerenciar o estado emocional do usuário de forma
 * estruturada e escalável.
 *
 * Observe como a página se concentra apenas na interface e experiência
 * do usuário, enquanto toda a lógica complexa fica no hook.
 */
const EmotionalAssessmentPage = ({
  userPreferences,
  onComplete,
  onBack,
  user,
}) => {
  // Hook que gerencia todo o estado emocional
  // É como ter um psicólogo digital cuidando dos dados emocionais
  const {
    emotions,
    emotionalState,
    updateEmotion,
    getDominantEmotion,
    getOverallMood,
    hasUnsavedChanges,
    isLoading,
  } = useEmotionalState();

  // Estado local para controlar se o questionário foi completado
  const [isCompleted, setIsCompleted] = useState(false);

  // Verifica se pelo menos uma emoção foi avaliada
  // Isso garante que o usuário não passe sem avaliar nada
  useEffect(() => {
    const hasAnyEmotion = Object.values(emotionalState).some(
      (value) => value > 0
    );
    setIsCompleted(hasAnyEmotion);
  }, [emotionalState]);

  /**
   * Componente para renderizar a escala emocional
   * Este componente interno facilita a manutenção e reutilização
   */
  const EmotionalScale = ({ emotion, value, onChange }) => {
    // Array para criar os pontos da escala de 0 a 10
    const scalePoints = Array.from({ length: 11 }, (_, i) => i);

    return (
      <div className="space-y-4">
        {/* Cabeçalho da emoção */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: emotion.color }}
              aria-hidden="true"
            />
            <h3 className="font-medium text-gray-800 text-lg">
              {emotion.label}
            </h3>
          </div>
          <span className="text-2xl font-bold text-gray-700 min-w-[2rem] text-center">
            {value}
          </span>
        </div>

        {/* Escala visual */}
        <div className="relative">
          {/* Linha de fundo */}
          <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-200 rounded-full transform -translate-y-1/2" />

          {/* Linha de progresso */}
          <div
            className="absolute top-1/2 left-0 h-2 rounded-full transform -translate-y-1/2 transition-all duration-300"
            style={{
              width: `${(value / 10) * 100}%`,
              backgroundColor: emotion.color,
            }}
          />

          {/* Pontos clicáveis */}
          <div className="relative flex justify-between items-center h-8">
            {scalePoints.map((point) => (
              <button
                key={point}
                onClick={() => onChange(emotion.id, point)}
                className={`
                  w-6 h-6 rounded-full border-2 transition-all duration-200
                  ${
                    value >= point
                      ? "border-white shadow-lg scale-110"
                      : "border-gray-300 hover:border-gray-400 hover:scale-110"
                  }
                `}
                style={{
                  backgroundColor: value >= point ? emotion.color : "white",
                }}
                aria-label={`Avaliar ${emotion.label} como ${point} de 10`}
              />
            ))}
          </div>

          {/* Labels da escala */}
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Nada</span>
            <span>Pouco</span>
            <span>Moderado</span>
            <span>Muito</span>
            <span>Extremo</span>
          </div>
        </div>

        {/* Descrição contextual baseada no valor */}
        <div className="text-sm text-gray-600 text-center min-h-[20px]">
          {value === 0 && "Não estou sentindo isso agora"}
          {value >= 1 && value <= 3 && "Sinto um pouco disso"}
          {value >= 4 && value <= 6 && "Sinto isso moderadamente"}
          {value >= 7 && value <= 8 && "Sinto isso intensamente"}
          {value >= 9 && "Sinto isso muito intensamente"}
        </div>
      </div>
    );
  };

  /**
   * Processa a finalização da avaliação emocional
   */
  const handleComplete = async () => {
    if (!isCompleted) {
      return;
    }

    // Prepara os dados para enviar para a próxima página
    const assessmentData = {
      emotions: { ...emotionalState },
      dominantEmotion: getDominantEmotion(),
      overallMood: getOverallMood(),
      timestamp: new Date().toISOString(),
      userPreferences: userPreferences,
    };

    console.log("Avaliação emocional finalizada:", assessmentData);

    // Chama a função passada pelo componente pai
    onComplete(assessmentData);
  };

  /**
   * Renderiza o resumo do estado emocional atual
   */
  const renderEmotionalSummary = () => {
    const dominantEmotion = getDominantEmotion();
    const overallMood = getOverallMood();

    if (!dominantEmotion) {
      return (
        <div className="text-center text-gray-500 p-4">
          Avalie pelo menos uma emoção para ver seu resumo
        </div>
      );
    }

    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 text-center">
        <h3 className="font-semibold text-gray-800 mb-2">
          Resumo do seu estado atual
        </h3>

        <div className="flex items-center justify-center gap-2 mb-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: dominantEmotion.color }}
          />
          <span className="font-medium text-gray-700">
            Emoção predominante: {dominantEmotion.label}
          </span>
        </div>

        <div className="text-sm text-gray-600">
          Humor geral:{" "}
          {overallMood > 3
            ? "😊 Positivo"
            : overallMood < -3
            ? "😔 Negativo"
            : "😐 Neutro"}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header com botão de voltar */}
      <Header
        pageTitle="Como você está se sentindo?"
        showBackButton={true}
        onBackClick={onBack}
        showUserActions={true}
        user={user}
      />

      {/* Conteúdo Principal */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          {/* Seção de Apresentação */}
          <div className="text-center mb-8">
            <SunLogo size="large" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4 mt-4">
              Como posso te ajudar?
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Avalie como você está se sentindo agora. Isso me ajudará a
              escolher as músicas mais adequadas para você.
            </p>
          </div>

          {/* Card Principal */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            {/* Escalas Emocionais */}
            <div className="space-y-8 mb-8">
              {emotions.map((emotion) => (
                <EmotionalScale
                  key={emotion.id}
                  emotion={emotion}
                  value={emotionalState[emotion.id] || 0}
                  onChange={updateEmotion}
                />
              ))}
            </div>

            {/* Resumo do Estado Emocional */}
            {renderEmotionalSummary()}

            {/* Botão de Continuar */}
            <div className="text-center mt-8">
              <Button
                onClick={handleComplete}
                disabled={!isCompleted}
                loading={isLoading}
                variant="primary"
                size="lg"
                className="px-12"
              >
                Gerar Minha Playlist
              </Button>

              {!isCompleted && (
                <p className="text-sm text-gray-500 mt-2">
                  Avalie pelo menos uma emoção para continuar
                </p>
              )}
            </div>
          </div>

          {/* Indicador de Mudanças Não Salvas */}
          {hasUnsavedChanges && (
            <div className="text-center mt-4">
              <span className="inline-flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                Alterações não salvas
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmotionalAssessmentPage;
