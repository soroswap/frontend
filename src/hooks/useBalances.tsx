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
  loading: boolean;
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
    return 0; // or throw error;
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

export async function tokenBalances(
  userAddress: string,
  tokens: TokenType[] | TokenMapType | undefined,
  sorobanContext: SorobanContextType,
  formatted?: boolean,
): Promise<tokenBalancesType | undefined> {
  if (!tokens || !sorobanContext) return;

  const balances = await Promise.all(
    Object.values(tokens).map(async (token) => {
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
    }),
  );

  // Calculate the loading state
  const loading = balances.some((balance) => balance.balance === null);

  return {
    balances: balances,
    loading: loading,
  };
}
