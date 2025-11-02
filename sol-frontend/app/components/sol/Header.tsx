interface HeaderProps {
  pageTitle: string;
  onBack?: () => void;
  onLogout?: () => void;
  showBackButton?: boolean;
  showLogoutButton?: boolean;
  userName?: string;
}

export default function Header({
  pageTitle,
  onBack,
  onLogout,
  showBackButton = false,
  showLogoutButton = false,
  userName = "Usuário",
}: HeaderProps) {
  return (
    <div className="bg-gradient-to-r from-sol-primary to-sol-dark shadow-lg p-4 border-b-4 border-sol-darker">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo e Título */}
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white">☀️ SOL</h1>
          <div className="h-8 w-px bg-white/30"></div>
          <p className="text-lg font-semibold text-sol-light">{pageTitle}</p>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-3">
          {/* Usuário logado */}
          {userName && (
            <div className="text-right mr-4 hidden sm:block">
              <p className="text-xs text-sol-light">Bem-vindo,</p>
              <p className="text-sm font-bold text-white">{userName}</p>
            </div>
          )}

          {/* Botão Voltar */}
          {showBackButton && onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 bg-sol-pale/30 hover:bg-sol-pale/50 text-white px-4 py-2 rounded-lg font-semibold transition-all border border-sol-pale hover:border-sol-pale/80"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
              Voltar
            </button>
          )}

          {/* Botão Logout */}
          {showLogoutButton && onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-2 bg-emotion-anger/90 hover:bg-emotion-anger text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
              </svg>
              Sair
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
