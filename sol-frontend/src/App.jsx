import React, { useState } from "react";
import {
  Play,
  Pause,
  SkipForward,
  ThumbsUp,
  ThumbsDown,
  Music,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ============================================
// CONSTANTS & DATA
// ============================================

const GENRES = ["rock", "funk", "rap", "samba", "sertanejo"];

const EMOTIONS = [
  { name: "Tristeza", key: "sadness", color: "bg-blue-500" },
  { name: "Ansiedade", key: "anxiety", color: "bg-orange-500" },
  { name: "Alegria", key: "joy", color: "bg-yellow-500" },
  { name: "Raiva", key: "anger", color: "bg-red-500" },
  { name: "Calma", key: "calm", color: "bg-green-500" },
];

const SAMPLE_TRACKS = [
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

const PAGES = {
  LOGIN: "login",
  PREFERENCES: "preferences",
  EMOTIONAL: "emotional-assessment",
  PLAYLIST: "playlist",
  DASHBOARD: "dashboard",
};

// ============================================
// SHARED COMPONENTS
// ============================================

const Header = ({ pageTitle }) => (
  <div className="bg-white shadow-sm p-4">
    <div className="max-w-6xl mx-auto flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-800">SOL</h1>
      <div className="text-sm text-gray-500">{pageTitle}</div>
    </div>
  </div>
);

const SunLogo = ({ size = "large" }) => {
  const sizes = {
    large: { container: "w-32 h-32", icon: "w-16 h-16" },
    medium: { container: "w-24 h-24", icon: "w-12 h-12" },
    small: { container: "w-16 h-16", icon: "w-8 h-8" },
  };

  const { container, icon } = sizes[size];

  return (
    <div
      className={`${container} bg-gradient-to-br from-orange-300 to-orange-400 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg`}
    >
      <Sun className={`${icon} text-white`} />
    </div>
  );
};

const PageContainer = ({ children, gradient = false }) => (
  <div
    className={`min-h-screen flex flex-col ${gradient ? "bg-gradient-to-br from-orange-50 to-orange-100" : "bg-gray-100"}`}
  >
    {children}
  </div>
);

const CenteredCard = ({ children, maxWidth = "max-w-md" }) => (
  <div className="flex-1 flex items-center justify-center p-8">
    <div className={`${maxWidth} w-full`}>{children}</div>
  </div>
);

// ============================================
// LOGIN PAGE
// ============================================

const SocialButton = ({ onClick, icon, text }) => (
  <Button
    onClick={onClick}
    variant="outline"
    className="w-full flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
  >
    {icon}
    {text}
  </Button>
);

const LoginPage = ({
  userData,
  password,
  onUpdateUser,
  onUpdatePassword,
  onLogin,
  onGoogleLogin,
  onFacebookLogin,
}) => (
  <PageContainer gradient>
    <Header pageTitle="login" />
    <CenteredCard>
      <div className="text-center mb-8">
        <SunLogo size="large" />
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Bem-vindo ao SOL
        </h2>
        <p className="text-gray-600">Faça login para continuar</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 border border-orange-100">
        <div className="space-y-6">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email ou nome de usuário
            </label>
            <input
              type="text"
              value={userData.name}
              onChange={(e) => onUpdateUser({ name: e.target.value })}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-base"
              placeholder="Digite seu email ou usuário"
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => onUpdatePassword(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-base"
              placeholder="Digite sua senha"
            />
            <div className="text-right mt-2">
              <button className="text-sm text-orange-500 hover:text-orange-600 transition-colors font-medium">
                Esqueceu a senha?
              </button>
            </div>
          </div>

          {/* Login Button */}
          <Button
            onClick={onLogin}
            disabled={!userData.name.trim() || !password.trim()}
            className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white py-4 rounded-xl font-semibold text-lg hover:from-orange-500 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg transform hover:scale-105 disabled:hover:scale-100"
          >
            Entrar
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">
                ou continue com
              </span>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="space-y-3">
            <SocialButton
              onClick={onGoogleLogin}
              text="Continuar com Google"
              icon={
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              }
            />

            <SocialButton
              onClick={onFacebookLogin}
              text="Continuar com Facebook"
              icon={
                <svg
                  className="w-5 h-5 mr-3"
                  fill="#1877F2"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              }
            />
          </div>

          {/* Sign Up Link */}
          <div className="text-center pt-4">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{" "}
              <button className="text-orange-500 hover:text-orange-600 font-medium transition-colors">
                Criar conta
              </button>
            </p>
          </div>
        </div>
      </div>
    </CenteredCard>
  </PageContainer>
);

// ============================================
// PREFERENCES PAGE
// ============================================

const GenreButton = ({ genre, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`p-4 rounded-lg border-2 transition-all ${
      isSelected
        ? "border-orange-400 bg-orange-50 text-orange-700"
        : "border-gray-200 bg-white text-gray-700 hover:border-orange-200"
    }`}
  >
    <Music className="w-6 h-6 mx-auto mb-2" />
    <span className="text-sm font-medium">{genre}</span>
  </button>
);

const PreferencesPage = ({ userData, onUpdatePreferences, onContinue }) => {
  const toggleGenre = (genre) => {
    const newPrefs = userData.preferences.includes(genre)
      ? userData.preferences.filter((p) => p !== genre)
      : [...userData.preferences, genre];
    onUpdatePreferences(newPrefs);
  };

  return (
    <PageContainer>
      <Header pageTitle="cadastro" />
      <CenteredCard maxWidth="max-w-2xl">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {GENRES.map((genre) => (
              <GenreButton
                key={genre}
                genre={genre}
                isSelected={userData.preferences.includes(genre)}
                onClick={() => toggleGenre(genre)}
              />
            ))}
          </div>

          <div className="text-center">
            <Button
              onClick={onContinue}
              disabled={userData.preferences.length === 0}
              className="bg-orange-400 text-white px-12 py-3 rounded-lg font-semibold hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuar
            </Button>
          </div>
        </div>
      </CenteredCard>
    </PageContainer>
  );
};

// ============================================
// EMOTIONAL ASSESSMENT PAGE
// ============================================

const EmotionSlider = ({ emotion, value, onChange }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <span className="text-lg font-medium text-gray-700">{emotion.name}</span>
      <span className="text-sm text-gray-500">{value || 0}/10</span>
    </div>

    <input
      type="range"
      min="0"
      max="10"
      value={value || 0}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      style={{
        background: `linear-gradient(to right, #fb923c 0%, #fb923c ${(value || 0) * 10}%, #e5e7eb ${(value || 0) * 10}%, #e5e7eb 100%)`,
      }}
    />
  </div>
);

const EmotionalAssessmentPage = ({
  userData,
  onUpdateEmotion,
  onGeneratePlaylist,
}) => {
  const hasEmotions = Object.values(userData.emotionalState).some(
    (value) => value > 0
  );

  return (
    <PageContainer>
      <Header pageTitle="IA" />
      <CenteredCard maxWidth="max-w-2xl">
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
              <EmotionSlider
                key={emotion.key}
                emotion={emotion}
                value={userData.emotionalState[emotion.key]}
                onChange={(value) => onUpdateEmotion(emotion.key, value)}
              />
            ))}
          </div>

          <div className="text-center mt-8">
            <Button
              onClick={onGeneratePlaylist}
              disabled={!hasEmotions}
              className="bg-orange-400 text-white px-12 py-3 rounded-lg font-semibold hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Gerar Playlist
            </Button>
          </div>
        </div>
      </CenteredCard>
    </PageContainer>
  );
};

// ============================================
// PLAYLIST PAGE
// ============================================

const TrackItem = ({ track, isActive, onClick }) => (
  <div
    onClick={onClick}
    className={`p-3 rounded-lg cursor-pointer transition-colors ${
      isActive
        ? "bg-orange-50 border border-orange-200"
        : "bg-gray-50 hover:bg-gray-100"
    }`}
  >
    <div className="font-medium text-sm text-gray-800">{track.title}</div>
    <div className="text-xs text-gray-600">{track.artist}</div>
    <div className="text-xs text-gray-500">{track.duration}</div>
  </div>
);

const PlaylistPage = ({
  playlist,
  currentTrack,
  isPlaying,
  feedback,
  onPlayPause,
  onNext,
  onFeedback,
  onSelectTrack,
  onFinalFeedback,
}) => {
  const track = playlist[currentTrack];

  return (
    <PageContainer>
      <Header pageTitle="IA com playlist" />
      <div className="flex-1 flex p-8">
        <div className="max-w-6xl w-full mx-auto flex gap-8">
          {/* Player */}
          <div className="flex-1">
            <div className="text-center mb-8">
              <SunLogo size="large" />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-8">
              {track && (
                <>
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {track.title}
                    </h3>
                    <p className="text-gray-600">{track.artist}</p>
                    <p className="text-sm text-gray-500">{track.duration}</p>
                  </div>

                  <div className="flex justify-center items-center space-x-4 mb-6">
                    <Button
                      onClick={onPlayPause}
                      className="bg-orange-400 text-white p-4 rounded-full hover:bg-orange-500 transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6" />
                      )}
                    </Button>

                    <Button
                      onClick={onNext}
                      disabled={currentTrack >= playlist.length - 1}
                      variant="outline"
                      className="p-4 rounded-full"
                    >
                      <SkipForward className="w-6 h-6" />
                    </Button>
                  </div>

                  <div className="flex justify-center space-x-4">
                    <Button
                      onClick={() => onFeedback(track.id, "positive")}
                      variant={
                        feedback[track.id] === "positive"
                          ? "default"
                          : "outline"
                      }
                      className="flex items-center space-x-2"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>Gostei</span>
                    </Button>

                    <Button
                      onClick={() => onFeedback(track.id, "negative")}
                      variant={
                        feedback[track.id] === "negative"
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

          {/* Playlist Sidebar */}
          <div className="w-80">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Sua Playlist
              </h3>

              <div className="space-y-3">
                {playlist.map((track, index) => (
                  <TrackItem
                    key={track.id}
                    track={track}
                    isActive={index === currentTrack}
                    onClick={() => onSelectTrack(index)}
                  />
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
                      onClick={() => onFinalFeedback(emotion.key)}
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
    </PageContainer>
  );
};

// ============================================
// DASHBOARD PAGE
// ============================================

const StatCard = ({ title, value }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-3xl font-bold text-orange-500">{value}</p>
  </div>
);

const SessionCard = ({ session, index }) => (
  <div className="border border-gray-200 rounded-lg p-4">
    <div className="flex justify-between items-start mb-2">
      <span className="font-medium text-gray-800">Sessão {index + 1}</span>
      <span className="text-sm text-gray-500">{session.date}</span>
    </div>
    <div className="text-sm text-gray-600">
      <p>Músicas ouvidas: {session.tracksPlayed}</p>
      <p>Avaliações positivas: {session.satisfaction}</p>
    </div>
  </div>
);

const DashboardPage = ({ history, onNewSession }) => {
  const totalTracks = history.reduce(
    (acc, entry) => acc + entry.tracksPlayed,
    0
  );
  const avgSatisfaction =
    history.length > 0
      ? Math.round(
          (history.reduce((acc, entry) => acc + entry.satisfaction, 0) /
            history.length) *
            100
        ) / 100
      : 0;

  return (
    <PageContainer>
      <Header pageTitle="dashboard" />
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <SunLogo size="medium" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Seu Dashboard
            </h2>
            <p className="text-gray-600">Acompanhe seu progresso emocional</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard title="Sessões Totais" value={history.length} />
            <StatCard title="Músicas Ouvidas" value={totalTracks} />
            <StatCard title="Satisfação Média" value={avgSatisfaction} />
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Histórico de Sessões
            </h3>

            {history.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhuma sessão registrada ainda.
              </p>
            ) : (
              <div className="space-y-4">
                {history.map((session, index) => (
                  <SessionCard key={index} session={session} index={index} />
                ))}
              </div>
            )}

            <div className="text-center mt-6">
              <Button
                onClick={onNewSession}
                className="bg-orange-400 text-white px-8 py-2 rounded-lg font-semibold hover:bg-orange-500 transition-colors"
              >
                Nova Sessão
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

// ============================================
// MAIN APP COMPONENT
// ============================================

const SolMusicSystem = () => {
  const [currentPage, setCurrentPage] = useState(PAGES.LOGIN);
  const [userData, setUserData] = useState({
    name: "",
    preferences: [],
    emotionalState: {},
  });
  const [password, setPassword] = useState("");
  const [currentPlaylist, setCurrentPlaylist] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedback, setFeedback] = useState({});
  const [emotionalHistory, setEmotionalHistory] = useState([]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleLogin = () => {
    if (userData.name.trim() && password.trim()) {
      setCurrentPage(PAGES.PREFERENCES);
    }
  };

  const handleSocialLogin = (provider) => {
    setUserData((prev) => ({ ...prev, name: `Usuário ${provider}` }));
    setCurrentPage(PAGES.PREFERENCES);
  };

  const handlePreferences = () => {
    if (userData.preferences.length > 0) {
      setCurrentPage(PAGES.EMOTIONAL);
    }
  };

  const generatePlaylist = () => {
    const dominantEmotion = Object.entries(userData.emotionalState).reduce(
      (a, b) =>
        userData.emotionalState[a[0]] > userData.emotionalState[b[0]] ? a : b
    )[0];

    const filteredTracks = SAMPLE_TRACKS.filter(
      (track) => track.emotion === dominantEmotion || track.emotion === "calm"
    );

    setCurrentPlaylist(filteredTracks);
    setCurrentTrack(0);
    setCurrentPage(PAGES.PLAYLIST);
  };

  const submitFinalFeedback = (finalEmotion) => {
    const newEntry = {
      date: new Date().toLocaleDateString(),
      initialEmotion: userData.emotionalState,
      finalEmotion: finalEmotion,
      tracksPlayed: currentPlaylist.length,
      satisfaction: Object.values(feedback).filter((f) => f === "positive")
        .length,
    };

    setEmotionalHistory((prev) => [...prev, newEntry]);
    setCurrentPage(PAGES.DASHBOARD);
  };

  // ============================================
  // RENDER
  // ============================================

  const pages = {
    [PAGES.LOGIN]: (
      <LoginPage
        userData={userData}
        password={password}
        onUpdateUser={(updates) =>
          setUserData((prev) => ({ ...prev, ...updates }))
        }
        onUpdatePassword={setPassword}
        onLogin={handleLogin}
        onGoogleLogin={() => handleSocialLogin("Google")}
        onFacebookLogin={() => handleSocialLogin("Facebook")}
      />
    ),
    [PAGES.PREFERENCES]: (
      <PreferencesPage
        userData={userData}
        onUpdatePreferences={(prefs) =>
          setUserData((prev) => ({ ...prev, preferences: prefs }))
        }
        onContinue={handlePreferences}
      />
    ),
    [PAGES.EMOTIONAL]: (
      <EmotionalAssessmentPage
        userData={userData}
        onUpdateEmotion={(key, value) =>
          setUserData((prev) => ({
            ...prev,
            emotionalState: { ...prev.emotionalState, [key]: value },
          }))
        }
        onGeneratePlaylist={generatePlaylist}
      />
    ),
    [PAGES.PLAYLIST]: (
      <PlaylistPage
        playlist={currentPlaylist}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        feedback={feedback}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onNext={() =>
          currentTrack < currentPlaylist.length - 1 &&
          setCurrentTrack(currentTrack + 1)
        }
        onFeedback={(trackId, rating) =>
          setFeedback((prev) => ({ ...prev, [trackId]: rating }))
        }
        onSelectTrack={setCurrentTrack}
        onFinalFeedback={submitFinalFeedback}
      />
    ),
    [PAGES.DASHBOARD]: (
      <DashboardPage
        history={emotionalHistory}
        onNewSession={() => setCurrentPage(PAGES.EMOTIONAL)}
      />
    ),
  };

  return pages[currentPage] || pages[PAGES.LOGIN];
};

export default SolMusicSystem;
