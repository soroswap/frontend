import * as React from "react";
import CardActions from "@mui/material/CardActions";
import { useReservesBigNumber } from "../hooks/useReserves";
import { SorobanContextType } from "@soroban-react/core";
import BigNumber from "bignumber.js";
import { PairBalance } from "./PairBalance";
import calculatePoolTokenOptimalAmount from "../functions/calculatePoolTokenOptimalAmount";
import { DepositButton } from "./buttons/DepositButton";


export function ProvideLiquidityPair({
    sorobanContext,
    pairAddress,
    inputTokenAmount,
    outputTokenAmount,
    changeOutput,
    isLiquidity,
  }: {
    sorobanContext: SorobanContextType;
    pairAddress: any;
    inputTokenAmount: any;
    outputTokenAmount: any;
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
    if (isLiquidity) {
      changeOutput(optimalLiquidityToken1Amount.shiftedBy(-7).toNumber());
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
        <p>Liquidity Pool tokens to receive: TODO</p>
        <CardActions>
          <DepositButton
            pairAddress={pairAddress}
            amount0={BigNumber(inputTokenAmount)}
            amount1={BigNumber(outputTokenAmount)}
            sorobanContext={sorobanContext}
          />
        </CardActions>
      </div>
    );
  }
  