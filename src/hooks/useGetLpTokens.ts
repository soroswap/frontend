import { useSorobanReact } from '@soroban-react/core';
import { getLpTokens } from 'functions/getLpTokens';
import useSWRImmutable from 'swr/immutable';
import { useAllTokens } from './tokens/useAllTokens';

const useGetLpTokens = () => {
  const sorobanContext = useSorobanReact();
  const { tokensAsMap } = useAllTokens();

  const { data, isLoading, error, mutate } = useSWRImmutable(
    ['lp-tokens', sorobanContext],
    ([key, sorobanContext]) => getLpTokens(sorobanContext, tokensAsMap),
  );

  console.log('🚀 « data:', data);
  return { lpTokens: data, sorobanContext, isLoading, isError: error, mutate };
};

export default useGetLpTokens;
