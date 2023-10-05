import CardActions from "@mui/material/CardActions";
import { SorobanContextType } from "@soroban-react/core";
import BigNumber from "bignumber.js";
import { useMemo } from "react";
import { DepositButton } from "../components/Buttons/DepositButton";
import getLpTokensAmount from "../functions/getLpTokensAmount";
import { formatTokenAmount } from "../helpers/format";
import { scvalToBigNumber } from "../helpers/utils";
import { tokenBalance, useTokens } from "../hooks";
import { useReservesBigNumber } from "../hooks/useReserves";
import { useTokensFromPair } from "../hooks/useTokensFromPair";
import { useTotalShares } from "../hooks/useTotalShares";
import { TokenType } from "../interfaces";


export function ProvideLiquidityPair({
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

    useMemo(() => {
      setToken0(tokens.find(token => token.address === tokensFromPair?.token0)??null);
      setToken1(tokens.find(token => token.address === tokensFromPair?.token1)??null);
    }, [setToken0, setToken1, tokensFromPair, tokens])
    const reserves = useReservesBigNumber(pairAddress, sorobanContext);
    let pairBalance
    tokenBalance(pairAddress, sorobanContext.address!, sorobanContext).then((resp) => pairBalance=resp);
    const totalShares = useTotalShares(pairAddress, sorobanContext)
    let expectedLpTokens = getLpTokensAmount(
      BigNumber(inputTokenAmount).shiftedBy(7),
      token0?.address === inputToken?.address?reserves.reserve0:reserves.reserve1,
      BigNumber(outputTokenAmount).shiftedBy(7),
      token1?.address === outputToken?.address?reserves.reserve1:reserves.reserve0,
      pairAddress,
      sorobanContext,
    )
  
    return (
      <div>
        <p>..</p>
        <p>### CURRENT INFORMATION</p>  
        
        <p>- token0: {token0?.name}</p>
        <p>- token1: {token1?.name}</p>
        <p>- Your LP tokens balance: {pairBalance !== undefined
        ? formatTokenAmount(pairBalance)
        : "0"} LP</p>
        <p>- Your pool share {totalShares?scvalToBigNumber(pairBalance).dividedBy(totalShares).multipliedBy(100).decimalPlaces(7).toString():0}%</p>
        <p>- token0 reserves {formatTokenAmount(reserves.reserve0)}</p>
        <p>- token1 reserves {formatTokenAmount(reserves.reserve1)}</p>
        <p>..</p>
        <p>..</p>
        <p>### IF YOU DEPOSIT:</p> 
        <p>LP tokens to receive: {formatTokenAmount(expectedLpTokens)}</p>
        <p>Your new pool share will be: {
            totalShares?
            (scvalToBigNumber(pairBalance).plus(expectedLpTokens)).dividedBy(totalShares.plus(expectedLpTokens)).multipliedBy(100).decimalPlaces(7).toString():100}%</p>
        <p>..</p>
        <p>..</p>
        <p>Pair address: {pairAddress}</p>
        <CardActions>
          <DepositButton
            pairAddress={pairAddress}
            amount0={token0?.address===inputToken.address?BigNumber(inputTokenAmount).shiftedBy(7):BigNumber(outputTokenAmount).shiftedBy(7)}
            amount1={token1?.address===outputToken.address?BigNumber(outputTokenAmount).shiftedBy(7):BigNumber(inputTokenAmount).shiftedBy(7)}
            sorobanContext={sorobanContext}
          />
        </CardActions>
      </div>
    );
  }
  