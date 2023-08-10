import { useSorobanReact } from "@soroban-react/core";
import { ContractValueType, useContractValue } from "@soroban-react/contracts";
import { Constants } from "../constants";
import {
  scvalToBigNumber,
  accountToScVal,
  contractAddressToScVal,
} from "../helpers/utils";
import { formatAmount } from "../helpers/utils";
import { TokenMapType, TokenType } from "../interfaces";
import { useEffect, useState } from "react";
//TODO: create Liquidity Pool Balances

export function useTokenScVal(tokenAddress: string, userAddress: string) {
  const sorobanContext = useSorobanReact();

  const address = userAddress;

  const user = accountToScVal(address);

  const tokenBalance = useContractValue({
    contractAddress: tokenAddress,
    method: "balance",
    args: [user],
    sorobanContext: sorobanContext,
  });
  // console.log(
  //   "🚀 ~ file: useBalances.tsx:26 ~ useTokenBalance ~ tokenBalance:",
  //   tokenBalance,
  // );

  return tokenBalance;
}

export function useTokenDecimals(tokenAddress: string) {
  const sorobanContext = useSorobanReact();

  const decimals = useContractValue({
    contractAddress: tokenAddress,
    method: "decimals",
    sorobanContext: sorobanContext,
  });

  const tokenDecimals = decimals?.result?.u32() ?? 7;

  return tokenDecimals;
}

export function useFormattedTokenBalance(
  tokenAddress: string,
  userAddress: string,
) {
  // console.log("tokenAddress: ", tokenAddress);
  const tokenBalance = useTokenScVal(tokenAddress, userAddress);
  const tokenDecimals = useTokenDecimals(tokenAddress);
  const formattedBalance = formatAmount(
    scvalToBigNumber(tokenBalance?.result),
    tokenDecimals,
  );
  return formattedBalance;
}

export function useTokenBalances(userAddress: string, tokens: TokenType[] | TokenMapType) {
  const address = userAddress;
  const balances = Object.values(tokens).map((token) => {
    return {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      balance: useFormattedTokenBalance(token.token_address, address),
      usdValue: 0,//TODO: should get usd value
      symbol: token.token_symbol,
      address: token.token_address,
    };
  });

  // Calculate the loading state
  const loading = balances.some((balance) => balance.balance === null);

  return {
    balances: balances,
    loading: loading,
  };
}

export function useTokenBalance(userAddress: string, token: TokenType) {
  const address = userAddress;
  const balance = {
      balance: useFormattedTokenBalance(token.token_address, address),
      usdValue: 0,//should get usd value
      symbol: token.token_symbol,
      address: token.token_address,
    };

  // Calculate the loading state
  const loading = false;

  return {
    balance: balance,
    loading: loading,
  };
}
