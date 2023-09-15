import { SorobanContextType } from "@soroban-react/core"
import BigNumber from "bignumber.js"
import { getPairs } from "./getPairs"
import { getToken, tokenBalance } from "hooks"
import { getTotalLpShares } from "./getTotalLpShares"
import { TokenType } from "interfaces"

export type LpTokensObj = {
  token_0: TokenType | undefined;
  token_1: TokenType | undefined;
  balance: BigNumber;
  lpPercentage: string;
  status: string;
}

export async function getLpTokens(
  sorobanContext: SorobanContextType
) {
  if(!sorobanContext.activeChain) return
  
  const pairs = await getPairs(sorobanContext)

  const results: LpTokensObj[] = [];

  for (const element of pairs) {
    const pairLpTokens = await tokenBalance(element.pair_address, sorobanContext.address!, sorobanContext);

    if (pairLpTokens != 0) {
      const token_0 = await getToken(sorobanContext, element.token_a_address)
      const token_1 = await getToken(sorobanContext, element.token_b_address)
      const totalShares = await getTotalLpShares(element.pair_address, sorobanContext);
      const lpPercentage = BigNumber(pairLpTokens).dividedBy(totalShares).multipliedBy(100).decimalPlaces(7).toString();

      const toReturn = {
        token_0,
        token_1,
        balance: pairLpTokens,
        lpPercentage,
        status: "Active"
      };

      results.push(toReturn);
    }
  }

  return results
}
