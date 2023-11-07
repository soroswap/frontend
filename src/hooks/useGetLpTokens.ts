import { useSorobanReact } from '@soroban-react/core';
import { getLpTokens } from 'functions/getLpTokens';
import useSWRImmutable from 'swr/immutable';

const useGetLpTokens = () => {
  const sorobanContext = useSorobanReact();

  const { data, isLoading, error, mutate } = useSWRImmutable(
    ['getLpTokens', sorobanContext],
    ([key, sorobanContext]) => getLpTokens(sorobanContext),
  );

  return { lpTokens: data, sorobanContext, isLoading, isError: error, mutate };
};

export default useGetLpTokens;
