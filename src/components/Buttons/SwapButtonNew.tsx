import { ButtonProps as ButtonPropsOriginal, Button as MuiButton, styled } from '@mui/material';
import { contractTransaction, useSendTransaction } from '@soroban-react/contracts';
import { SorobanContextType } from '@soroban-react/core';
import BigNumber from 'bignumber.js';
import { BodyPrimary } from 'components/Text';
import { useTokensFromPair } from 'hooks/useTokensFromPair';
import { TokenType } from 'interfaces/tokens';
import { darken } from 'polished';
import { useMemo, useState } from 'react';
import * as SorobanClient from 'soroban-client';
import { bigNumberToI128 } from '../../helpers/utils';

interface SwapButtonProps {
  sorobanContext: SorobanContextType;
  pairAddress: string;
  inputTokenAmount: number;
  outputTokenAmount: number;
  setToken0: (token: TokenType | null) => void;
  setToken1: (token: TokenType | null) => void;
  isBuy: boolean;
  tokens: TokenType[];
}

type ButtonProps = Omit<ButtonPropsOriginal, 'css'>;

type BaseButtonProps = {
  padding?: string;
  width?: string;
  $borderRadius?: string;
  altDisabledStyle?: boolean;
} & ButtonProps;

export const BaseButton = styled(MuiButton, {
  shouldForwardProp: (prop) => prop !== '$borderRadius',
})<BaseButtonProps>`
  padding: ${({ padding }) => padding ?? '16px'};
  width: ${({ width }) => width ?? '100%'};
  font-weight: 500;
  text-align: center;
  border-radius: ${({ $borderRadius }) => $borderRadius ?? '20px'};
  outline: none;
  border: 1px solid transparent;
  color: ${({ theme }) => theme.palette.customBackground.module};
  text-decoration: none;
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  align-items: center;
  cursor: pointer;
  position: relative;
  z-index: 1;
  &:disabled {
    opacity: 50%;
    cursor: auto;
    pointer-events: none;
  }

  will-change: transform;
  transition: transform 450ms ease;
  transform: perspective(1px) translateZ(0);

  > * {
    user-select: none;
  }

  > a {
    text-decoration: none;
  }
`;

export const ButtonPrimary = styled(BaseButton)`
  background-color: ${({ theme }) => theme.palette.customBackground.module};
  font-size: 20px;
  font-weight: 600;
  padding: 16px;
  color: ${({ theme }) => theme.palette.customBackground.module};
  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.05, theme.palette.grey[100])};
    background-color: ${({ theme }) => darken(0.05, theme.palette.grey[100])};
  }
  &:hover {
    background-color: ${({ theme }) => darken(0.05, theme.palette.grey[100])};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.1, theme.palette.grey[100])};
    background-color: ${({ theme }) => darken(0.1, theme.palette.grey[100])};
  }
  &:disabled {
    background-color: ${({ theme, altDisabledStyle, disabled }) =>
      altDisabledStyle
        ? disabled
          ? theme.palette.grey[100]
          : theme.palette.customBackground.module
        : theme.palette.customBackground.module};
    color: ${({ altDisabledStyle, disabled, theme }) =>
      altDisabledStyle
        ? disabled
          ? theme.palette.grey[100]
          : theme.palette.text.secondary
        : theme.palette.text.secondary};
    cursor: auto;
    box-shadow: none;
    border: 1px solid transparent;
    outline: none;
  }
`;

export function SwapButtonNew({
  sorobanContext,
  pairAddress,
  inputTokenAmount,
  outputTokenAmount,
  setToken0,
  setToken1,
  isBuy,
  tokens,
}: SwapButtonProps) {
  const tokensFromPair = useTokensFromPair(pairAddress, sorobanContext);
  useMemo(() => {
    setToken0(tokens.find((token) => token.address === tokensFromPair?.token0) ?? null);
    setToken1(tokens.find((token) => token.address === tokensFromPair?.token1) ?? null);
  }, [setToken0, setToken1, tokensFromPair, tokens]);

  const [isSubmitting, setSubmitting] = useState(false);
  const networkPassphrase = sorobanContext.activeChain?.networkPassphrase ?? '';
  const server = sorobanContext.server;
  const account = sorobanContext.address;
  let xdr = SorobanClient.xdr;
  const { sendTransaction } = useSendTransaction();
  const maxTokenA = BigNumber('1.1').multipliedBy(BigNumber(inputTokenAmount)).shiftedBy(7);
  const amountOut = BigNumber(outputTokenAmount).shiftedBy(7);

  const swapTokens = async () => {
    setSubmitting(true);

    //Parse amount to mint to BigNumber and then to i128 scVal
    const amountOutScVal = bigNumberToI128(amountOut);
    const amountInScVal = bigNumberToI128(maxTokenA);

    let walletSource;

    if (!account) {
      console.log('Error on account:', account);
      return;
    }

    try {
      walletSource = await server?.getAccount(account!);
    } catch (error) {
      alert('Your wallet or the token admin wallet might not be funded');
      setSubmitting(false);
      return;
    }
    if (!walletSource) {
      console.log('Error on walletSource:', walletSource);
      return;
    }
    const options = {
      sorobanContext,
    };

    try {
      //Builds the transaction
      let tx = contractTransaction({
        source: walletSource!,
        networkPassphrase,
        contractAddress: pairAddress,
        method: 'swap',
        args: [
          new SorobanClient.Address(account!).toScVal(),
          xdr.ScVal.scvBool(isBuy),
          amountOutScVal,
          amountInScVal,
        ],
      });

      //Sends the transactions to the blockchain
      console.log(tx);

      let result = await sendTransaction(tx, options);

      if (result) {
        alert('Success!');
      }
      console.log('🚀 ~ file: SwapButton.tsx ~ swapTokens ~ result:', result);

      //This will connect again the wallet to fetch its data
      sorobanContext.connect();
    } catch (error) {
      console.log('🚀 « error:', error);
    }

    setSubmitting(false);
  };

  return (
    <ButtonPrimary onClick={swapTokens} disabled={isSubmitting}>
      <BodyPrimary>
        <span>Swap</span>
      </BodyPrimary>
    </ButtonPrimary>
  );
}
