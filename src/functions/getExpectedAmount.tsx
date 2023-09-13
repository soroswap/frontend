import { SorobanContextType } from "@soroban-react/core"
import { TokenType } from "interfaces"
import { getPairAddress } from "./getPairAddress"
import { reservesBNWithTokens } from "hooks/useReserves"
import BigNumber from "bignumber.js"
import { formatTokenAmount } from "helpers/format"
import fromExactInputGetExpectedOutput from "./fromExactInputGetExpectedOutput"
import fromExactOutputGetExpectedInput from "./fromExactOutputGetExpectedInput"

interface customReservesType {
  token0: TokenType
  token1: TokenType
  reserve0: BigNumber
  reserve1: BigNumber
}

export async function getExpectedAmount(
  currencyIn: TokenType | undefined,
  currencyOut: TokenType | undefined,
  amountIn: BigNumber,
  sorobanContext: SorobanContextType,
  customReserves?: customReservesType
) {
  if (!currencyIn || !currencyOut) return BigNumber("0")
  
  try {
    const pairAddress = await getPairAddress(currencyIn.address, currencyOut.address, sorobanContext)
    const reserves = customReserves ?? await reservesBNWithTokens(pairAddress, sorobanContext)
  
    const isToken0 = currencyIn.address === reserves.token0
  
    let expectedOutput
    if (isToken0) {
      expectedOutput = fromExactInputGetExpectedOutput(amountIn, reserves.reserve0, reserves.reserve1)
    } else {
      expectedOutput = fromExactOutputGetExpectedInput(amountIn, reserves.reserve0, reserves.reserve1)
    }
  
    return expectedOutput
  } catch (error) {
    console.log("🚀 « error:", error)
    return BigNumber(0)
  }

}