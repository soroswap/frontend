/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /node_modules\/@creit\.tech\/stellar-wallets-kit\/node_modules\/lit\/.*\.js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });

    return config;
  },
  transpilePackages: [
    '@creit.tech/stellar-wallets-kit',
    'soroban-react-stellar-wallets-kit',
    'lit',
  ],
  experimental: {
    esmExternals: 'loose',
  },
};

export default nextConfig;
