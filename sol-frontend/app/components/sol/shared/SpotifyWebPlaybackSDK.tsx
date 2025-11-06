import { useEffect, useState, useRef } from "react";

interface SpotifyWebPlaybackSDKProps {
  token: string;
  onPlayerReady?: (deviceId: string) => void;
  onPlayerNotReady?: () => void;
}

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: (() => void) | undefined;
    Spotify: any;
  }
}

export default function SpotifyWebPlaybackSDK({
  token,
  onPlayerReady,
  onPlayerNotReady,
}: SpotifyWebPlaybackSDKProps) {
  const [deviceId, setDeviceId] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    // Carregar SDK do Spotify
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    // Callback quando SDK está pronto
    window.onSpotifyWebPlaybackSDKReady = () => {
      if (!token) return;

      const player = new window.Spotify.Player({
        name: "SoL Music Player",
        getOAuthToken: (cb: (token: string) => void) => {
          cb(token);
        },
        volume: 0.5,
      });

      playerRef.current = player;

      // Listener para quando player está pronto
      player.addListener("ready", ({ device_id }: { device_id: string }) => {
        console.log("✅ Spotify Player ready with device ID:", device_id);
        setDeviceId(device_id);
        setIsConnected(true);
        onPlayerReady?.(device_id);
      });

      // Listener para quando player não está disponível
      player.addListener(
        "not_ready",
        ({ device_id }: { device_id: string }) => {
          console.log("❌ Spotify Player not ready. Device ID:", device_id);
          setIsConnected(false);
          onPlayerNotReady?.();
        }
      );

      // Listener para erros
      player.addListener("initialization_error", ({ message }: any) => {
        console.error("Failed to initialize player", message);
      });

      player.addListener("authentication_error", ({ message }: any) => {
        console.error("Failed to authenticate", message);
      });

      player.addListener("account_error", ({ message }: any) => {
        console.error("Failed to validate account", message);
      });

      // Conectar player
      player.connect();
    };

    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
      }
    };
  }, [token, onPlayerReady, onPlayerNotReady]);

  // Função para tocar música/playlist
  const playTrack = async (trackUri: string | string[]) => {
    if (!deviceId) {
      console.error("Device not ready. Please wait...");
      return false;
    }

    try {
      const uris = Array.isArray(trackUri) ? trackUri : [trackUri];

      const response = await fetch("/api/spotify/play", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          uris,
          device_id: deviceId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to play: ${response.statusText}`);
      }

      console.log("✅ Playing track");
      return true;
    } catch (error) {
      console.error("Error playing track:", error);
      return false;
    }
  };

  // Função para pausar
  const pausePlayback = async () => {
    if (!deviceId) return;

    try {
      await fetch(
        `https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("⏸️ Paused");
    } catch (error) {
      console.error("Error pausing:", error);
    }
  };

  // Função para próxima música
  const nextTrack = async () => {
    if (!deviceId) return;

    try {
      await fetch(
        `https://api.spotify.com/v1/me/player/next?device_id=${deviceId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("⏭️ Next track");
    } catch (error) {
      console.error("Error next track:", error);
    }
  };

  // Função para música anterior
  const previousTrack = async () => {
    if (!deviceId) return;

    try {
      await fetch(
        `https://api.spotify.com/v1/me/player/previous?device_id=${deviceId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("⏮️ Previous track");
    } catch (error) {
      console.error("Error previous track:", error);
    }
  };

  // Exponhe as funções para usar em outros componentes
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current._playerControl = {
        play: playTrack,
        pause: pausePlayback,
        next: nextTrack,
        previous: previousTrack,
      };
    }
  }, [deviceId, token]);

  return (
    <div className="hidden">
      {isConnected && (
        <div className="text-xs text-green-600">
          Spotify conectado (ID: {deviceId.slice(0, 8)})
        </div>
      )}
    </div>
  );
}
