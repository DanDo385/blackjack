/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  // Proxy API requests to backend to avoid CORS issues
  // Only rewrites client-side requests, not SSR
  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'
    return [
      {
        source: '/api/:path*',
        destination: `${apiBase}/api/:path*`,
      },
    ]
  },
  webpack: (config, { isServer }) => {
    // Ignore React Native dependencies that MetaMask SDK tries to import in web environment
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@react-native-async-storage/async-storage': false,
    }

    // Ignore optional dependencies that aren't needed in web environment
    config.resolve.alias = {
      ...config.resolve.alias,
      'pino-pretty': false,
    }

    // Mark optional dependencies as external/ignored
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@react-native-async-storage/async-storage': false,
      }
    }

    // Suppress warnings for optional dependencies
    config.ignoreWarnings = [
      { module: /node_modules\/@metamask\/sdk/ },
      { module: /node_modules\/pino/ },
      (warning) => {
        return (
          warning.message &&
          (warning.message.includes('@react-native-async-storage/async-storage') ||
            warning.message.includes('pino-pretty') ||
            warning.message.includes("Can't resolve '@react-native-async-storage/async-storage'") ||
            warning.message.includes("Can't resolve 'pino-pretty'"))
        )
      },
    ]

    return config
  },
}

export default nextConfig


