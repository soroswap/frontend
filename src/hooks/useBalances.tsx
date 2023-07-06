import { useSorobanReact } from "@soroban-react/core";
import { useContractValue } from "@soroban-react/contracts";
import { Constants } from "../constants";
import {
  scvalToBigNumber,
  accountToScVal,
  contractIdToScVal,
} from "../helpers/utils";
import { formatAmount } from "../helpers/utils";
import { TokenType } from "../interfaces";
//TODO: create Liquidity Pool Balances

export function useTokenBalance(tokenAddress: string, userAddress: string) {
  const sorobanContext = useSorobanReact();

  const address = userAddress;

  const user = accountToScVal(address);

  const tokenBalance = useContractValue({
    contractId: tokenAddress,
    method: "balance",
    params: [user],
    sorobanContext: sorobanContext,
  });
  console.log(
    "🚀 ~ file: useBalances.tsx:26 ~ useTokenBalance ~ tokenBalance:",
    tokenBalance,
  );

  return tokenBalance;
}

export function useTokenDecimals(tokenAddress: string) {
  const sorobanContext = useSorobanReact();

  const decimals = useContractValue({
    contractId: tokenAddress,
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
  console.log("tokenAddress: ", tokenAddress);
  const tokenBalance = useTokenBalance(tokenAddress, userAddress);
  const tokenDecimals = useTokenDecimals(tokenAddress);
  const formattedBalance = formatAmount(
    scvalToBigNumber(tokenBalance.result),
    tokenDecimals,
  );
  return formattedBalance;
}

export function useTokenBalances(userAddress: string, tokens: TokenType[]) {
  const address = userAddress;
  const balances = tokens.map((token) => {
    return {
      balance: useFormattedTokenBalance(token.token_address, address),
      symbol: token.token_symbol,
      address: token.token_address,
    };
  });

  return balances;
}
