import { useState, useEffect } from 'react';
import { SpotifyConnectButton } from '@/components/SpotifyConnectButton';
import { SpotifyPlayer } from '@/components/SpotifyPlayer';
import { spotifyService } from '@/services/spotifyService';

export function Dashboard() {
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const [playlistToPlay, setPlaylistToPlay] = useState<string[]>([]);

  // Verificar status ao carregar
  useEffect(() => {
    checkSpotifyStatus();
  }, []);

  const checkSpotifyStatus = async () => {
    const status = await spotifyService.getStatus();
    setIsSpotifyConnected(status.connected);
  };

  // Função exemplo: quando o Fuzzy gerar uma playlist
  const handlePlayRecommendedPlaylist = (spotifyIds: string[]) => {
    // Converter IDs para URIs
    const uris = spotifyIds.map(id => `spotify:track:${id}`);
    setPlaylistToPlay(uris);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard SOL</h1>

      {/* Botão de Conexão */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Conectar Spotify</h2>
        <SpotifyConnectButton />
      </div>

      {/* Player (só aparece se conectado) */}
      {isSpotifyConnected && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Player</h2>
          <SpotifyPlayer initialTracks={playlistToPlay} />
        </div>
      )}

      {/* Suas outras seções do dashboard */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Recomendações</h2>
        {/* Seu sistema de recomendação aqui */}
      </div>
    </div>
  );
}