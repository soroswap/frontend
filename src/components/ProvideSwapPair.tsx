import * as React from "react";
import CardActions from "@mui/material/CardActions";
import { useReservesBigNumber } from "../hooks/useReserves";
import { SorobanContextType } from "@soroban-react/core";
import { Checkbox } from "@mui/material";
import BigNumber from "bignumber.js";
import { PairBalance } from "./PairBalance";
import { SwapButton } from "./buttons/SwapButton";


function ProvideSwapPair({
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
    const [isBuy, setIsBuy] = React.useState<boolean>(true);
    // TODO calculate optimal output amount
    if (!isLiquidity) {
      //changeOutput(optimalSwapOutputAmount)
    }
  
    return (
      <div>
        <p>Buy token A?</p>
        <Checkbox checked={isBuy} onChange={() => setIsBuy(!isBuy)} />
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
        <CardActions>
          <SwapButton
            pairAddress={pairAddress}
            maxTokenA={BigNumber(inputTokenAmount)}
            amountOut={BigNumber(outputTokenAmount)}
            isBuy={isBuy}
            sorobanContext={sorobanContext}
          />
        </CardActions>
      </div>
    );
  }
  