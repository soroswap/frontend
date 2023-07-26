import * as React from "react";
import CardActions from "@mui/material/CardActions";
import { useReservesBigNumber } from "../hooks/useReserves";
import { SorobanContextType } from "@soroban-react/core";
import { Checkbox } from "@mui/material";
import BigNumber from "bignumber.js";
import { PairBalance } from "./PairBalance";
import getExpectedAmount, { getPriceImpact } from "../functions/fromExactInputGetExpectedOutput";
import { TokenType } from "../interfaces";
import { useAllowance } from "../hooks/useAllowance";
import { useSlipaggeFactor } from "../hooks/useSlippageFactor";
import { useTokensFromPair } from "../hooks/useTokensFromPair";
import { useTokenBalances, useTokens } from "../hooks";
import { formatAmount, scvalToBigNumber } from "../helpers/utils";
import { useMemo } from "react";
import { SwapButton } from "../components/Buttons/SwapButton";



export function ProvideSwapPair({
  sorobanContext,
  pairAddress,
  inputTokenAmount,
  outputTokenAmount,
  setToken0,
  setToken1,
  token0,
  token1,
  inputToken,
  outputToken,
}: {
  sorobanContext: SorobanContextType;
  pairAddress: string;
  inputTokenAmount: number;
  outputTokenAmount: number;
  setToken0: (token: TokenType|null) => void;
    setToken1: (token: TokenType|null) => void;
    token0: TokenType|null;
    token1: TokenType|null;
    inputToken: TokenType;
    outputToken: TokenType;
}) {
  const tokens = useTokens(sorobanContext);
  const tokensFromPair = useTokensFromPair(pairAddress, sorobanContext);
  const tokenBalancesResponse = useTokenBalances(sorobanContext.address??"", tokens);

  const reserves = useReservesBigNumber(pairAddress, sorobanContext);
  useMemo(() => {
    setToken0(tokens.find(token => token.token_address === tokensFromPair?.token0)??null);
    setToken1(tokens.find(token => token.token_address === tokensFromPair?.token1)??null);
  }, [setToken0, setToken1, tokensFromPair, tokens])

  return (
    <div>
      {
        //<p>Buy token A?</p>
        //<Checkbox checked={isBuy} onChange={() => setIsBuy(!isBuy)} />
      }
      <p>..</p>
      <p>### CURRENT INFORMATION</p>

      <p>- token0: {token0?.token_name}</p>
      <p>- token1: {token1?.token_name}</p>
      <p>- token0 reserves {formatAmount(reserves.reserve0)} {token0?.token_name}</p>
      <p>- token1 reserves {formatAmount(reserves.reserve1)} {token1?.token_name}</p>
      <p>- Price Impact: {twoDecimalsPercentage(getPriceImpact(
        pairAddress, 
        BigNumber(inputTokenAmount).shiftedBy(7), 
        token0?.token_address === inputToken.token_address?reserves.reserve0:reserves.reserve1,
        token1?.token_address === outputToken?.token_address?reserves.reserve1:reserves.reserve0,
        sorobanContext).toString())}%</p>
      <p>..</p>
      <p>### IF YOU SWAP:</p>

      {/* <CardActions>
        <AllowanceButton
          tokenAddress={inputToken.token_address}
          spenderAddress={pairAddress}
          amount={BigNumber(inputTokenAmount).shiftedBy(7)}
          sorobanContext={sorobanContext}
        />
      </CardActions> */}

      <CardActions>
        <SwapButton
          pairAddress={pairAddress}
          maxTokenA={BigNumber("1.1").multipliedBy(BigNumber(inputTokenAmount)).shiftedBy(7)}
          amountOut={BigNumber(outputTokenAmount).shiftedBy(7)}
          isBuy={inputToken.token_address==token1?.token_address}
          sorobanContext={sorobanContext}
        />
      </CardActions>
    </div>
  );

  // amountOut={slippage.multipliedBy(BigNumber(outputTokenAmount)).shiftedBy(7)}

}

function twoDecimalsPercentage(value: string) {
  // convert string to number
  const numericValue = parseFloat(value);

  return Math.round(numericValue * 10000) / 100;
}