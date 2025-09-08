import type { Emotion, Track } from "~/types/sol";

export const GENRES = [
  "Rock",
  "Pop",
  "MPB",
  "Sertanejo",
  "Funk",
  "Jazz",
  "Clássica",
  "Eletrônica",
  "Reggae",
  "Hip Hop",
];

export const EMOTIONS: Emotion[] = [
  { name: "Tristeza", key: "sadness", color: "bg-blue-500" },
  { name: "Ansiedade", key: "anxiety", color: "bg-orange-500" },
  { name: "Alegria", key: "joy", color: "bg-yellow-500" },
  { name: "Raiva", key: "anger", color: "bg-red-500" },
  { name: "Calma", key: "calm", color: "bg-green-500" },
];

export const SAMPLE_TRACKS: Track[] = [
  {
    id: 1,
    title: "Música Relaxante 1",
    artist: "Artista Calmo",
    duration: "3:45",
    emotion: "calm",
  },
  {
    id: 2,
    title: "Energia Positiva",
    artist: "Artista Alegre",
    duration: "4:20",
    emotion: "joy",
  },
  {
    id: 3,
    title: "Reflexão Suave",
    artist: "Artista Contemplativo",
    duration: "5:10",
    emotion: "calm",
  },
  {
    id: 4,
    title: "Superação",
    artist: "Artista Motivacional",
    duration: "3:55",
    emotion: "joy",
  },
];

export const PAGES = {
  LOGIN: "login",
  PREFERENCES: "preferences",
  EMOTIONAL_ASSESSMENT: "emotional-assessment",
  PLAYLIST: "playlist",
  DASHBOARD: "dashboard",
} as const;
