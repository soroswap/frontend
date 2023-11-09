import { contractInvoke } from '@soroban-react/contracts';
import { SorobanContextType } from '@soroban-react/core';
import BigNumber from 'bignumber.js';
import { scValToJs } from 'helpers/convert';
import { xdr } from 'soroban-client';
import { formatTokenAmount } from '../helpers/format';
import { accountToScVal } from '../helpers/utils';
import { TokenMapType, TokenType } from '../interfaces';

export type relevantTokensType = {
  balance: number | string | BigNumber;
  usdValue: number;
  symbol: string;
  address: string;
  decimals: number;
  formatted: boolean | undefined;
};

export interface tokenBalancesType {
  balances: relevantTokensType[];
  notFound?: boolean;
}

//TODO: create Liquidity Pool Balances

export async function tokenBalance(
  tokenAddress: string,
  userAddress: string,
  sorobanContext: SorobanContextType,
) {
  const user = accountToScVal(userAddress);

  if (!tokenAddress) return 0;

  try {
    const tokenBalance = await contractInvoke({
      contractAddress: tokenAddress,
      method: 'balance',
      args: [user],
      sorobanContext,
    });

    return scValToJs(tokenBalance as xdr.ScVal) as BigNumber;
  } catch (error) {
    throw error;
  }
}

export async function tokenDecimals(tokenAddress: string, sorobanContext: SorobanContextType) {
  try {
    const decimals = await contractInvoke({
      contractAddress: tokenAddress,
      method: 'decimals',
      sorobanContext,
    });
    const tokenDecimals = (scValToJs(decimals as xdr.ScVal) as number) ?? 7;

    return tokenDecimals;
  } catch (error) {
    return 7; // or throw error;
  }
}

const notFoundReturn = (token: TokenType) => {
  return {
    balance: 0,
    usdValue: 0,
    symbol: token.symbol,
    address: token.address,
    decimals: 0,
    formatted: false,
  };
};

export async function tokenBalances(
  userAddress: string,
  tokens: TokenType[] | TokenMapType | undefined,
  sorobanContext: SorobanContextType,
  formatted?: boolean,
): Promise<tokenBalancesType | undefined> {
  if (!tokens || !sorobanContext) return;

  let notFound = false;

  const balances = await Promise.all(
    Object.values(tokens).map(async (token) => {
      try {
        //if not found, should skip and return 0 for all tokens
        if (notFound) return notFoundReturn(token);

        const balanceResponse = await tokenBalance(token.address, userAddress, sorobanContext);
        const decimalsResponse = await tokenDecimals(token.address, sorobanContext);
        let balance: number | string | BigNumber;
        if (formatted) {
          balance = formatTokenAmount(BigNumber(balanceResponse), decimalsResponse);
        } else {
          balance = balanceResponse;
        }

        return {
          balance: balance,
          usdValue: 0, //TODO: should get usd value
          symbol: token.symbol,
          address: token.address,
          decimals: decimalsResponse,
          formatted: formatted,
        };
      } catch (error: any) {
        //la cuenta no esta fundeada
        if (error?.code === 404) {
          notFound = true;
        }

        return notFoundReturn(token);
      }
    }),
  );

  return {
    balances,
    notFound,
  };
}
