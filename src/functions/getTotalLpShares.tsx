import { contractInvoke } from 'stellar-react';
import { SorobanContextType } from 'stellar-react';
import BigNumber from 'bignumber.js';
import { scValToJs } from 'helpers/convert';
import { xdr } from '@stellar/stellar-sdk';

export async function getTotalLpShares(pairAddress: string, sorobanContext: SorobanContextType) {
  try {
    const response = await contractInvoke({
      contractAddress: pairAddress,
      method: 'total_supply',
      sorobanContext,
    });

    return scValToJs(response as xdr.ScVal) as BigNumber.Value;
  } catch (error) {
    return BigNumber('0');
  }
}
