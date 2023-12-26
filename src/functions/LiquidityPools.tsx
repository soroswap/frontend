import { contractInvoke } from '@soroban-react/contracts';
import { SorobanContextType } from '@soroban-react/core/dist/SorobanContext';
import BigNumber from 'bignumber.js';
import { scValToJs } from 'helpers/convert';
import { xdr } from 'stellar-sdk';

export async function getLpTokensAmount(
  amount0: BigNumber,
  reserve0: BigNumber,
  amount1: BigNumber,
  reserve1: BigNumber,
  pairAddress: string,
  sorobanContext: SorobanContextType,
) {
  const totalShares = await getTotalShares(pairAddress, sorobanContext);

  if (!totalShares || reserve1.isEqualTo(0) || reserve0.isEqualTo(0)) {
    return amount0.multipliedBy(amount1).squareRoot();
  }
  if (typeof totalShares === 'number' || typeof totalShares === 'string') {
    let LP0 = amount0.multipliedBy(totalShares).dividedBy(reserve0).decimalPlaces(0);
    let LP1 = amount1.multipliedBy(totalShares).dividedBy(reserve1).decimalPlaces(0);
    return BigNumber.min(LP0, LP1);
  } else {
  }
}

/**
 * Fetches the total shares for a given pair address within the Soroban context.
 *
 * @param {string} pairAddress - The contract address of the asset pair.
 * @param {SorobanContextType} sorobanContext - The context within which Soroban operates.
 *
 * @returns {Promise<number | undefined>} - The total shares in stroop, or undefined if unable to fetch.
 */
export async function getTotalShares(pairAddress: string, sorobanContext: SorobanContextType) {
  // Invoke the "total_shares" method on the contract at the given pair address.
  // The result will be in Soroban contract value (scval) format.
  const totalShares_scval = await contractInvoke({
    contractAddress: pairAddress,
    method: 'total_shares',
    sorobanContext: sorobanContext,
  });

  if (totalShares_scval) {
    const totalShares = scValToJs(totalShares_scval as xdr.ScVal);
    return totalShares;
  } else return undefined;
}
