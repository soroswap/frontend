import axios from 'axios';
import { Networks } from '@stellar/stellar-sdk';
import { fetchPairs } from './soroswapApi';

export interface MercuryPair {
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

  const data = fetchPairs(networkName, 'soroswap');
  return data;
};

export const fetchAllPhoenixPairs = async (networkPassphrase: string) => {
  const networkName = passphraseToBackendNetworkName[networkPassphrase];

  const data = fetchPairs(networkName, 'phoenix');
  return data;
};
