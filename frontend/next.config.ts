import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Отключаем кеширование для разработки
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  // Добавляем headers для отключения кеширования
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
