import { Music } from "lucide-react";
import { Button } from "~/components/ui/button";
import Header from "../Header";
import SunLogo from "../SunLogo";
import type { UserData } from "~/types/sol";
import { GENRES, PAGES } from "~/constants/sol";

interface PreferencesPageProps {
  userData: UserData;
  setUserData: (userData: UserData | ((prev: UserData) => UserData)) => void;
  setCurrentPage: (page: string) => void;
}

export default function PreferencesPage({
  userData,
  setUserData,
  setCurrentPage,
}: PreferencesPageProps) {
  const handlePreferences = () => {
    if (userData.preferences.length > 0) {
      setCurrentPage(PAGES.EMOTIONAL_ASSESSMENT);
    }
  };

  const toggleGenre = (genre: string) => {
    const newPrefs = userData.preferences.includes(genre)
      ? userData.preferences.filter((p) => p !== genre)
      : [...userData.preferences, genre];
    setUserData((prev) => ({ ...prev, preferences: newPrefs }));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header pageTitle="cadastro" />

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <SunLogo size="large" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Página de cadastro
            </h2>
            <p className="text-gray-600">
              Selecione seus gêneros musicais preferidos
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {GENRES.map((genre) => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    userData.preferences.includes(genre)
                      ? "border-orange-400 bg-orange-50 text-orange-700"
                      : "border-gray-200 bg-white text-gray-700 hover:border-orange-200"
                  }`}
                >
                  <Music className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">{genre}</span>
                </button>
              ))}
            </div>

            <div className="text-center">
              <Button
                onClick={handlePreferences}
                disabled={userData.preferences.length === 0}
                className="bg-orange-400 text-white px-12 py-3 rounded-lg font-semibold hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
