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
        <div className="max-w-4xl mx-auto">
          {/* HEADER */}
          <div className="mb-10">
            <h2 className="text-4xl font-extrabold text-sol-darker mb-2 drop-shadow-sm">
              👤 Seu Perfil
            </h2>
            <p className="text-gray-700 text-lg">
              Gerencie suas informações, estatísticas e preferências musicais
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 space-y-8">

              {/* PROFILE CARD */}
              <div className="backdrop-blur-xl bg-white/70 shadow-xl rounded-2xl p-8 border border-white/40">
                <div className="flex items-center gap-6 mb-10">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-sol-primary to-sol-dark flex items-center justify-center shadow-lg">
                    <span className="text-5xl drop-shadow-md">☀️</span>
                  </div>

                  <div>
                    <h3 className="text-3xl font-bold text-sol-darker">
                      {userData?.name || "Usuário"}
                    </h3>

                    <p className="text-gray-600 text-sm">{userData?.email}</p>

                    <p className="text-xs mt-2 text-sol-dark font-medium">
                      Membro desde{" "}
                      {new Date(userStats.joinDate).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>

                {/* BUTTON (NOT EDITING) */}
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full py-3 rounded-xl bg-sol-primary text-white font-semibold shadow-md hover:bg-sol-dark hover:scale-[1.02] transition-all"
                  >
                    ✏️ Editar Perfil
                  </button>
                )}

                {/* EDIT MODE */}
                {isEditing && (
                  <div className="space-y-5">
                    {/* NOME */}
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-gray-700">
                        Nome
                      </label>
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border-2 border-sol-primary/70 focus:outline-none focus:ring-2 focus:ring-sol-primary bg-white/60 backdrop-blur"
                      />
                    </div>

                    {/* EMAIL */}
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editedEmail}
                        onChange={(e) => setEditedEmail(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border-2 border-sol-primary/70 focus:outline-none focus:ring-2 focus:ring-sol-primary bg-white/60 backdrop-blur"
                      />
                    </div>

                    {/* BUTTONS */}
                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={handleSave}
                        className="flex-1 py-2 rounded-xl bg-emotion-joy text-white font-semibold shadow-md hover:scale-[1.03] transition-all"
                      >
                        💾 Salvar
                      </button>

                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex-1 py-2 rounded-xl bg-gray-300 text-gray-800 font-semibold hover:scale-[1.03] transition-all"
                      >
                        ✕ Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* STATS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    label: "Sessões Totais",
                    value: userStats.totalSessions,
                    color: "emotion-joy",
                  },
                  {
                    label: "Músicas Ouvidas",
                    value: userStats.totalMusic,
                    color: "emotion-calm",
                  },
                  {
                    label: "Gênero Favorito",
                    value: userStats.favoriteGenre,
                    color: "emotion-surprise",
                  },
                  {
                    label: "Emoção Favorita",
                    value: "😊",
                    color: "emotion-sadness",
                  },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border-2 border-${stat.color} bg-${stat.color}/10`}
                  >
                    <p className="text-xs text-gray-600">{stat.label}</p>
                    <p
                      className={`text-3xl font-bold text-${stat.color} mt-1`}
                    >
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-8">

              {/* GENRES */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-xl">
                <h3 className="text-xl font-bold text-sol-darker mb-4 flex items-center gap-2">
                  🎵 Gêneros Favoritos
                </h3>

                <div className="space-y-2">
                  {allGenres.map((genre) => (
                    <label
                      key={genre}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all cursor-pointer ${
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
                        className="w-5 h-5 accent-sol-primary"
                      />
                      <span className="font-medium">{genre}</span>
                    </label>
                  ))}
                </div>

                {isEditing && (
                  <p className="text-xs text-gray-500 mt-3">
                    Selecione seus gêneros favoritos
                  </p>
                )}
              </div>

             // {/* ACTIONS */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-xl space-y-4">
                <h3 className="font-bold text-lg text-sol-darker">⚙️ Ações</h3>

                <button className="w-full py-2 rounded-lg bg-emotion-sadness text-white font-semibold hover:scale-[1.02] transition-all">
                  🔐 Alterar Senha
                </button>

                <button className="w-full py-2 rounded-lg bg-emotion-surprise text-white font-semibold hover:scale-[1.02] transition-all">
                  📧 Receber Newsletter
                </button>

                <button className="w-full py-2 rounded-lg bg-emotion-anger text-white font-semibold hover:scale-[1.02] transition-all">
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
