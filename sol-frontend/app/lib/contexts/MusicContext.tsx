// sol-frontend/app/lib/contexts/MusicContext.tsx

import { createContext, useContext, useState, ReactNode } from 'react';

interface Music {
  id: string;
  title: string;
  artist: string;
  genre: string;
  previewUrl?: string;
  albumArt?: string;
}

interface MusicContextType {
  playlist: Music[];
  currentTrack: Music | null;
  isPlaying: boolean;
  setPlaylist: (tracks: Music[]) => void;
  play: (track: Music) => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: ReactNode }) {
  const [playlist, setPlaylist] = useState<Music[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Music | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const play = (track: Music) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    
    // Encontrar índice na playlist
    const index = playlist.findIndex(t => t.id === track.id);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  };

  const pause = () => {
    setIsPlaying(false);
  };

  const next = () => {
    if (currentIndex < playlist.length - 1) {
      const nextTrack = playlist[currentIndex + 1];
      play(nextTrack);
    }
  };

  const previous = () => {
    if (currentIndex > 0) {
      const prevTrack = playlist[currentIndex - 1];
      play(prevTrack);
    }
  };

  return (
    <MusicContext.Provider 
      value={{ 
        playlist, 
        currentTrack, 
        isPlaying, 
        setPlaylist, 
        play, 
        pause, 
        next, 
        previous 
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within MusicProvider');
  }
  return context;
}