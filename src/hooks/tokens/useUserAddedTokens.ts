import { useSorobanReact } from 'stellar-react';
import { TokenMapType, TokenType, tokensResponse } from 'interfaces';
import { useEffect, useState } from 'react';
import { tokensToMap } from './utils';
import { passphraseToBackendNetworkName } from 'services/pairs';

//Returns tokens added by the user
export const useUserAddedTokens = () => {
  const sorobanContext = useSorobanReact();

  const [userAddedTokens, setUserAddedTokens] = useState<tokensResponse[]>([]);
  const [tokensFromActiveChain, setTokensFromActiveChain] = useState<TokenType[]>([]);
  const [tokensAsMap, setTokensAsMap] = useState<TokenMapType>({});

  const userAddedTokensLocalStorage = localStorage.getItem(`userAddedTokens`);

  useEffect(() => {
    const userAddedTokensStr = localStorage.getItem(`userAddedTokens`) || '[]';
    const userAddedTokens = (JSON.parse(userAddedTokensStr) ?? []) as tokensResponse[];
    const activeNetwork = sorobanContext.activeNetwork;
    const activeChain = passphraseToBackendNetworkName[activeNetwork!].toLowerCase();
    const tokensFromActiveChain =
      userAddedTokens?.find((item: tokensResponse) => item?.network === activeChain)?.tokens ?? [];
    const tokensAsMap = tokensToMap(tokensFromActiveChain);

    setUserAddedTokens(userAddedTokens);

    setTokensFromActiveChain(tokensFromActiveChain);
    setTokensAsMap(tokensAsMap);
  }, [sorobanContext, userAddedTokensLocalStorage]);

  return {
    allUserAddedTokens: userAddedTokens,
    tokens: tokensFromActiveChain,
    tokensAsMap,
  };
};
