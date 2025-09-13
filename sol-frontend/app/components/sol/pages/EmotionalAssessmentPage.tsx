import { Button } from "~/components/ui/button";
import Header from "../Header";
import SunLogo from "../SunLogo";
import type { UserData } from "~/types/sol";
import { EMOTIONS, PAGES } from "~/constants/sol";

interface EmotionalAssessmentPageProps {
  userData: UserData;
  setUserData: (userData: UserData | ((prev: UserData) => UserData)) => void;
  setCurrentPage: (page: string) => void;
  onGeneratePlaylist: () => void;
}

export default function EmotionalAssessmentPage({
  userData,
  setUserData,
  setCurrentPage,
  onGeneratePlaylist,
}: EmotionalAssessmentPageProps) {
  const handleEmotionalAssessment = () => {
    const hasEmotions = Object.values(userData.emotionalState).some(
      (value) => value > 0
    );
    if (hasEmotions) {
      onGeneratePlaylist();
      setCurrentPage(PAGES.PLAYLIST);
    }
  };

  const updateEmotionalState = (emotionKey: string, value: number) => {
    setUserData((prev) => ({
      ...prev,
      emotionalState: {
        ...prev.emotionalState,
        [emotionKey]: value,
      },
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex flex-col">
      <Header pageTitle="IA" />

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <SunLogo size="large" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Como posso te ajudar?
            </h2>
            <p className="text-gray-600">
              Avalie como você está se sentindo agora
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="space-y-8">
              {EMOTIONS.map((emotion) => (
                <div key={emotion.key} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-gray-700">
                      {emotion.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {userData.emotionalState[emotion.key] || 0}/10
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={userData.emotionalState[emotion.key] || 0}
                      onChange={(e) =>
                        updateEmotionalState(
                          emotion.key,
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #fb923c 0%, #fb923c ${(userData.emotionalState[emotion.key] || 0) * 10}%, #e5e7eb ${(userData.emotionalState[emotion.key] || 0) * 10}%, #e5e7eb 100%)`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button
                onClick={handleEmotionalAssessment}
                className="bg-orange-400 text-white px-12 py-3 rounded-lg font-semibold hover:bg-orange-500 transition-colors"
              >
                Gerar Playlist
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
