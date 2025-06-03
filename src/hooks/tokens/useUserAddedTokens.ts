import { useSorobanReact } from 'stellar-react';
import { TokenMapType, TokenType, tokensResponse } from 'interfaces';
import { useEffect, useState, useMemo } from 'react';
import { tokensToMap } from './utils';
import { passphraseToBackendNetworkName } from 'services/pairs';

//Returns tokens added by the user
export const useUserAddedTokens = () => {
  const sorobanContext = useSorobanReact();


  const [userAddedTokens, setUserAddedTokens] = useState<tokensResponse[]>([]);

  const userAddedTokensLocalStorage = localStorage.getItem(`userAddedTokens`);

  useEffect(() => {
    const userAddedTokensStr = localStorage.getItem(`userAddedTokens`) || '[]';
    const userAddedTokens = (JSON.parse(userAddedTokensStr) ?? []) as tokensResponse[];
    setUserAddedTokens(userAddedTokens);
  }, [userAddedTokensLocalStorage]); // Depend only on localStorage string

  const tokensFromActiveChain = useMemo(() => {
    const activeNetwork = sorobanContext.activeNetwork;
    if (!activeNetwork) return [];
    const activeChain = passphraseToBackendNetworkName[activeNetwork].toLowerCase();
    return userAddedTokens?.find((item: tokensResponse) => item?.network === activeChain)?.tokens ?? [];
  }, [userAddedTokens, sorobanContext]); // Depend on userAddedTokens and sorobanContext

  const tokensAsMap = useMemo(() => tokensToMap(tokensFromActiveChain), [tokensFromActiveChain]); // Depend on tokensFromActiveChain

  return {
    allUserAddedTokens: userAddedTokens,
    tokens: tokensFromActiveChain,
    tokensAsMap,
  };
};
