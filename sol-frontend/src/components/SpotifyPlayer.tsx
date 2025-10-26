import { useState, useEffect, useRef } from 'react';
import { spotifyService } from '@/services/spotifyService';

interface SpotifyPlayerProps {
  // URIs das músicas a tocar (opcional, pode ser passado depois)
  initialTracks?: string[];
}

export function SpotifyPlayer({ initialTracks }: SpotifyPlayerProps) {
  const [player, setPlayer] = useState<any>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Inicializar o player quando o componente montar
  useEffect(() => {
    initializePlayer();

    return () => {
      // Limpar player ao desmontar
      if (player) {
        player.disconnect();
      }
    };
  }, []);

  // Tocar músicas iniciais se fornecidas
  useEffect(() => {
    if (isReady && initialTracks && initialTracks.length > 0) {
      playTracks(initialTracks);
    }
  }, [isReady, initialTracks]);

  /**
   * Inicializar o Web Playback SDK do Spotify
   */
  const initializePlayer = async () => {
    try {
      // Verificar se o SDK está carregado
      if (!window.Spotify) {
        // Aguardar o SDK carregar
        window.onSpotifyWebPlaybackSDKReady = () => {
          setupPlayer();
        };
      } else {
        setupPlayer();
      }
    } catch (err: any) {
      console.error('Erro ao inicializar player:', err);
      setError(err.message);
    }
  };

  /**
   * Configurar o player do Spotify
   */
  const setupPlayer = async () => {
    try {
      // Obter token de acesso
      const token = await spotifyService.getPlayerToken();

      // Criar instância do player
      const spotifyPlayer = new window.Spotify.Player({
        name: 'SOL Player',
        getOAuthToken: (cb: (token: string) => void) => {
          cb(token);
        },
        volume: 0.8,
      });

      // Eventos do player
      spotifyPlayer.addListener('ready', ({ device_id }: any) => {
        console.log('✅ Player pronto! Device ID:', device_id);
        setDeviceId(device_id);
        setIsReady(true);
      });

      spotifyPlayer.addListener('not_ready', ({ device_id }: any) => {
        console.log('❌ Player não está pronto:', device_id);
        setIsReady(false);
      });

      spotifyPlayer.addListener('player_state_changed', (state: any) => {
        if (!state) return;

        const track = state.track_window.current_track;
        setCurrentTrack({
          name: track.name,
          artists: track.artists.map((a: any) => a.name).join(', '),
          album: track.album.name,
          albumCover: track.album.images[0]?.url,
          uri: track.uri,
        });

        setIsPlaying(!state.paused);
      });

      spotifyPlayer.addListener('initialization_error', ({ message }: any) => {
        console.error('Erro de inicialização:', message);
        setError('Erro ao inicializar player: ' + message);
      });

      spotifyPlayer.addListener('authentication_error', ({ message }: any) => {
        console.error('Erro de autenticação:', message);
        setError('Erro de autenticação. Reconecte sua conta Spotify');
      });

      spotifyPlayer.addListener('account_error', ({ message }: any) => {
        console.error('Erro de conta:', message);
        setError('Spotify Premium é necessário para usar o player');
      });

      // Conectar o player
      const connected = await spotifyPlayer.connect();

      if (connected) {
        console.log('🎵 Player conectado com sucesso!');
        setPlayer(spotifyPlayer);
      } else {
        setError('Não foi possível conectar o player');
      }
    } catch (err: any) {
      console.error('Erro ao configurar player:', err);
      setError(err.message);
    }
  };

  /**
   * Tocar lista de músicas
   */
  const playTracks = async (uris: string[]) => {
    try {
      if (!deviceId) {
        setError('Player não está pronto ainda');
        return;
      }

      await spotifyService.play(uris, deviceId);
      setIsPlaying(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  /**
   * Pausar reprodução
   */
  const handlePause = async () => {
    try {
      await player.pause();
      setIsPlaying(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  /**
   * Retomar reprodução
   */
  const handleResume = async () => {
    try {
      await player.resume();
      setIsPlaying(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  /**
   * Próxima música
   */
  const handleNext = async () => {
    try {
      await player.nextTrack();
    } catch (err: any) {
      setError(err.message);
    }
  };

  /**
   * Música anterior
   */
  const handlePrevious = async () => {
    try {
      await player.previousTrack();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p className="font-bold">Erro no Player</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
        <p className="flex items-center gap-2">
          <span className="animate-spin">⚙️</span>
          Inicializando player do Spotify...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      {/* Informações da música atual */}
      {currentTrack && (
        <div className="mb-4">
          {currentTrack.albumCover && (
            <img
              src={currentTrack.albumCover}
              alt={currentTrack.album}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          )}
          <h3 className="font-bold text-lg">{currentTrack.name}</h3>
          <p className="text-gray-600">{currentTrack.artists}</p>
          <p className="text-gray-500 text-sm">{currentTrack.album}</p>
        </div>
      )}

      {/* Controles */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handlePrevious}
          className="p-3 bg-gray-200 rounded-full hover:bg-gray-300 transition"
          title="Anterior"
        >
          ⏮️
        </button>

        {isPlaying ? (
          <button
            onClick={handlePause}
            className="p-4 bg-green-500 text-white rounded-full hover:bg-green-600 transition text-2xl"
            title="Pausar"
          >
            ⏸️
          </button>
        ) : (
          <button
            onClick={handleResume}
            className="p-4 bg-green-500 text-white rounded-full hover:bg-green-600 transition text-2xl"
            title="Tocar"
          >
            ▶️
          </button>
        )}

        <button
          onClick={handleNext}
          className="p-3 bg-gray-200 rounded-full hover:bg-gray-300 transition"
          title="Próxima"
        >
          ⏭️
        </button>
      </div>

      {/* Status */}
      <div className="mt-4 text-center text-sm text-gray-500">
        {isPlaying ? '▶️ Tocando' : '⏸️ Pausado'}
      </div>
    </div>
  );
}