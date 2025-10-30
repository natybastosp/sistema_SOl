import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import type { FuzzyAnalysisResult } from "~/services/emotionalService";
import { EmotionalService } from "~/services/emotionalService";

// PROPS

interface EmotionalAnalysisViewProps {
  analysis: FuzzyAnalysisResult;
  showDetails?: boolean; // Mostrar graus de pertinência?
  className?: string;
}

// COMPONENTE PRINCIPAL

export default function EmotionalAnalysisView({
  analysis,
  showDetails = true,
  className = "",
}: EmotionalAnalysisViewProps) {
  // Obter cor baseada na intenção
  const intentionColor = EmotionalService.getIntentionColor(analysis.intencao);

  // Calcular porcentagem de confiança
  const confiancaPercent = Math.round(analysis.confianca * 100);

  // Determinar nível de confiança
  const getConfiancaLevel = (
    conf: number
  ): {
    label: string;
    color: string;
  } => {
    if (conf >= 0.8) return { label: "Alta", color: "text-green-600" };
    if (conf >= 0.6) return { label: "Média", color: "text-yellow-600" };
    return { label: "Baixa", color: "text-orange-600" };
  };

  const confiancaLevel = getConfiancaLevel(analysis.confianca);

  // Estados fuzzy mais relevantes (top 2)
  const topStates = Object.entries(analysis.graus)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2);

  return (
    <Card
      className={`bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 ${className}`}
    >
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* HEADER - Intenção e Confiança */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-full ${intentionColor.tailwind} flex items-center justify-center text-2xl`}
            >
              {intentionColor.emoji}
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                {analysis.intencao}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">{analysis.descricao}</p>
            </div>
          </div>

          {/* Badge de Confiança */}
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-800">
              {confiancaPercent}%
            </div>
            <div className={`text-sm font-medium ${confiancaLevel.color}`}>
              Confiança {confiancaLevel.label}
            </div>
          </div>
        </div>
      </CardHeader>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* CONTENT - Detalhes da Análise */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {showDetails && (
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Barra de Confiança */}
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Nível de Confiança</span>
                <span>{confiancaPercent}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    confiancaPercent >= 80
                      ? "bg-green-500"
                      : confiancaPercent >= 60
                        ? "bg-yellow-500"
                        : "bg-orange-500"
                  } transition-all duration-500 ease-out`}
                  style={{ width: `${confiancaPercent}%` }}
                />
              </div>
            </div>

            {/* Estados Emocionais Detectados */}
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-2">
                🧠 Estados Emocionais Detectados:
              </div>
              <div className="grid grid-cols-2 gap-2">
                {topStates.map(([estado, valor]) => {
                  const percent = Math.round(valor * 100);
                  const emoji =
                    {
                      triste: "😢",
                      ansioso: "😟",
                      neutro: "😐",
                      alegre: "😊",
                    }[estado] || "😐";

                  return (
                    <div
                      key={estado}
                      className="bg-white rounded-lg p-3 border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium capitalize flex items-center gap-1">
                          {emoji} {estado}
                        </span>
                        <span className="text-xs text-gray-600">
                          {percent}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Todos os Graus Fuzzy (Detalhado) */}
            <details className="bg-white rounded-lg p-3 border border-gray-200">
              <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-orange-600 transition-colors">
                📊 Ver Análise Detalhada
              </summary>
              <div className="mt-3 space-y-2">
                {Object.entries(analysis.graus).map(([estado, valor]) => {
                  const percent = Math.round(valor * 100);
                  return (
                    <div key={estado}>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span className="capitalize">{estado}</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-400"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </details>

            {/* Explicação */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <div className="text-lg">💡</div>
                <div className="text-xs text-gray-700">
                  <span className="font-semibold">Como funciona:</span> O
                  sistema analisou seu estado emocional usando lógica fuzzy,
                  identificando os estados mais relevantes e gerando uma
                  recomendação personalizada com{" "}
                  <span className={confiancaLevel.color}>
                    {confiancaPercent}% de confiança
                  </span>
                  .
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// COMPONENTE COMPACTO (Versão alternativa)

export function EmotionalAnalysisCompact({
  analysis,
  className = "",
}: {
  analysis: FuzzyAnalysisResult;
  className?: string;
}) {
  const intentionColor = EmotionalService.getIntentionColor(analysis.intencao);
  const confiancaPercent = Math.round(analysis.confianca * 100);

  return (
    <div
      className={`flex items-center gap-3 bg-white rounded-lg p-4 border-2 border-gray-200 ${className}`}
    >
      <div
        className={`w-10 h-10 rounded-full ${intentionColor.tailwind} flex items-center justify-center text-xl`}
      >
        {intentionColor.emoji}
      </div>
      <div className="flex-1">
        <div className="font-bold text-gray-800">{analysis.intencao}</div>
        <div className="text-xs text-gray-600">{analysis.descricao}</div>
      </div>
      <div className="text-right">
        <div className="text-xl font-bold text-gray-800">
          {confiancaPercent}%
        </div>
        <div className="text-xs text-gray-600">confiança</div>
      </div>
    </div>
  );
}
