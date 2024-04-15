import { SorobanContextType } from '@soroban-react/core';
import BigNumber from 'bignumber.js';
import { TokenType } from 'interfaces';
import { isClassicStellarAssetFormat } from './address';
import { getTokenName } from './soroban';

export const requiresTrustline = async (
  sorobanContext: SorobanContextType,
  asset?: TokenType,
  amount?: string,
): Promise<boolean> => {
  if (!sorobanContext.address || !asset) return false
  const {serverHorizon} = sorobanContext

  const tokenName = await getTokenName(asset.contract, sorobanContext);
  // Return false immediately if it's not a classic Stellar asset
  if (!isClassicStellarAssetFormat(tokenName as string)) {
    return false;
  }

  const account = await serverHorizon?.loadAccount(sorobanContext.address)

  const assetOnAccount = account?.balances.find((bal) =>
    'asset_code' in bal && 'asset_issuer' in bal &&
    bal.asset_code === asset.code && bal.asset_issuer === asset.issuer
  )

  if (assetOnAccount) {
    if ('limit' in assetOnAccount && amount) {
      const decimals = asset.decimals ?? 7;
      const formattedAmount = new BigNumber(amount).shiftedBy(-decimals);
      const limit = new BigNumber(assetOnAccount.limit);
      
      if (formattedAmount.isGreaterThan(limit)) {
        return true;
      }
    }
    return false;
  }

  return true
};
