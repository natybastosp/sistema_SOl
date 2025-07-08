/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Permitir server actions se necessário
    serverActions: true,
  },
  async headers() {
    return [
      {
        // Aplicar headers CORS para todas as rotas da API
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*", // Em produção, especificar domínios específicos
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
