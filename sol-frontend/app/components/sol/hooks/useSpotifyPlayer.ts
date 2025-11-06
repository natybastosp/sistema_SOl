import { useEffect, useState, useRef } from "react";
import { getSpotifyAccessToken } from "../../../services/spotifyServiceV2";

interface UseSpotifyPlayerReturn {
  deviceId: string;
  isConnected: boolean;
  playTrack: (trackUri: string) => Promise<boolean>;
  pausePlayback: () => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
}

export function useSpotifyPlayer(): UseSpotifyPlayerReturn {
  const [deviceId, setDeviceId] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const [token, setToken] = useState<string>("");
  const playerRef = useRef<any>(null);
  const tokenRef = useRef<string>("");

  // Obter token inicial e configurar renovação
  useEffect(() => {
    const initToken = async () => {
      try {
        const accessToken = await getSpotifyAccessToken();
        setToken(accessToken);
        tokenRef.current = accessToken;
        console.log("✅ Token Spotify obtido");
      } catch (error) {
        console.error("❌ Erro ao obter token:", error);
      }
    };

    initToken();

    // Renovar token a cada 50 minutos (token expira em 1 hora)
    const tokenRefreshInterval = setInterval(initToken, 50 * 60 * 1000);

    return () => clearInterval(tokenRefreshInterval);
  }, []);

  useEffect(() => {
    if (!token) return;

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "SoL Music Player",
        getOAuthToken: async (cb: (token: string) => void) => {
          // Se token foi renovado, usar o novo
          if (tokenRef.current) {
            cb(tokenRef.current);
          } else {
            try {
              const freshToken = await getSpotifyAccessToken();
              tokenRef.current = freshToken;
              cb(freshToken);
            } catch (error) {
              console.error("Erro ao renovar token para SDK:", error);
            }
          }
        },
        volume: 0.5,
      });

      playerRef.current = player;

      player.addListener("ready", ({ device_id }: { device_id: string }) => {
        console.log("✅ Spotify Player ready:", device_id);
        setDeviceId(device_id);
        setIsConnected(true);
      });

      player.addListener("not_ready", () => {
        console.log("❌ Spotify Player disconnected");
        setIsConnected(false);
      });

      player.connect();
    };

    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
      }
    };
  }, [token]);

  const playTrack = async (trackUri: string): Promise<boolean> => {
    if (!deviceId) {
      console.error("Device not ready");
      return false;
    }

    // VALIDAR URI ANTES DE ENVIAR
    if (!trackUri || typeof trackUri !== "string" || trackUri.trim() === "") {
      console.error("❌ Invalid track URI:", trackUri);
      throw new Error("Track URI is invalid or empty");
    }

    try {
      const solToken = localStorage.getItem("sol-auth-token");
      if (!solToken) {
        throw new Error("Not authenticated with SoL");
      }

      console.log("▶️  Playing track:", trackUri);

      const response = await fetch("/api/spotify/play", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${solToken}`,
        },
        body: JSON.stringify({
          uris: [trackUri],
          device_id: deviceId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Spotify API error:", errorData);
        throw new Error(`Failed to play: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error("❌ Error playing track:", error);
      throw error;
    }
  };

  const pausePlayback = async (): Promise<void> => {
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
    } catch (error) {
      console.error("Error pausing:", error);
    }
  };

  const nextTrack = async (): Promise<void> => {
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
    } catch (error) {
      console.error("Error next track:", error);
    }
  };

  const previousTrack = async (): Promise<void> => {
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
    } catch (error) {
      console.error("Error previous track:", error);
    }
  };

  return {
    deviceId,
    isConnected,
    playTrack,
    pausePlayback,
    nextTrack,
    previousTrack,
  };
}
