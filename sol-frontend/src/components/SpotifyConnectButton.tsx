import { useState, useEffect } from 'react';
import { spotifyService } from '@/services/spotifyService';

export function SpotifyConnectButton() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar status ao carregar o componente
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  // Verificar se já está conectado
  const checkConnectionStatus = async () => {
    try {
      setIsLoading(true);
      const status = await spotifyService.getStatus();
      setIsConnected(status.connected && status.tokenValid);
    } catch (err) {
      console.error('Erro ao verificar status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Iniciar processo de conexão
  const handleConnect = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Pegar URL de autorização
      const { authUrl, stateToken } = await spotifyService.connectSpotify();

      // Guardar stateToken no sessionStorage para validar depois
      sessionStorage.setItem('spotify_state_token', stateToken);

      // Redirecionar para página de autorização do Spotify
      window.location.href = authUrl;
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  // Desconectar
  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      await spotifyService.disconnect();
      setIsConnected(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <button 
        disabled 
        className="px-6 py-3 bg-gray-400 text-white rounded-lg"
      >
        Carregando...
      </button>
    );
  }

  if (isConnected) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-green-600">
          <span className="text-2xl">✓</span>
          <span className="font-semibold">Spotify Conectado</span>
        </div>
        <button
          onClick={handleDisconnect}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Desconectar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleConnect}
        className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold flex items-center gap-2"
      >
        <span className="text-xl">🎵</span>
        Conectar com Spotify
      </button>
      
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
      
      <p className="text-gray-600 text-xs">
        * Requer Spotify Premium para usar o player
      </p>
    </div>
  );
}