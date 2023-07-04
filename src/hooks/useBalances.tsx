import { useSorobanReact } from '@soroban-react/core';
import { useContractValue } from '@soroban-react/contracts';
import { Constants } from '../constants';
import { scvalToBigNumber, accountToScVal, contractIdToScVal } from '../utils';
import { formatAmount } from '../utils';
import { useTokens } from './useTokens';
//TODO: create Liquidity Pool Balances

export function tokenBalance(tokenAddress: string, userAddress?: string) {
  const sorobanContext = useSorobanReact();

  if (!sorobanContext.address) return;

  const address = userAddress ?? sorobanContext.address;

  const user = accountToScVal(address);

  let balances = {
    tokenBalance: useContractValue({
      contractId: tokenAddress,
      method: 'balance',
      params: [user],
      sorobanContext: sorobanContext,
    }),
  };

  const decimals = useContractValue({
    contractId: tokenAddress,
    method: 'decimals',
    sorobanContext: sorobanContext,
  });

  const tokenDecimals = decimals?.result && (decimals.result?.u32() ?? 7);

  const formatedBalance = formatAmount(
    scvalToBigNumber(balances.tokenBalance.result),
    tokenDecimals
  );

  return formatedBalance;
}

export function tokenBalances(userAddress: string) {
  const sorobanContext = useSorobanReact();

  if (!sorobanContext.address) return;

  const address = userAddress ?? sorobanContext.address;

  const tokens = useTokens(sorobanContext);

  const balances = tokens.map((token) => {
    return {
      balance: tokenBalance(token.token_address, address),
      symbol: token.token_symbol,
      address: token.token_address,
    };
  });

  return balances;
}
