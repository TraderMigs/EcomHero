/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'yepmzsztfzzvuzaykzpv.supabase.co' },
      { protocol: 'https', hostname: 'files.printful.com' },
      { protocol: 'https', hostname: 'images.printify.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ['localhost:3000'] },
  },
}

module.exports = nextConfig
