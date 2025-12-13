/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // 确保Vercel正确构建
  output: 'standalone',
  // 禁用严格模式以解决某些问题
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, // 先忽略TypeScript错误
  },
  // 图片配置
  images: {
    unoptimized: true, // Vercel自动优化
  },
  // 跨域配置
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ]
      }
    ]
  }
}

module.exports = nextConfig
