/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  transpilePackages: [
    '@creit.tech/stellar-wallets-kit',
    'soroban-react-stellar-wallets-kit',
    'lit',
    '@lit-labs/react',
    '@lit/reactive-element'
  ],
  
  webpack: (config, { isServer }) => {

    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
      '.jsx': ['.jsx', '.tsx'],
      '.mjs': ['.mjs', '.mts']
    };
    
    config.module.rules.push({
      test: /\.m?js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });


    config.module.rules.push({
      test: /\/node_modules\/@creit\.tech\/stellar-wallets-kit\/.*\.js$/,
      resolve: {
        fullySpecified: false
      }
    });

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },

  experimental: {
    esmExternals: 'loose'
  }
};

export default nextConfig;
