import { SorobanContextType } from "@soroban-react/core"
import BigNumber from "bignumber.js"
import { reservesBNWithTokens } from "hooks/useReserves"
import { TokenType } from "interfaces"
import { getExpectedAmount } from "./getExpectedAmount"
import { getPairAddress } from "./getPairAddress"

export async function getPriceImpactNew(
  currencyIn: TokenType | undefined,
  currencyOut: TokenType | undefined,
  amountIn: BigNumber,
  sorobanContext: SorobanContextType
) {
  if(!currencyIn || !currencyOut) return "0"

  const pairAddress = await getPairAddress(currencyIn.address, currencyOut.address, sorobanContext)
  const reserves = await reservesBNWithTokens(pairAddress, sorobanContext)

  const isToken0 = currencyIn.address === reserves.token0

  const reserve0 = isToken0 ? reserves.reserve0 : reserves.reserve1
  const reserve1 = isToken0 ? reserves.reserve1 : reserves.reserve0

  if (reserve0 && reserve1) {
    const reserveInAfter = reserve0.plus(amountIn)
    const expectedAmount = await getExpectedAmount(currencyIn, currencyOut, amountIn, sorobanContext)
    const reserveOutAfter = reserve1.minus(expectedAmount)

    const customReserves = {
      token0: currencyIn,
      token1: currencyOut,
      reserve0: reserveInAfter,
      reserve1: reserveOutAfter
    }
  
    const expectedAmountAfter = await getExpectedAmount(currencyIn, currencyOut, amountIn, sorobanContext, customReserves)
  
    const price0 = expectedAmount.dividedBy(amountIn)
    const price1 = expectedAmountAfter.dividedBy(amountIn)

    return price0.minus(price1).dividedBy(price0)
  } else {
    return "0"
  }
}
