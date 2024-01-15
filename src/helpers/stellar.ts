import { signAndSendTransaction } from '@soroban-react/contracts';
import { SorobanContextType } from '@soroban-react/core';
import { tokenBalance } from 'hooks';
import { TokenType } from 'interfaces';
import * as StellarSdk from 'stellar-sdk';
import { getClassicStellarAsset, isClassicStellarAssetFormat } from './address';
import { getTokenName } from './soroban';

export const requiresTrustline = async (
  address: string,
  sorobanContext: SorobanContextType,
): Promise<boolean> => {
  const tokenName = await getTokenName(address, sorobanContext);

  // Return false immediately if it's not a classic Stellar asset
  if (!isClassicStellarAssetFormat(tokenName as string)) {
    return false;
  }

  // Check token balance and return the inverse
  return !(await tokenBalance(address, sorobanContext.address!, sorobanContext));
};

export const wrapClassicStellarAsset = async (
  token: TokenType | undefined,
  sorobanContext: SorobanContextType,
) => {
  if (!token) throw new Error('No token');
  const { activeChain, address, server } = sorobanContext;
  const networkPassphrase = sorobanContext.activeChain?.networkPassphrase ?? '';

  const asset = getClassicStellarAsset(token.name);
  if (!asset) throw new Error('No asset');

  if (!activeChain) {
    throw new Error('No active Chain');
  }
  if (!server) {
    throw new Error('No connected to a Server');
  }

  if (!networkPassphrase) throw new Error('No networkPassphrase');

  let source = await server.getAccount(address!);

  const operation = StellarSdk.Operation.createStellarAssetContract({ asset: asset.asset });

  const txn = new StellarSdk.TransactionBuilder(source, {
    fee: '100',
    networkPassphrase,
  })
    .addOperation(operation)
    .setTimeout(StellarSdk.TimeoutInfinite)
    .build();

  try {
    const result = await signAndSendTransaction({ txn, sorobanContext });
    return result;
  } catch (error) {
    console.log(error);
  }
};
