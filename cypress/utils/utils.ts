import { xlmTokenList } from 'constants/xlmToken';

export const testnetXLM =
  xlmTokenList.find((tList) => tList.network === 'testnet')?.assets?.[0]?.contract ?? null;

export const walletAddress = 'GCHR5WWPDFF3U3HP2NA6TI6FCQPYEWS3UOPIPJKZLAAFM57CEG4ZYBWP';

export const mockedFreighterConnector = {
  name: 'Freighter',
  iconUrl: 'https://freighter.app/icon.png',
  iconBackground: '#000',
  installed: true,
  isConnected: () => Promise.resolve(true),
  getNetworkDetails: () => Promise.resolve({ network: 'testnet', details: {} }),
  getPublicKey: () => Promise.resolve(walletAddress),
  signTransaction: (xdr: string, opts?: {
    network?: string;
    networkPassphrase?: string;
    accountToSign?: string;
  }) => Promise.resolve('signedTransaction'),
};

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
