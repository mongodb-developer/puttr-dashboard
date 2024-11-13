/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/_next/static/chunks/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
        ],
      },
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Configure function settings for Vercel
  functions: {
    'api/screenshot': {
      memory: 1024, // Increase memory to 1GB
      maxDuration: 60, // Set timeout to 60 seconds
    },
  },
}

module.exports = nextConfig
