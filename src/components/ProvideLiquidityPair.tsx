import * as React from "react";
import CardActions from "@mui/material/CardActions";
import { useReservesBigNumber } from "../hooks/useReserves";
import { SorobanContextType } from "@soroban-react/core";
import BigNumber from "bignumber.js";
import { PairBalance } from "./PairBalance";
import calculatePoolTokenOptimalAmount from "../functions/calculatePoolTokenOptimalAmount";
import { DepositButton } from "./buttons/DepositButton";
import getLpTokensAmount from "../functions/getLpTokensAmount";


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
    const reserves = useReservesBigNumber(pairAddress, sorobanContext);
    console.log("🚀 ~ file: ChooseTokens.tsx:255 ~ reserves:", reserves);
    let optimalLiquidityToken1Amount = calculatePoolTokenOptimalAmount(
      BigNumber(inputTokenAmount).shiftedBy(7),
      reserves.reserve0,
      reserves.reserve1,
    );
    let expectedLpTokens = getLpTokensAmount(
      BigNumber(inputTokenAmount).shiftedBy(7),
      reserves.reserve0,
      pairAddress,
      sorobanContext,
    )
    if (isLiquidity) {
      changeOutput(optimalLiquidityToken1Amount.decimalPlaces(0).shiftedBy(-7).toNumber());
    }
  
    return (
      <div>
        <p>Current pair address {pairAddress}</p>
        <p>Current pair balance</p>
        {sorobanContext.address ? (
          <PairBalance
            pairAddress={pairAddress}
            sorobanContext={sorobanContext}
          />
        ) : (
          0
        )}
        <p>
          Current token0 reserves {reserves.reserve0.shiftedBy(-7).toString()}
        </p>
        <p>
          Current token1 reserves {reserves.reserve1.shiftedBy(-7).toString()}
        </p>
        <p>Liquidity Pool tokens to receive: {expectedLpTokens.shiftedBy(-7).toString()}</p>
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
  