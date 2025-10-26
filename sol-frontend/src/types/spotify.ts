// Tipos para trabalhar com Spotify no frontend

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: string;
  album: string;
  albumCover: string;
  duration: number;
  progress: number;
  uri: string;
}

export interface SpotifyPlayerState {
  isPlaying: boolean;
  track: SpotifyTrack | null;
  position: number;
  duration: number;
}

export interface SpotifyAuthStatus {
  connected: boolean;
  spotifyUserId: string | null;
  tokenValid: boolean;
}

// Tipo global do SDK do Spotify
declare global {
  interface Window {
    Spotify: any;
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}