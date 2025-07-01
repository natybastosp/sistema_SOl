# 🌞 SOL - Sistema de Musicoterapia com IA

SOL é um sistema de musicoterapia assistida por inteligência artificial, que oferece playlists personalizadas com base no estado emocional do usuário. Através de uma interface intuitiva e responsiva, promove bem-estar e autoconhecimento.

## ✨ Funcionalidades

- 🔐 **Login**: Entrada do nome com design acolhedor e responsivo
- 🎼 **Preferências Musicais**: Seleção de múltiplos gêneros (Rock, MPB, Jazz etc.)
- 🧠 **Avaliação Emocional**: Sliders para emoções (Tristeza, Ansiedade, Alegria, Raiva, Calma)
- 🎵 **Player de Música**: Playlist adaptada à emoção dominante + feedback 👍/👎
- 📊 **Dashboard**: Histórico, estatísticas e progresso terapêutico

## 🎨 Design & UX

- Gradientes terapêuticos por tela
- Ícones modernos (Lucide React)
- Responsivo (mobile-first) e acessível (WCAG)
- Transições suaves e microinterações

## 📁 Estrutura de Diretórios

```
src/
├── App.js
├── index.js
├── assets/
│   └── logo.png
├── components/
│   ├── Header.jsx
│   └── SunLogo.jsx
├── constants/
│   ├── genres.js
│   └── emotions.js
├── pages/
│   ├── LoginPage.jsx
│   ├── PreferencesPage.jsx
│   ├── EmotionalAssessmentPage.jsx
│   ├── PlaylistPage.jsx
│   └── DashboardPage.jsx
├── styles/
│   └── index.css
└── utils/
    └── sampleTracks.js
```

## 🧠 Lógica do Sistema

- Estado global com React Context + hooks
- Recomendação musical com base emocional
- Feedback contínuo para personalização

## 🚀 Como Executar

### Pré-requisitos

- Node.js 16+
- npm ou yarn

### Instalação

```bash
git clone https://github.com/seu-usuario/sol-music-system.git
cd frontend
npm install  # ou yarn install
```

### Rodar em modo desenvolvimento

```bash
npm run dev  # ou yarn dev
```

## 🛠 Tecnologias

- **Frontend**: React 18+, TypeScript, Tailwind CSS
- **UI/UX**: Lucide React, React Hooks
- **Build**: Vite
- **Code Quality**: ESLint, Prettier

## 📱 Responsividade

- **Desktop**: 1024px+
- **Tablet**: 768–1023px
- **Mobile**: 320–767px

## 🎯 Futuras Melhorias

- [ ] Integração com APIs de música (Spotify, Apple Music)
- [ ] Modo offline
- [ ] Notificações push
- [ ] Relatórios em PDF
- [ ] Integração com wearables

## 📄 Licença

Licenciado sob a MIT. Veja [LICENSE](LICENSE).

## 👥 Equipe

Feito com ❤️ para transformar emoções em harmonia.

---

**SOL** – Musicoterapia com tecnologia e sensibilidade. 🌅🎵
