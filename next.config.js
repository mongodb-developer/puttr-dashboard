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
  webpack: (config, { isServer, dev }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer && !dev) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        child_process: false,
        net: false,
        tls: false,
      };
    }

    // Exclude chrome-aws-lambda from being processed by webpack
    config.externals.push({
      'chrome-aws-lambda': 'commonjs chrome-aws-lambda',
    });

    // Ignore .map files for chrome-aws-lambda
    config.module.rules.push({
      test: /\.map$/,
      use: 'ignore-loader',
      include: /node_modules\/chrome-aws-lambda/,
    });

    return config;
  },
}

module.exports = nextConfig
