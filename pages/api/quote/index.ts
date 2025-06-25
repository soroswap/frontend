import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const allowedOrigin = ['.soroswap.finance', 'http://localhost:3000', 'paltalabs.vercel.app'];
  const origin = req.headers.origin || req.headers.referer || '';

  if (!allowedOrigin.some((allowed) => origin.includes(allowed))) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const { network } = req.query;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  if (!network) {
    return res.status(400).json({ message: 'Missing "network" query parameter' });
  }

  try {
    const loginResponse = await axios.post(`${process.env.SOROSWAP_API_URL}/login`, {
      email: process.env.SOROSWAP_API_EMAIL,
      password: process.env.SOROSWAP_API_PASSWORD,
    });

    const token = loginResponse.data.access_token;

    const swapResponse = await axios.post(
      `${process.env.SOROSWAP_API_URL}/quote?network=${(
        network as string
      ).toLowerCase()}`,
      req.body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    res.status(200).json(swapResponse.data);
  } catch (error: any) {
    console.error('[API ERROR]', error?.message || error);
    res
      .status(error?.response?.status || 500)
      .json({ message: error?.response?.data?.message || error?.message || 'Server Error' });
  }
}
