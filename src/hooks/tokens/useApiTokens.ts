import { useSorobanReact } from 'stellar-react';
import { TokenMapType, TokenType, tokensResponse } from 'interfaces';
import { useEffect, useState, useMemo } from 'react'; // Import useMemo
import { fetchTokens } from 'services/tokens';
import useSWRImmutable from 'swr/immutable';
import { tokensToMap } from './utils';
import { passphraseToBackendNetworkName } from 'services/pairs';

//Returns tokens from the API
export const useApiTokens = (initiator?: string) => {
  const sorobanContext = useSorobanReact();
  const [activeChain, setActiveChain] = useState<string>('');
  const {activeNetwork} = sorobanContext;
  useEffect(() => {
    if (activeNetwork) {
      let activeNetworkId = passphraseToBackendNetworkName[activeNetwork].toLowerCase();
      setActiveChain(activeNetworkId);
    }
  }, [activeNetwork]);
  
  const { data, mutate, isLoading, error } = useSWRImmutable(
    ['tokens', activeChain],
    () => fetchTokens(activeChain),
  );

  const [tokens, setTokens] = useState<TokenType[]>([]);
  const [tokensAsMap, setTokensAsMap] = useState<TokenMapType>({});

  useEffect(() => {
    if (data && activeChain == 'mainnet') {
      setTokens(data.assets)
    }
    if (data && data.length > 0) {
      const filtered = data?.filter(
        (item: tokensResponse) => item.network === activeChain,
      );

      if (filtered?.length > 0) {
        const tokens = filtered[0].assets;
        setTokens(tokens);
      }
    }
    const mappedTokens = tokensToMap(tokens);
    setTokensAsMap(mappedTokens);
  }, [data, activeChain, tokens]);
  return { tokens, mutate, isLoading, isError: error, data, tokensAsMap };
};
