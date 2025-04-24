import axios from 'axios';
import { xlmTokenList } from 'constants/xlmToken';
import soroAxios from './axios';

export const fetchTokens = async (network: string) => {
  if (!network) return undefined
  let tokensList;
  if (network === 'mainnet') {
    const xlmToken = xlmTokenList.find((set) => set.network === network)?.assets
    const { data } = await axios.get(
      'https://raw.githubusercontent.com/soroswap/token-list/main/tokenList.json',
    );

    if (xlmToken) {
      data.assets.unshift(xlmToken[0])
    }
    tokensList = data;
    // tokensList = { ...data, tokens: data.tokens.filter((t) => t.code !== 'BTC') };
  } else {
    const { data } = await soroAxios.get('/api/tokens');
    tokensList = data;
  }

  return tokensList;
};
