import * as React from "react";
import CardActions from "@mui/material/CardActions";
import { useReservesBigNumber } from "../hooks/useReserves";
import { SorobanContextType } from "@soroban-react/core";
import { Checkbox } from "@mui/material";
import BigNumber from "bignumber.js";
import { PairBalance } from "./PairBalance";
import { SwapButton } from "./buttons/SwapButton";
import getExpectedAmount, { getPriceImpact } from "../functions/getExpectedAmount";
import { AllowanceButton } from "./buttons/AllowanceButton";
import { TokenType } from "../interfaces";
import { useAllowance } from "../hooks/useAllowance";
import { useSlipaggeFactor } from "../hooks/useSlippageFactor";
import { useTokensFromPair } from "../hooks/useTokensFromPair";
import { useTokens } from "../hooks";
import { formatAmount, scvalToBigNumber } from "../helpers/utils";



export function ProvideSwapPair({
  sorobanContext,
  pairAddress,
  inputToken,
  inputTokenAmount,
  outputTokenAmount,
  changeOutput,
  isLiquidity,
}: {
  sorobanContext: SorobanContextType;
  pairAddress: string;
  inputToken: TokenType;
  inputTokenAmount: number;
  outputTokenAmount: number;
  changeOutput: any;
  isLiquidity: boolean;
}) {
  const tokens = useTokens(sorobanContext);
  const tokensFromPair = useTokensFromPair(pairAddress, sorobanContext);

  const token0Name = tokens.find(token => token.token_address === tokensFromPair?.token0)?.token_name;
  const token1Name = tokens.find(token => token.token_address === tokensFromPair?.token1)?.token_name;

  const reserves = useReservesBigNumber(pairAddress, sorobanContext);
  const [isBuy, setIsBuy] = React.useState<boolean>(false);
  let output = getExpectedAmount(pairAddress, BigNumber(inputTokenAmount).shiftedBy(7), sorobanContext)
  let allowance = useAllowance(inputToken.token_address, sorobanContext.address!, pairAddress, sorobanContext)
  let slippage = useSlipaggeFactor()
  if (!isLiquidity) {
    changeOutput(BigNumber(output).decimalPlaces(0).shiftedBy(-7).toNumber())
  }

  return (
    <div>
      {
        //<p>Buy token A?</p>
        //<Checkbox checked={isBuy} onChange={() => setIsBuy(!isBuy)} />
      }
      <p>..</p>
      <p>### CURRENT INFORMATION</p>

      <p>- token0: {token0Name}</p>
      <p>- token1: {token1Name}</p>
      <p>- token0 reserves {formatAmount(reserves.reserve0)} {token0Name}</p>
      <p>- token1 reserves {formatAmount(reserves.reserve1)} {token1Name}</p>
      <p>- Price Impact: {twoDecimalsPercentage(getPriceImpact(pairAddress, BigNumber(inputTokenAmount).shiftedBy(7), sorobanContext).toString())}%</p>
      <p>..</p>
      <p>### IF YOU SWAP:</p>

      <CardActions>
        <AllowanceButton
          tokenAddress={inputToken.token_address}
          spenderAddress={pairAddress}
          amount={BigNumber(inputTokenAmount).shiftedBy(7)}
          sorobanContext={sorobanContext}
        />
      </CardActions>
      <CardActions>
        <SwapButton
          pairAddress={pairAddress}
          maxTokenA={BigNumber(inputTokenAmount).shiftedBy(7)}
          amountOut={slippage.multipliedBy(BigNumber(outputTokenAmount)).shiftedBy(7)}
          isBuy={isBuy}
          sorobanContext={sorobanContext}
        />
      </CardActions>
    </div>
  );
}

function twoDecimalsPercentage(value: string) {
  // convert string to number
  const numericValue = parseFloat(value);

  return Math.round(numericValue * 10000) / 100;
}