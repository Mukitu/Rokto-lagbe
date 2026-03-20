/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'elzxkrpkvabxfferhnmm.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'tsuhizknudvtztxolkng.supabase.co',
      },
    ],
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
}
module.exports = nextConfig
