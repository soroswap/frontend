// pages/api/pairs.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const allowedOrigin = [
    'https://app.soroswap.finance',
    'http://localhost:3000',
    'paltalabs.vercel.app',
  ];
  const origin = req.headers.origin || req.headers.referer || '';

  if (!allowedOrigin.some((allowed) => origin.includes(allowed))) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const { network, protocol } = req.query;

  if (!network || !protocol) {
    return res.status(400).json({ message: 'Missing "network" or "protocol" query parameter' });
  }

  try {
    const loginResponse = await axios.post(`${process.env.SOROSWAP_API_URL}/login`, {
      email: process.env.SOROSWAP_API_EMAIL,
      password: process.env.SOROSWAP_API_PASSWORD,
    });

    const token = loginResponse.data.access_token;

    const pairsResponse = await axios.get(
      `${process.env.SOROSWAP_API_URL}/pairs?network=${(
        network as string
      ).toLowerCase()}&protocol=${(protocol as string).toLowerCase()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if ((network as string).toLowerCase() === 'mainnet') {
      const assetList = await axios.get(
        'https://raw.githubusercontent.com/soroswap/token-list/refs/heads/main/tokenList.json',
      );

      const toReturn = pairsResponse.data.filter((pair: any) => {
        const tokenAExists = assetList.data.assets.some(
          (asset: any) => asset.contract === pair.tokenA,
        );
        const tokenBExists = assetList.data.assets.some(
          (asset: any) => asset.contract === pair.tokenB,
        );
        const specialToken =
          pair.tokenA === 'CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA' ||
          pair.tokenB === 'CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA';
        return (tokenAExists && tokenBExists) || specialToken;
      });

      res.status(200).json(toReturn);
    } else {
      res.status(200).json(pairsResponse.data);
    }
  } catch (error: any) {
    console.error('[API ERROR]', error?.message || error);
    res
      .status(error?.response?.status || 500)
      .json({ message: error?.response?.data?.message || error?.message || 'Server Error' });
  }
}
