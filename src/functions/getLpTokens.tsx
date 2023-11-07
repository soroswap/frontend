import { SorobanContextType } from '@soroban-react/core';
import BigNumber from 'bignumber.js';
import { getToken, tokenBalance } from 'hooks';
import { TokenType } from 'interfaces';
import { getPairs } from './getPairs';
import { getTotalLpShares } from './getTotalLpShares';
import { reservesBigNumber } from 'hooks/useReserves';

export type LpTokensObj = {
  token_0: TokenType | undefined;
  token_1: TokenType | undefined;
  balance: BigNumber;
  lpPercentage: string;
  status: string;
  reserve0: BigNumber | undefined;
  reserve1: BigNumber | undefined;
};

export async function getLpTokens(sorobanContext: SorobanContextType) {
  if (!sorobanContext.activeChain) return;

  const pairs = await getPairs(sorobanContext);

  const results: LpTokensObj[] = [];

  for (const element of pairs) {
    const pairLpTokens = await tokenBalance(
      element.pair_address,
      sorobanContext.address!,
      sorobanContext,
    );

    if (pairLpTokens != 0) {
      const token_0 = await getToken(sorobanContext, element.token_a_address);
      const token_1 = await getToken(sorobanContext, element.token_b_address);
      const totalShares = await getTotalLpShares(element.pair_address, sorobanContext);
      const reservesResponse = await reservesBigNumber(element.pair_address, sorobanContext);

      const lpPercentage = BigNumber(pairLpTokens)
        .dividedBy(totalShares)
        .multipliedBy(100)
        .decimalPlaces(7)
        .toString();

      const toReturn = {
        token_0,
        token_1,
        balance: pairLpTokens,
        lpPercentage,
        status: 'Active',
        reserve0: reservesResponse?.reserve0,
        reserve1: reservesResponse?.reserve1,
      };

      results.push(toReturn);
    }
  }

  return results;
}
