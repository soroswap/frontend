import * as React from "react";
import CardActions from "@mui/material/CardActions";
import { useReservesBigNumber } from "../hooks/useReserves";
import { SorobanContextType } from "@soroban-react/core";
import { Checkbox } from "@mui/material";
import BigNumber from "bignumber.js";
import { PairBalance } from "./PairBalance";
import { SwapButton } from "./buttons/SwapButton";
import getExpectedAmount from "../functions/getExpectedAmount";



export function ProvideSwapPair({
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
    const [isBuy, setIsBuy] = React.useState<boolean>(false);
    let output = getExpectedAmount(pairAddress, BigNumber(inputTokenAmount).shiftedBy(7), sorobanContext)
    if (!isLiquidity) {
      changeOutput(BigNumber(output).decimalPlaces(0).shiftedBy(-7).toNumber())
    }
  
    return (
      <div>
        {
        //<p>Buy token A?</p>
        //<Checkbox checked={isBuy} onChange={() => setIsBuy(!isBuy)} />
        }
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
        <CardActions>
          <SwapButton
            pairAddress={pairAddress}
            maxTokenA={BigNumber(inputTokenAmount).shiftedBy(7)}
            amountOut={BigNumber(outputTokenAmount).shiftedBy(7)}
            isBuy={isBuy}
            sorobanContext={sorobanContext}
          />
        </CardActions>
      </div>
    );
  }
  