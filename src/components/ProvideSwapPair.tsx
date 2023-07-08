import * as React from "react";
import CardActions from "@mui/material/CardActions";
import { useReservesBigNumber } from "../hooks/useReserves";
import { SorobanContextType } from "@soroban-react/core";
import { Checkbox } from "@mui/material";
import BigNumber from "bignumber.js";
import { PairBalance } from "./PairBalance";
import { SwapButton } from "./buttons/SwapButton";
import getExpectedAmount from "../functions/getExpectedAmount";
import { AllowanceButton } from "./buttons/AllowanceButton";
import { TokenType } from "../interfaces";
import { useAllowance } from "../hooks/useAllowance";
import { useSlipaggeFactor } from "../hooks/useSlippageFactor";



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
        <p>Current pair address {pairAddress}</p>
        <p>
          Current token0 reserves {reserves.reserve0.shiftedBy(-7).toString()}
        </p>
        <p>
          Current token1 reserves {reserves.reserve1.shiftedBy(-7).toString()}
        </p>
        <p>Current spending allowed {allowance?allowance.shiftedBy(-7).toNumber():0}</p>
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
  