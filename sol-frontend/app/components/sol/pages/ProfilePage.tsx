import { useState } from "react";
import Header from "../Header";
import { PAGES } from "~/constants/sol";

interface ProfilePageProps {
  userData?: {
    name: string;
    email: string;
    preferences?: {
      genres?: string[];
      artists?: string[];
    };
  };
  setCurrentPage: (page: string) => void;
  setUserData: (userData: any) => void;
}

interface UserStats {
  totalSessions: number;
  totalMusic: number;
  favoriteGenre: string;
  favoriteEmotion: string;
  joinDate: string;
}

export default function ProfilePage({
  userData,
  setCurrentPage,
  setUserData,
}: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(userData?.name || "");
  const [editedEmail, setEditedEmail] = useState(userData?.email || "");
  const [editedGenres, setEditedGenres] = useState<string[]>(
    userData?.preferences?.genres || []
  );

  const [userStats] = useState<UserStats>({
    totalSessions: 12,
    totalMusic: 156,
    favoriteGenre: "rock",
    favoriteEmotion: "Alegria",
    joinDate: "2024-09-15",
  });

  const allGenres = ["rock", "funk", "rap", "samba", "sertanejo"];

  const handleSave = () => {
    if (setUserData) {
      setUserData({
        name: editedName,
        email: editedEmail,
        preferences: {
          ...userData?.preferences,
          genres: editedGenres,
        },
      });
    }
    setIsEditing(false);
  };

  const toggleGenre = (genre: string) => {
    setEditedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sol-light via-sol-pale to-sol-primary flex flex-col">
      <Header
        pageTitle="Perfil"
        showBackButton={true}
        showLogoutButton={true}
        onBack={() => setCurrentPage(PAGES.DASHBOARD)}
        onLogout={() => setCurrentPage(PAGES.LOGIN)}
        userName={userData?.name}
      />

      <div className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-sol-darker mb-2">
              👤 Seu Perfil
            </h2>
            <p className="text-gray-600">
              Gerencie suas informações e preferências
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Card */}
              <div className="bg-white rounded-lg p-8 border-2 border-sol-primary shadow-lg">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-sol-primary to-sol-dark rounded-full flex items-center justify-center">
                    <span className="text-5xl">☀️</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-sol-darker">
                      {userData?.name || "Usuário"}
                    </h3>
                    <p className="text-gray-600 mb-3">{userData?.email}</p>
                    <p className="text-sm text-gray-500">
                      Membro desde{" "}
                      {new Date(userStats.joinDate).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>

                {/* Edit Mode Toggle */}
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-sol-primary text-white py-3 rounded-lg font-semibold hover:bg-sol-dark transition-all"
                  >
                    ✏️ Editar Perfil
                  </button>
                )}

                {/* Edit Form */}
                {isEditing && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nome
                      </label>
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-sol-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-sol-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editedEmail}
                        onChange={(e) => setEditedEmail(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-sol-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-sol-primary"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleSave}
                        className="flex-1 bg-emotion-joy text-white py-2 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
                      >
                        💾 Salvar
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
                      >
                        ✕ Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-emotion-joy/10 to-emotion-joy/5 rounded-lg p-4 border-2 border-emotion-joy">
                  <p className="text-xs text-gray-600 mb-1">Sessões Totais</p>
                  <p className="text-3xl font-bold text-emotion-joy">
                    {userStats.totalSessions}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-emotion-calm/10 to-emotion-calm/5 rounded-lg p-4 border-2 border-emotion-calm">
                  <p className="text-xs text-gray-600 mb-1">Músicas Ouvidas</p>
                  <p className="text-3xl font-bold text-emotion-calm">
                    {userStats.totalMusic}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-emotion-surprise/10 to-emotion-surprise/5 rounded-lg p-4 border-2 border-emotion-surprise">
                  <p className="text-xs text-gray-600 mb-1">Gênero Favorito</p>
                  <p className="text-3xl font-bold text-emotion-surprise">
                    {userStats.favoriteGenre}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-emotion-sadness/10 to-emotion-sadness/5 rounded-lg p-4 border-2 border-emotion-sadness">
                  <p className="text-xs text-gray-600 mb-1">Emoção Favorita</p>
                  <p className="text-3xl font-bold text-emotion-sadness">😊</p>
                </div>
              </div>
            </div>

            {/* Right Column - Preferences */}
            <div className="space-y-6">
              {/* Genres */}
              <div className="bg-white rounded-lg p-6 border-2 border-sol-primary shadow-lg">
                <h3 className="text-xl font-bold text-sol-darker mb-4 flex items-center gap-2">
                  🎵 Gêneros Favoritos
                </h3>

                <div className="space-y-2">
                  {allGenres.map((genre) => (
                    <label
                      key={genre}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                        editedGenres.includes(genre)
                          ? "bg-sol-pale border border-sol-primary"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={editedGenres.includes(genre)}
                        onChange={() => toggleGenre(genre)}
                        disabled={!isEditing}
                        className="w-5 h-5 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {genre}
                      </span>
                    </label>
                  ))}
                </div>

                {isEditing && (
                  <p className="text-xs text-gray-500 mt-4">
                    Selecione seus gêneros favoritos
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="bg-white rounded-lg p-6 border-2 border-sol-primary shadow-lg space-y-3">
                <h3 className="text-lg font-bold text-sol-darker mb-4">
                  ⚙️ Ações
                </h3>

                <button className="w-full bg-emotion-sadness text-white py-2 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all text-sm">
                  🔐 Alterar Senha
                </button>

                <button className="w-full bg-emotion-surprise text-white py-2 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all text-sm">
                  📧 Receber Newsletter
                </button>

                <button className="w-full bg-emotion-anger text-white py-2 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all text-sm">
                  🗑️ Excluir Conta
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
