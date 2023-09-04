import { SorobanContextType, useSorobanReact } from "@soroban-react/core";
import { contractInvoke, useContractValue } from "@soroban-react/contracts";
import {
  scvalToBigNumber,
  accountToScVal,
} from "../helpers/utils";
import { formatFixedAmount, formatTokenAmount } from "../helpers/format";
import { TokenMapType, TokenType } from "../interfaces";
import { scValStrToJs } from "helpers/convert";
import BigNumber from "bignumber.js";
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
  const tokenBalanceBigNumber= scvalToBigNumber(tokenBalance?.result)

  // We allways keep balances in string and stroops
  return formatTokenAmount(tokenBalanceBigNumber, tokenDecimals);
}

export function useTokenBalances(userAddress: string, tokens: TokenType[] | TokenMapType) {
  const address = userAddress;
  const balances = Object.values(tokens).map((token) => {
    return {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      balance: useFormattedTokenBalance(token.address, address),
      usdValue: 0,//TODO: should get usd value
      symbol: token.symbol,
      address: token.address,
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
      balance: useFormattedTokenBalance(token.address, address),
      usdValue: 0,//should get usd value
      symbol: token.symbol,
      address: token.address,
    };

  // Calculate the loading state
  const loading = false;

  return {
    balance: balance,
    loading: loading,
  };
}

export async function tokenBalance(tokenAddress: string, userAddress: string, sorobanContext: SorobanContextType) {
  const user = accountToScVal(userAddress);

  try {
    const tokenBalance = await contractInvoke({
      contractAddress: tokenAddress,
      method: "balance",
      args: [user],
      sorobanContext,
    });

    return scValStrToJs(tokenBalance?.xdr ?? "") as BigNumber.Value;
  } catch(error) {
    console.error("Error fetching token balance:", error);
    return 0; // or throw error;
  }
}

export async function tokenDecimals(tokenAddress: string, userAddress: string, sorobanContext: SorobanContextType) {
  try {
    const decimals = await contractInvoke({
      contractAddress: tokenAddress,
      method: "decimals",
      sorobanContext,
    });
    const tokenDecimals = scValStrToJs(decimals?.xdr ?? "") as number ?? 7;

    return tokenDecimals;
  } catch(error) {
    console.error("Error fetching token balance:", error);
    return 7; // or throw error;
  }
}


export async function tokenBalances(userAddress: string, tokens: TokenType[] | TokenMapType | undefined, sorobanContext: SorobanContextType) {
  console.log("🚀 ~ file: useBalances.tsx:140 ~ tokenBalances ~ tokens:", tokens)
  if (!tokens || !sorobanContext) return;

  const balances = await Promise.all(
    Object.values(tokens).map(async (token) => {
      const balanceResponse = await tokenBalance(token.address, userAddress, sorobanContext);
      console.log("🚀 ~ file: useBalances.tsx:145 ~ Object.values ~ balanceResponse:", balanceResponse)
      const decimalsResponse = await tokenDecimals(token.address, userAddress, sorobanContext);

      const formattedBalance = formatFixedAmount(
        BigNumber(balanceResponse),
        decimalsResponse,
      );
      
      return {
        balance: formattedBalance,
        usdValue: 0, //TODO: should get usd value
        symbol: token.symbol,
        address: token.address,
      };
    })
  );


  // Calculate the loading state
  const loading = balances.some((balance) => balance.balance === null);

  return {
    balances: balances,
    loading: loading,
  };
}
