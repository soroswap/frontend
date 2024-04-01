import { useSorobanReact } from '@soroban-react/core';
import { TokenMapType, TokenType, tokensResponse } from 'interfaces';
import { useEffect, useState } from 'react';
import { fetchTokens } from 'services/tokens';
import useSWRImmutable from 'swr/immutable';
import { tokensToMap } from './utils';

//Returns tokens from the API
export const useApiTokens = (): {
  tokens: TokenType[];
  mutate: () => void;
  isLoading: boolean;
  isError: any;
  data: any;
  tokensAsMap: TokenMapType;
} => {
  const sorobanContext = useSorobanReact();
  const { data, mutate, isLoading, error } = useSWRImmutable(
    ['tokens', sorobanContext?.activeChain?.id],
    () => fetchTokens(sorobanContext?.activeChain?.id!),
  );

  const [tokens, setTokens] = useState<TokenType[]>([]);
  const [tokensAsMap, setTokensAsMap] = useState<TokenMapType>({});

  useEffect(() => {
    if (data && sorobanContext.activeChain?.id == 'mainnet') {
      console.log('data', data.assets)
      setTokens(data.assets)
    }
    if (data && data.length > 0) {
      const filtered = data?.filter(
        (item: tokensResponse) => item.network === sorobanContext?.activeChain?.id,
      );

      if (filtered?.length > 0) {
        const tokens = filtered[0].assets;
        setTokens(tokens);
      }
    }
    const mappedTokens = tokensToMap(tokens);
    setTokensAsMap(mappedTokens);
  }, [data, sorobanContext?.activeChain?.id, tokens]);
 // console.log('tokens', tokens)
  return { tokens, mutate, isLoading, isError: error, data, tokensAsMap };
};
