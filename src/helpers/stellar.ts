import { SorobanContextType } from '@soroban-react/core';
import { tokenBalance } from 'hooks';
import { isClassicStellarAssetFormat } from './address';
import { getTokenName } from './soroban';

export const requiresTrustline = async (
  address: string,
  sorobanContext: SorobanContextType,
): Promise<boolean> => {
  if (!sorobanContext.address){
    return true
  }
  else {
    const tokenName = await getTokenName(address, sorobanContext);
    // Return false immediately if it's not a classic Stellar asset
    if (!isClassicStellarAssetFormat(tokenName as string)) {
      return false;
    }
    // Check token balance and return the inverse
    return !(await tokenBalance(address, sorobanContext.address, sorobanContext));
  }
};
