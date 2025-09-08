import { Play, Pause, SkipForward, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "~/components/ui/button";
import Header from "../Header";
import SunLogo from "../SunLogo";
import type { Track } from "~/types/sol";
import { EMOTIONS, PAGES } from "~/constants/sol";

interface PlaylistPageProps {
  currentPlaylist: Track[];
  currentTrack: number;
  setCurrentTrack: (track: number) => void;
  isPlaying: boolean;
  togglePlayPause: () => void;
  nextTrack: () => void;
  feedback: Record<number, string>;
  handleTrackFeedback: (trackId: number, rating: string) => void;
  submitFinalFeedback: (finalEmotion: string) => void;
}

export default function PlaylistPage({
  currentPlaylist,
  currentTrack,
  setCurrentTrack,
  isPlaying,
  togglePlayPause,
  nextTrack,
  feedback,
  handleTrackFeedback,
  submitFinalFeedback,
}: PlaylistPageProps) {
  const currentSong = currentPlaylist[currentTrack];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header pageTitle="IA com playlist" />

      <div className="flex-1 flex p-8">
        <div className="max-w-6xl w-full mx-auto flex gap-8">
          {/* Left Side - Player */}
          <div className="flex-1">
            <div className="text-center mb-8">
              <SunLogo size="large" />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-8">
              {currentPlaylist.length > 0 && currentSong && (
                <>
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {currentSong.title}
                    </h3>
                    <p className="text-gray-600">{currentSong.artist}</p>
                    <p className="text-sm text-gray-500">
                      {currentSong.duration}
                    </p>
                  </div>

                  <div className="flex justify-center items-center space-x-4 mb-6">
                    <Button
                      onClick={togglePlayPause}
                      className="bg-orange-400 text-white p-4 rounded-full hover:bg-orange-500 transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6" />
                      )}
                    </Button>

                    <Button
                      onClick={nextTrack}
                      disabled={currentTrack >= currentPlaylist.length - 1}
                      variant="outline"
                      className="p-4 rounded-full"
                    >
                      <SkipForward className="w-6 h-6" />
                    </Button>
                  </div>

                  <div className="flex justify-center space-x-4">
                    <Button
                      onClick={() =>
                        handleTrackFeedback(currentSong.id, "positive")
                      }
                      variant={
                        feedback[currentSong.id] === "positive"
                          ? "default"
                          : "outline"
                      }
                      className="flex items-center space-x-2"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>Gostei</span>
                    </Button>

                    <Button
                      onClick={() =>
                        handleTrackFeedback(currentSong.id, "negative")
                      }
                      variant={
                        feedback[currentSong.id] === "negative"
                          ? "default"
                          : "outline"
                      }
                      className="flex items-center space-x-2"
                    >
                      <ThumbsDown className="w-4 h-4" />
                      <span>Não gostei</span>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Side - Playlist */}
          <div className="w-80">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Sua Playlist
              </h3>

              <div className="space-y-3">
                {currentPlaylist.map((track, index) => (
                  <div
                    key={track.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      index === currentTrack
                        ? "bg-orange-50 border border-orange-200"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                    onClick={() => setCurrentTrack(index)}
                  >
                    <div className="font-medium text-sm text-gray-800">
                      {track.title}
                    </div>
                    <div className="text-xs text-gray-600">{track.artist}</div>
                    <div className="text-xs text-gray-500">
                      {track.duration}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Como você se sente agora?
                </h4>
                <div className="space-y-2">
                  {EMOTIONS.map((emotion) => (
                    <Button
                      key={emotion.key}
                      onClick={() => submitFinalFeedback(emotion.key)}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      {emotion.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
