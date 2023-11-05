import React, { useEffect, useState } from 'react';
import { useTokens } from './useTokens';
import { useSorobanReact } from '@soroban-react/core';
import { tokenBalances, tokenBalancesType } from './useBalances';

const useGetMyBalances = () => {
  const sorobanContext = useSorobanReact();
  const tokens = useTokens(sorobanContext);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [update, setUpdate] = useState<boolean>(false);

  const [tokenBalancesResponse, setTokenBalancesResponse] = useState<
    tokenBalancesType | undefined
  >();

  const refetch = () => {
    setUpdate((prev) => !prev);
  };

  useEffect(() => {
    if (sorobanContext.activeChain && sorobanContext.address && tokens.length > 0) {
      tokenBalances(sorobanContext.address, tokens, sorobanContext, true)
        .then((resp) => {
          setTokenBalancesResponse(resp);
        })
        .catch(() => setIsError(true))
        .finally(() => setIsLoading(false));
    }
  }, [sorobanContext, tokens, update]);

  return { sorobanContext, tokens, tokenBalancesResponse, isError, isLoading, refetch };
};

export default useGetMyBalances;
