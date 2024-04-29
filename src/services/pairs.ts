import axios from 'axios';
import { Networks } from '@stellar/stellar-sdk';
interface SubscribedPair {
  contractId: string;
  token0: string;
  token1: string;
  reserve0: string;
  reserve1: string;
  totalShares: string;
  protocol: string;
}

const passphraseToBackendNetworkName: { [x: string]: string } = {
  [Networks.PUBLIC]: 'MAINNET',
  [Networks.TESTNET]: 'TESTNET',
};

export const fetchAllSoroswapPairs = async (networkPassphrase: string) => {
  const networkName = passphraseToBackendNetworkName[networkPassphrase];

  const { data } = await axios.post<SubscribedPair[]>(
    `${process.env.NEXT_PUBLIC_SOROSWAP_BACKEND_URL}/pairs/all?network=${networkName}&protocols=soroswap`,
    undefined,
    {
      headers: {
        apiKey: process.env.NEXT_PUBLIC_SOROSWAP_BACKEND_API_KEY,
      },
    },
  );
  return data;
};
