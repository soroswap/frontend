import { fetchTokens } from 'services/tokens';
import { TokenMapType, TokenType, tokensResponse } from 'interfaces';
import { tokensToMap } from './utils';
import { useEffect, useState } from 'react';
import { useSorobanReact } from '@soroban-react/core';
import useSWRImmutable from 'swr/immutable';

//Returns tokens from the API
export const useApiTokens = () => {
  const sorobanContext = useSorobanReact();
  const { data, mutate, isLoading, error } = useSWRImmutable(
    ['tokens', sorobanContext?.activeChain?.id],
    fetchTokens,
  );

  const [tokens, setTokens] = useState<TokenType[]>([]);
  const [tokensAsMap, setTokensAsMap] = useState<TokenMapType>({});

  useEffect(() => {
    if (data && data.length > 0) {
      const filtered = data?.filter(
        (item: tokensResponse) => item.network === sorobanContext?.activeChain?.id,
      );

      if (filtered?.length > 0) {
        const tokens = filtered[0].tokens;
        setTokens(tokens);
        const mappedTokens = tokensToMap(tokens);
        setTokensAsMap(mappedTokens);
      }
    }
  }, [data, sorobanContext?.activeChain?.id, tokens]);

  return { tokens, mutate, isLoading, isError: error, data, tokensAsMap };
};
