import { SorobanContextType, useSorobanReact } from '@soroban-react/core';
import { TokenType } from 'interfaces';
import useSWRImmutable from 'swr/immutable';
import { useAllTokens } from './tokens/useAllTokens';
import { tokenBalances } from './useBalances';
import useHorizonLoadAccount from './useHorizonLoadAccount';
import { AccountResponse } from 'stellar-sdk/lib/horizon';

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

const useGetMyBalances = () => {
  const sorobanContext = useSorobanReact();

  const { address } = sorobanContext;
  const { tokens, isLoading: isLoadingTokens } = useAllTokens();

  const { account } = useHorizonLoadAccount();

  const { data, isLoading, mutate, error } = useSWRImmutable(
    address && account && tokens.length > 0
      ? ['balance', address, tokens, sorobanContext, account]
      : null,
    ([key, address, tokens, sorobanContext, account]) =>
      fetchBalances({ address, tokens, sorobanContext, account }),
  );

  return {
    sorobanContext,
    tokens,
    tokenBalancesResponse: data,
    isError: error,
    isLoading: isLoading || isLoadingTokens,
    refetch: mutate,
  };
};

export default useGetMyBalances;
