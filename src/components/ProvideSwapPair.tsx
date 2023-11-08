import CardActions from '@mui/material/CardActions';
import { SorobanContextType } from '@soroban-react/core';
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { SwapButton } from '../components/Buttons/SwapButton';
import { formatTokenAmount } from '../helpers/format';
import { useTokens } from '../hooks';
import { useReservesBigNumber } from '../hooks/useReserves';
import { useTokensFromPair } from '../hooks/useTokensFromPair';
import { TokenType } from '../interfaces';

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
  setToken0: (token: TokenType | null) => void;
  setToken1: (token: TokenType | null) => void;
  token0: TokenType | null;
  token1: TokenType | null;
  inputToken: TokenType;
  outputToken: TokenType;
}) {
  const { tokens } = useTokens();
  const tokensFromPair = useTokensFromPair(pairAddress, sorobanContext);

  const reserves = useReservesBigNumber(pairAddress, sorobanContext);
  useMemo(() => {
    setToken0(tokens.find((token) => token.address === tokensFromPair?.token0) ?? null);
    setToken1(tokens.find((token) => token.address === tokensFromPair?.token1) ?? null);
  }, [setToken0, setToken1, tokensFromPair, tokens]);

  return (
    <div>
      {
        //<p>Buy token A?</p>
        //<Checkbox checked={isBuy} onChange={() => setIsBuy(!isBuy)} />
      }
      <p>..</p>
      <p>### CURRENT INFORMATION</p>

      <p>- token0: {token0?.name}</p>
      <p>- token1: {token1?.name}</p>
      <p>
        - token0 reserves {formatTokenAmount(reserves.reserve0)} {token0?.name}
      </p>
      <p>
        - token1 reserves {formatTokenAmount(reserves.reserve1)} {token1?.name}
      </p>
      <p>- Price Impact: %</p>
      <p>..</p>
      <p>### IF YOU SWAP:</p>

      {/* <CardActions>
        <AllowanceButton
          tokenAddress={inputToken.address}
          spenderAddress={pairAddress}
          amount={BigNumber(inputTokenAmount).shiftedBy(7)}
          sorobanContext={sorobanContext}
        />
      </CardActions> */}

      <CardActions>
        <SwapButton
          pairAddress={pairAddress}
          maxTokenA={BigNumber('1.1').multipliedBy(BigNumber(inputTokenAmount)).shiftedBy(7)}
          amountOut={BigNumber(outputTokenAmount).shiftedBy(7)}
          isBuy={inputToken.address == token1?.address}
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
