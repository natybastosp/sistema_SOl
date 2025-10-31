import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import type { MusicTrack, PlaylistStats } from "~/services/emotionalService";
import { EmotionalService } from "~/services/emotionalService";

// PROPS

interface PlaylistDetailViewProps {
  playlist: MusicTrack[];
  stats: PlaylistStats;
  onPlayTrack?: (track: MusicTrack) => void;
  onFeedback?: (trackId: string, liked: boolean) => void;
  className?: string;
}

// COMPONENTE INDIVIDUAL DE MÚSICA

function MusicTrackItem({
  track,
  onPlay,
  onFeedback,
}: {
  track: MusicTrack;
  onPlay?: (track: MusicTrack) => void;
  onFeedback?: (trackId: string, liked: boolean) => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  // Score emocional dominante
  const dominantEmotion = Object.entries(track.scores).sort(
    ([, a], [, b]) => b - a
  )[0];

  const emotionEmojis: Record<string, string> = {
    joy: "😊",
    sadness: "😢",
    anger: "😠",
    fear: "😨",
    surprise: "😲",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-orange-300 transition-all">
      {/* HEADER - Informações Básicas */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          {/* Esquerda - Info da Música */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-500 min-w-[24px]">
                {track.position}.
              </span>
              <div>
                <h4 className="font-bold text-gray-800 line-clamp-1">
                  {track.name}
                </h4>
                <p className="text-sm text-gray-600 line-clamp-1">
                  {track.artist}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2 ml-8">
              <Badge variant="outline" className="text-xs">
                {track.genre}
              </Badge>
              <span className="text-xs text-gray-500">
                {EmotionalService.formatDuration(track.duration)}
              </span>
              <Badge className="text-xs">
                {emotionEmojis[dominantEmotion[0]]} {dominantEmotion[0]}
              </Badge>
            </div>
          </div>

          {/* Direita - Ações */}
          <div className="flex flex-col gap-2 ml-4">
            {onPlay && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onPlay(track)}
                className="whitespace-nowrap"
              >
                ▶️ Play
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs"
            >
              {showDetails ? "▲ Menos" : "▼ Mais"}
            </Button>
          </div>
        </div>
      </div>

      {/* DETALHES EXPANDIDOS */}
      {showDetails && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          {/* Scores Emocionais */}
          <div className="mb-4">
            <div className="text-xs font-semibold text-gray-700 mb-2">
              📊 Scores Emocionais:
            </div>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(track.scores).map(([emotion, score]) => {
                const percent = Math.round((score / 10) * 100);
                return (
                  <div key={emotion} className="text-center">
                    <div className="text-lg mb-1">{emotionEmojis[emotion]}</div>
                    <div className="text-xs font-medium capitalize">
                      {emotion}
                    </div>
                    <div className="text-xs text-gray-600">
                      {score.toFixed(1)}
                    </div>
                    <div className="w-full h-1 bg-gray-200 rounded-full mt-1">
                      <div
                        className="h-full bg-orange-500 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Características de Áudio */}
          <div>
            <div className="text-xs font-semibold text-gray-700 mb-2">
              🎼 Características de Áudio:
            </div>
            <div className="grid grid-cols-2 gap-3">
              {/* Energia */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">⚡ Energia</span>
                  <span className="font-medium">
                    {Math.round(track.audioFeatures.energy * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{
                      width: `${track.audioFeatures.energy * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Valência (Positividade) */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">😊 Valência</span>
                  <span className="font-medium">
                    {Math.round(track.audioFeatures.valence * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-yellow-500 rounded-full"
                    style={{
                      width: `${track.audioFeatures.valence * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Dançabilidade */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">💃 Dançabilidade</span>
                  <span className="font-medium">
                    {Math.round(track.audioFeatures.danceability * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{
                      width: `${track.audioFeatures.danceability * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Acústica */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">🎸 Acústica</span>
                  <span className="font-medium">
                    {Math.round(track.audioFeatures.acousticness * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${track.audioFeatures.acousticness * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Feedback (se disponível) */}
          {onFeedback && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-600 mb-2">
                Gostou desta música?
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onFeedback(track.id, true)}
                  className="flex-1"
                >
                  👍 Sim
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onFeedback(track.id, false)}
                  className="flex-1"
                >
                  👎 Não
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// COMPONENTE PRINCIPAL - PLAYLIST COMPLETA

export default function PlaylistDetailView({
  playlist,
  stats,
  onPlayTrack,
  onFeedback,
  className = "",
}: PlaylistDetailViewProps) {
  const [expandAll, setExpandAll] = useState(false);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* ESTATÍSTICAS DA PLAYLIST */}
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>📊 Estatísticas da Playlist</span>
            <Badge variant="secondary" className="text-sm">
              {stats.totalMusicas} músicas
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Duração Total */}
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">⏱️</div>
              <div className="text-lg font-bold text-gray-800">
                {stats.duracaoMinutos} min
              </div>
              <div className="text-xs text-gray-600">Duração Total</div>
            </div>

            {/* Energia Média */}
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">⚡</div>
              <div className="text-lg font-bold text-gray-800">
                {Math.round(stats.energiaMedia * 100)}%
              </div>
              <div className="text-xs text-gray-600">Energia Média</div>
            </div>

            {/* Positividade Média */}
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">😊</div>
              <div className="text-lg font-bold text-gray-800">
                {Math.round(stats.valenciaMedia * 100)}%
              </div>
              <div className="text-xs text-gray-600">Positividade</div>
            </div>

            {/* Alegria Média */}
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">🎉</div>
              <div className="text-lg font-bold text-gray-800">
                {stats.alegriaMedia.toFixed(1)}/10
              </div>
              <div className="text-xs text-gray-600">Alegria Média</div>
            </div>

            {/* Tristeza Média */}
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">😢</div>
              <div className="text-lg font-bold text-gray-800">
                {stats.tristezaMedia.toFixed(1)}/10
              </div>
              <div className="text-xs text-gray-600">Tristeza Média</div>
            </div>

            {/* Total de Músicas */}
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">🎵</div>
              <div className="text-lg font-bold text-gray-800">
                {stats.totalMusicas}
              </div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* LISTA DE MÚSICAS */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>🎵 Sua Playlist Personalizada</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setExpandAll(!expandAll)}
            >
              {expandAll ? "Minimizar Todos" : "Expandir Todos"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {playlist.map((track) => (
              <MusicTrackItem
                key={track.id}
                track={track}
                onPlay={onPlayTrack}
                onFeedback={onFeedback}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// EXPORT COMPONENTE COMPACTO (alternativa)

export function PlaylistCompactView({
  playlist,
  stats,
  onPlayTrack,
}: {
  playlist: MusicTrack[];
  stats: PlaylistStats;
  onPlayTrack?: (track: MusicTrack) => void;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-800">
            🎵 {stats.totalMusicas} Músicas
          </h3>
          <p className="text-sm text-gray-600">
            {stats.duracaoMinutos} minutos • Energia:{" "}
            {Math.round(stats.energiaMedia * 100)}%
          </p>
        </div>
      </div>
      <div className="space-y-2">
        {playlist.slice(0, 5).map((track) => (
          <div
            key={track.id}
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
          >
            <div className="flex-1">
              <div className="font-medium text-sm">{track.name}</div>
              <div className="text-xs text-gray-600">{track.artist}</div>
            </div>
            {onPlayTrack && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onPlayTrack(track)}
              >
                ▶️
              </Button>
            )}
          </div>
        ))}
        {playlist.length > 5 && (
          <div className="text-center text-xs text-gray-500 pt-2">
            +{playlist.length - 5} músicas
          </div>
        )}
      </div>
    </div>
  );
}
