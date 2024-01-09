import { useSorobanReact } from '@soroban-react/core';
import { TokenMapType, TokenType, tokensResponse } from 'interfaces';
import { useEffect, useState } from 'react';
import { tokensToMap } from './utils';

//Returns tokens added by the user
export const useUserAddedTokens = () => {
  const sorobanContext = useSorobanReact();

  const [userAddedTokens, setUserAddedTokens] = useState<tokensResponse[]>([]);
  const [tokensFromActiveChain, setTokensFromActiveChain] = useState<TokenType[]>([]);
  const [tokensAsMap, setTokensAsMap] = useState<TokenMapType>({});

  useEffect(() => {
    const userAddedTokensStr = localStorage.getItem(`userAddedTokens`) || '[]';
    const userAddedTokens = (JSON.parse(userAddedTokensStr) ?? []) as tokensResponse[];
    const activeChain = sorobanContext.activeChain?.name?.toLowerCase();
    const tokensFromActiveChain =
      userAddedTokens?.find((item: tokensResponse) => item?.network === activeChain)?.tokens ?? [];
    const tokensAsMap = tokensToMap(tokensFromActiveChain);

    setUserAddedTokens(userAddedTokens);
    setTokensFromActiveChain(tokensFromActiveChain);
    setTokensAsMap(tokensAsMap);
  }, [sorobanContext]);

  return { allUserAddedTokens: userAddedTokens, tokens: tokensFromActiveChain, tokensAsMap };
};
