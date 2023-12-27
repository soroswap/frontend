import { SorobanContextType, useSorobanReact } from '@soroban-react/core';
import { TokenType } from 'interfaces';
import useSWRImmutable from 'swr/immutable';
import { tokenBalances } from './useBalances';
import { useApiTokens } from './tokens/useApiTokens';

//TODO: NOT IN USE
interface FetchBalancesProps {
  address?: string;
  tokens: TokenType[];
  sorobanContext: SorobanContextType;
}

const fetchBalances = async ({ address, tokens, sorobanContext }: FetchBalancesProps) => {
  if (!address || !tokens || !sorobanContext) return null;

  const response = await tokenBalances(address, tokens, sorobanContext, true);

  return response;
};

const useGetMyBalances = () => {
  const sorobanContext = useSorobanReact();

  const { address } = sorobanContext;
  const { tokens, isLoading: isLoadingTokens } = useApiTokens();

  const { data, isLoading, mutate, error } = useSWRImmutable(
    ['balance', address, tokens, sorobanContext],
    ([key, address, tokens, sorobanContext]) => fetchBalances({ address, tokens, sorobanContext }),
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
