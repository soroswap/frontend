import { Networks } from '@stellar/stellar-sdk';

export const passphraseToBackendNetworkName: { [x: string]: string } = {
  [Networks.PUBLIC]: 'MAINNET',
  [Networks.TESTNET]: 'TESTNET',
};
