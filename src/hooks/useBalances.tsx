import { useSorobanReact } from '@soroban-react/core';
import { useContractValue } from '@soroban-react/contracts';
import { Constants } from '../constants';
import {
  scvalToBigNumber,
  accountIdentifier,
  contractIdentifier,
} from '@soroban-react/utils';

export function useBalances() {
  const sorobanContext = useSorobanReact();
  let balancesBigNumber;
  if (sorobanContext.address) {
    const user = accountIdentifier(sorobanContext.address);

    let balances = {
      userBalance_1: useContractValue({
        contractId: Constants.TokenId_1,
        method: 'balance',
        params: [user],
        sorobanContext: sorobanContext,
      }),

      userBalance_2: useContractValue({
        contractId: Constants.TokenId_2,
        method: 'balance',
        params: [user],
        sorobanContext: sorobanContext,
      }),
      liquidityPoolBalance_1: useContractValue({
        contractId: Constants.TokenId_1,
        method: 'balance',
        params: [contractIdentifier(Constants.LiquidityPoolId)],
        sorobanContext: sorobanContext,
      }),

      liquidityPoolBalance_2: useContractValue({
        contractId: Constants.TokenId_2,
        method: 'balance',
        params: [contractIdentifier(Constants.LiquidityPoolId)],
        sorobanContext: sorobanContext,
      }),
    };

    balancesBigNumber = {
      userBalance_1: scvalToBigNumber(balances.userBalance_1.result),
      userBalance_2: scvalToBigNumber(balances.userBalance_2.result),
      liquidityPoolBalance_1: scvalToBigNumber(
        balances.liquidityPoolBalance_1.result
      ),
      liquidityPoolBalance_2: scvalToBigNumber(
        balances.liquidityPoolBalance_2.result
      ),
    };
    return balancesBigNumber;
  } else {
    return undefined;
  }
}

export function tokenBalance(tokenAddress: string, userAddress?: string) {
  const sorobanContext = useSorobanReact();

  if (!sorobanContext.address) return;

  const address = userAddress ?? sorobanContext.address;

  let balancesBigNumber;

  const user = accountIdentifier(address);

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
