import { contractInvoke } from 'stellar-react';
import { SorobanContextType } from 'stellar-react';
import BigNumber from 'bignumber.js';
import { scValToJs } from 'helpers/convert';
import { xdr } from '@stellar/stellar-sdk';
import { AccountResponse } from '@stellar/stellar-sdk/lib/horizon';
import { formatTokenAmount } from '../helpers/format';
import { accountToScVal } from '../helpers/utils';
import { TokenMapType, TokenType } from '../interfaces';

export type relevantTokensType = {
  balance: number | string | BigNumber | null;
  usdValue: number;
  issuer?: string;
  code: string;
  contract: string;
  name?: string;
  domain?: string;
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
  sorobanContext: SorobanContextType
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
    // console.log("Token address doesnt exist", error);
    return null;
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
    issuer: token.issuer,
    code: token.code,
    contract: token.contract,
    name: token.name,
    domain: token.domain,
    decimals: 0,
    formatted: false,
  };
};

export async function tokenBalances(
  userAddress: string,
  tokens: TokenType[] | TokenMapType | undefined,
  sorobanContext: SorobanContextType,
  account: AccountResponse | undefined,
  formatted?: boolean,
): Promise<tokenBalancesType | undefined> {
  if (!tokens || !sorobanContext) return;

  let notFound = false;

  const balances = await Promise.all(
    Object.values(tokens).map(async (token) => {
      try {
        let balance: number | string | BigNumber | null;
        let decimalsResponse = 18;

        if (token.issuer) {
          balance =
            account?.balances?.find(
              (b: any) => b?.asset_issuer === token.issuer && b?.asset_code === token.code,
            )?.balance ?? null;
        } else {
          const balanceResponse = await tokenBalance(token.contract, userAddress, sorobanContext);
          if (!balanceResponse) return notFoundReturn(token);

          decimalsResponse = await tokenDecimals(token.contract, sorobanContext);

          if (formatted) {
            balance = formatTokenAmount(BigNumber(balanceResponse), decimalsResponse);
          } else {
            balance = balanceResponse;
          }
        }

        return {
          balance: balance,
          usdValue: 0, //TODO: should get usd value
          issuer: token.issuer,
          code: token.code,
          contract: token.contract,
          name: token.name,
          domain: token.domain,
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
