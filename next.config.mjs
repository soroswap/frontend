/** @type {import('next').NextConfig} */
// next.config.mjs
const nextConfig = {
  experimental: {
    esmExternals: 'loose' // This helps handle ESM dependencies
  },
  webpack: (config) => {
    // Force webpack to properly resolve .mjs files
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      '.js': ['.js', '.mjs']
    };
    return config;
  },
  transpilePackages: ['@creit.tech/stellar-wallets-kit', 'soroban-react-stellar-wallets-kit'],
};

export default nextConfig;