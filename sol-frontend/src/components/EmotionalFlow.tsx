'use client';

import { useState } from 'react';
import { emotionalService, Recommendation } from '@/services/emotionalAnalysis';

const GENRES = [
  { value: 'rock', label: 'Rock' },
  { value: 'mpb', label: 'MPB' },
  { value: 'funk', label: 'Funk' },
  { value: 'sertanejo', label: 'Sertanejo' },
];

const MOOD_LABELS: { [key: number]: string } = {
  0: '😢 Muito Triste',
  1: '😔 Triste',
  2: '😕 Desanimado',
  3: '😐 Neutro Baixo',
  4: '🙂 Calmo',
  5: '😊 Neutro',
  6: '😃 Animado',
  7: '😄 Feliz',
  8: '🤩 Muito Feliz',
  9: '🎉 Eufórico',
  10: '🚀 Radiante',
};

export function EmotionalFlow() {
  const [emotionalState, setEmotionalState] = useState(5);
  const [genre, setGenre] = useState('');
  const [playlist, setPlaylist] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setPlaylist(null); // limpa resultados anteriores

    try {
      const result = await emotionalService.getRecommendation({
        mood: emotionalState,
        genre: genre || undefined, // se não escolher nenhum, envia undefined
      });

      setPlaylist(result);
    } catch (err: any) {
      setError(err.message || 'Erro desconhecido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* Cabeçalho */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">🎵 SOL Music</h1>
        <p className="text-gray-600">Sistema de Recomendação Musical por Emoção</p>
      </div>

      {/* Card Principal */}
      <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
        {/* Estado Emocional */}
        <div>
          <label className="block text-lg font-semibold mb-3">
            Como você está se sentindo?
          </label>
          <div className="text-center mb-4">
            <span className="text-3xl">{MOOD_LABELS[emotionalState]}</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={emotionalState}
            onChange={(e) => setEmotionalState(Number(e.target.value))}
            className="w-full h-2 bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>Triste (0)</span>
            <span>Feliz (10)</span>
          </div>
        </div>

        {/* Gênero Musical */}
        <div>
          <label className="block text-lg font-semibold mb-3">
            Gênero preferido (opcional)
          </label>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Deixar o SOL escolher</option>
            {GENRES.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>

        {/* Botão de Análise */}
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Analisando...
            </span>
          ) : (
            '🎵 Gerar Playlist Personalizada'
          )}
        </button>

        {/* Erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Resultado da Playlist */}
      {playlist && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold mb-4">🎧 Sua Playlist Personalizada</h3>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-600">Humor</p>
              <p className="text-lg font-semibold">{playlist.mood}</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-600">Gênero</p>
              <p className="text-lg font-semibold">{playlist.genre}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-semibold">Músicas recomendadas:</p>
            {playlist.playlist.map((song, index) => (
              <div key={index} className="bg-white p-3 rounded-lg flex items-center">
                <span className="text-blue-600 font-bold mr-3">{index + 1}</span>
                <span>{song}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
