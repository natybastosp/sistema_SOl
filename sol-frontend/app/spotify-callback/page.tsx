/**
 * Página de callback para autorização Spotify
 * Frontend é redirecionado aqui após user autorizar no Spotify
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { handleSpotifyCallback } from "@/app/services/spotifyServiceV2";

export default function SpotifyCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log("📝 Processando callback do Spotify...");

        const result = await handleSpotifyCallback();

        if (result.success) {
          console.log("✅ Spotify autorizado com sucesso!");

          // Aguardar 2 segundos para o user ver a mensagem
          await new Promise((resolve) => setTimeout(resolve, 2000));

          // Redirecionar para dashboard
          router.push("/dashboard");
        } else {
          setError(result.error || "Erro ao autorizar");
          console.error("❌ Erro:", result.error);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);
        console.error("❌ Erro ao processar callback:", err);
      } finally {
        setLoading(false);
      }
    };

    processCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        {loading ? (
          <div>
            <div className="w-12 h-12 border-4 border-green-200 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Processando Autorização...
            </h1>
            <p className="text-gray-600">
              Aguarde enquanto sincronizamos sua conta Spotify
            </p>
          </div>
        ) : error ? (
          <div>
            <div className="text-4xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Erro na Autorização
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Voltar para Dashboard
            </button>
          </div>
        ) : (
          <div>
            <div className="text-4xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-green-600 mb-4">
              Spotify Autorizado!
            </h1>
            <p className="text-gray-600 mb-6">
              Sua conta Spotify foi conectada com sucesso
            </p>
            <p className="text-sm text-gray-500">
              Redirecionando para o dashboard...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
