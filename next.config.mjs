/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Fix ES Module compatibility issue with stellar-wallets-kit and lit
    // This resolves the "require() of ES Module" error by properly handling
    // the module format differences between CommonJS and ES Modules
    config.module.rules.push({
      test: /\.m?js$/,
      include: [
        /node_modules\/@creit\.tech\/stellar-wallets-kit/,
        /node_modules\/lit/
      ],
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });

    return config;
  },
  // Improve compatibility with external ES modules
  experimental: {
    esmExternals: 'loose'
  }
};

export default nextConfig;