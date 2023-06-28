/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig


var fs = require('fs');
module.exports = {
  reactStrictMode: true,
  env: {
    LIQUIDITY_POOL_ID: fs.readFileSync('../.soroban/liquidity_pool').toString().trim(),
    TOKEN_ID_1: fs.readFileSync('../.soroban/token_id_1').toString().trim(),
    TOKEN_ID_2: fs.readFileSync('../.soroban/token_id_2').toString().trim(),
  },
};
