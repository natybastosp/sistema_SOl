/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignorar erros de TypeScript e ESLint durante o build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Corrigido: experimental.serverActions deve ser um objeto (ou removido se não for usado)
  experimental: {
    serverActions: {}, // Corrigido aqui
  },

  async headers() {
    return [
      {
        // Aplicar headers CORS para todas as rotas da API
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*", // Em produção, especifique os domínios permitidos
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
