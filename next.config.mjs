/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Force lit and related packages to be treated as ESM
    config.module.rules.push({
      test: /node_modules\/@creit\.tech\/stellar-wallets-kit\/node_modules\/lit\/.*\.js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });

    return config;
  },
  // Add transpilePackages to ensure proper handling
  transpilePackages: [
    '@creit.tech/stellar-wallets-kit',
    'soroban-react-stellar-wallets-kit',
    'lit',
  ],
  // Enable ESM externals for the problematic package
  experimental: {
    esmExternals: 'loose',
  },
};

// Use export default for ES modules
export default nextConfig;
