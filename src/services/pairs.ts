import axios from 'axios';
import { Networks } from '@stellar/stellar-sdk';

interface MercuryPair {
  tokenA: string;
  tokenB: string;
  address: string;
  reserveA: string;
  reserveB: string;
}

const passphraseToBackendNetworkName: { [x: string]: string } = {
  [Networks.PUBLIC]: 'MAINNET',
  [Networks.TESTNET]: 'TESTNET',
};

export const fetchAllSoroswapPairs = async (networkPassphrase: string) => {
  const networkName = passphraseToBackendNetworkName[networkPassphrase];

  const { data } = await axios.get<MercuryPair[]>(`https://info.soroswap.finance/api/pairs/plain`, {
    params: {
      network: networkName,
    },
  });

  return data;
};

export const fetchAllPhoenixPairs = async (networkPassphrase: string) => {
  const networkName = passphraseToBackendNetworkName[networkPassphrase];

  const { data } = await axios.get<MercuryPair[]>(
    `https://info.soroswap.finance/api/pairs/phoenix`,
    {
      params: {
        network: networkName,
      },
    },
  );
  return data;
};
