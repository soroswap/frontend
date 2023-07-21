import * as React from "react";
import CardActions from "@mui/material/CardActions";
import { useReservesBigNumber } from "../hooks/useReserves";
import { SorobanContextType } from "@soroban-react/core";
import BigNumber from "bignumber.js";
import { PairBalance } from "./PairBalance";
import calculatePoolTokenOptimalAmount from "../functions/calculatePoolTokenOptimalAmount";
import { DepositButton } from "./Buttons/DepositButton";
import getLpTokensAmount from "../functions/getLpTokensAmount";
import { useTokenBalance, useTokenDecimals } from "../hooks";
import { formatAmount, scvalToBigNumber } from "../helpers/utils";
import { useTotalShares } from "../hooks/useTotalShares";
import { useTokensFromPair } from "../hooks/useTokensFromPair";
import { useTokens } from "../hooks";


export function ProvideLiquidityPair({
    sorobanContext,
    pairAddress,
    inputTokenAmount,
    outputTokenAmount,
    changeOutput,
    isLiquidity,
  }: {
    sorobanContext: SorobanContextType;
    pairAddress: string;
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
    const pairBalance = useTokenBalance(pairAddress, sorobanContext.address!).result;
    const tokenDecimals = useTokenDecimals(pairAddress);
    const totalShares = useTotalShares(pairAddress, sorobanContext)
    let optimalLiquidityToken1Amount = calculatePoolTokenOptimalAmount(
      BigNumber(inputTokenAmount).shiftedBy(7),
      reserves.reserve0,
      reserves.reserve1,
    );
    let expectedLpTokens = getLpTokensAmount(
      BigNumber(inputTokenAmount).shiftedBy(7),
      reserves.reserve0,
      BigNumber(outputTokenAmount).shiftedBy(7),
      reserves.reserve1,
      pairAddress,
      sorobanContext,
    )
    if (isLiquidity) {
      changeOutput(optimalLiquidityToken1Amount.decimalPlaces(0).shiftedBy(-7).toNumber());
    }
  
    return (
      <div>
        <p>..</p>
        <p>### CURRENT INFORMATION</p>  
        
        <p>- token0: {token0Name}</p>
        <p>- token1: {token1Name}</p>
        <p>- Your LP tokens balance: {pairBalance !== undefined
        ? formatAmount(scvalToBigNumber(pairBalance), tokenDecimals)
        : "0"} LP</p>
        <p>- Your pool share {totalShares?scvalToBigNumber(pairBalance).dividedBy(totalShares).multipliedBy(100).decimalPlaces(7).toString():0}%</p>
        <p>- token0 reserves {formatAmount(reserves.reserve0)}</p>
        <p>- token1 reserves {formatAmount(reserves.reserve1)}</p>
        <p>..</p>
        <p>..</p>
        <p>### IF YOU DEPOSIT:</p> 
        <p>LP tokens to receive: {formatAmount(expectedLpTokens)}</p>
        <p>Your new pool share will be: {
            totalShares?
            (scvalToBigNumber(pairBalance).plus(expectedLpTokens)).dividedBy(totalShares.plus(expectedLpTokens)).multipliedBy(100).decimalPlaces(7).toString():100}%</p>
        <p>..</p>
        <p>..</p>
        <p>Pair address: {pairAddress}</p>
        <CardActions>
          <DepositButton
            pairAddress={pairAddress}
            amount0={BigNumber(inputTokenAmount).shiftedBy(7)}
            amount1={BigNumber(outputTokenAmount).shiftedBy(7)}
            sorobanContext={sorobanContext}
          />
        </CardActions>
      </div>
    );
  }
  