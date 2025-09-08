export interface UserData {
  name: string;
  preferences: string[];
  emotionalState: Record<string, number>;
}

export interface Track {
  id: number;
  title: string;
  artist: string;
  duration: string;
  emotion: string;
}

export interface EmotionalHistoryEntry {
  date: string;
  initialEmotion: Record<string, number>;
  finalEmotion: string;
  tracksPlayed: number;
  satisfaction: number;
}

export interface Emotion {
  name: string;
  key: string;
  color: string;
}

export interface SolContextType {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  userData: UserData;
  setUserData: (userData: UserData | ((prev: UserData) => UserData)) => void;
  currentPlaylist: Track[];
  setCurrentPlaylist: (playlist: Track[]) => void;
  currentTrack: number;
  setCurrentTrack: (track: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  feedback: Record<number, string>;
  setFeedback: (
    feedback:
      | Record<number, string>
      | ((prev: Record<number, string>) => Record<number, string>)
  ) => void;
  emotionalHistory: EmotionalHistoryEntry[];
  setEmotionalHistory: (
    history:
      | EmotionalHistoryEntry[]
      | ((prev: EmotionalHistoryEntry[]) => EmotionalHistoryEntry[])
  ) => void;
  password: string;
  setPassword: (password: string) => void;
}
