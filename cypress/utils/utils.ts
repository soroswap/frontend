import { freighter } from '@soroban-react/freighter';
import { xlmTokenList } from 'constants/xlmToken';

export const testnetXLM =
  xlmTokenList.find((tList) => tList.network === 'testnet')?.assets?.[0]?.contract ?? null;

export const walletAddress = 'GCHR5WWPDFF3U3HP2NA6TI6FCQPYEWS3UOPIPJKZLAAFM57CEG4ZYBWP';

export const mockedFreighterConnector = {
  ...freighter(),
  isConnected: () => true,
  getPublicKey: () => Promise.resolve(walletAddress),
};

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
