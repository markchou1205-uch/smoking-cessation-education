/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // 保留原有的圖片配置，支援 YouTube 嵌入
  images: {
    domains: ['img.youtube.com'],
  },
  
  // 保留原有的安全標頭配置
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // 保留原有的 rewrites 配置，支援 YouTube 嵌入
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  
  // 處理 ESLint（只在開發時忽略，生產環境仍會檢查）
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // 處理 TypeScript 錯誤
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
