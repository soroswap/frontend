import { SorobanContextType } from 'stellar-react';
import BigNumber from 'bignumber.js';

import { getTotalShares } from './LiquidityPools';

export default async function getLpTokensAmount(
  amount0: BigNumber,
  reserve0: BigNumber,
  amount1: BigNumber,
  reserve1: BigNumber,
  pairAddress: string,
  sorobanContext: SorobanContextType,
): Promise<BigNumber> {
  try {
    const totalShares = await getTotalShares(pairAddress, sorobanContext);

    if (reserve1.isEqualTo(0) || reserve0.isEqualTo(0)) {
      return amount0.multipliedBy(amount1).squareRoot();
    }

    let LP0 = amount0
      .multipliedBy(totalShares as number)
      .dividedBy(reserve0)
      .decimalPlaces(0);
    let LP1 = amount1
      .multipliedBy(totalShares as number)
      .dividedBy(reserve1)
      .decimalPlaces(0);
    return BigNumber.min(LP0, LP1);
  } catch (error) {
    return amount0.multipliedBy(amount1).squareRoot();
  }
}
