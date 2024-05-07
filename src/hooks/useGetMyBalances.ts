import { SorobanContextType, useSorobanReact } from '@soroban-react/core';
import BigNumber from 'bignumber.js';
import { TokenType } from 'interfaces';
import { useCallback } from 'react';
import { BASE_FEE } from 'stellar-sdk';
import useSWRImmutable from 'swr/immutable';
import { useAllTokens } from './tokens/useAllTokens';
import { tokenBalances } from './useBalances';
import useGetSubentryCount from './useGetSubentryCount';
import useHorizonLoadAccount from './useHorizonLoadAccount';
import { AccountResponse } from '@stellar/stellar-sdk/lib/horizon';

interface FetchBalancesProps {
  address?: string;
  tokens: TokenType[];
  sorobanContext: SorobanContextType;
  account: AccountResponse | undefined;
}

const fetchBalances = async ({ address, tokens, sorobanContext, account }: FetchBalancesProps) => {
  if (!address || !tokens || !sorobanContext || !account) return null;

  const response = await tokenBalances(address, tokens, sorobanContext, account, true);

  return response;
};

function calculateAvailableBalance(
  balance?: string | number | BigNumber | null,
  networkFees?: string | number | BigNumber | null,
  subentryCount?: number,
): BigNumber {
  if(!balance) return BigNumber(0)
  const baseBalance = new BigNumber(balance).shiftedBy(-7);
  const adjustment = new BigNumber(networkFees ?? Number(BigNumber(BASE_FEE).shiftedBy(-7)))
    .plus(1)
    .plus(new BigNumber(subentryCount ?? 0).multipliedBy(0.5));
  return BigNumber.max(new BigNumber(0), baseBalance.minus(adjustment)).decimalPlaces(7);
}

const useGetMyBalances = () => {
  const sorobanContext = useSorobanReact();

  const { address } = sorobanContext;
  const { tokens, isLoading: isLoadingTokens } = useAllTokens();
  const { subentryCount, nativeBalance, isLoading: isSubentryLoading } = useGetSubentryCount();

  const { account, refetchAccount } = useHorizonLoadAccount();

  const { data, isLoading, mutate, error } = useSWRImmutable(
    address && account && tokens.length > 0
      ? ['balance', address, tokens, sorobanContext, account, tokens.length]
      : null,
    ([key, address, tokens, sorobanContext, account]) =>
      fetchBalances({ address, tokens, sorobanContext, account }),
  );
  const refreshBalances = useCallback(() => {
    if (address && account && tokens.length > 0) {
      refetchAccount();
      mutate();
    }
  }, [address, account, tokens, mutate]);

  const availableNativeBalance = useCallback(
    (networkFees?: string | number | BigNumber | null) =>
      calculateAvailableBalance(
        nativeBalance,
        networkFees,
        subentryCount,
      ),
    [nativeBalance, subentryCount],
  );

  return {
    sorobanContext,
    tokens,
    tokenBalancesResponse: data,
    availableNativeBalance,
    isError: error,
    isLoading: isLoading || isLoadingTokens || isSubentryLoading,
    refetch: refreshBalances,
  };
};

export default useGetMyBalances;
