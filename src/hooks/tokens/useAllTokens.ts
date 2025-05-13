import { useApiTokens } from './useApiTokens';
import { useUserAddedTokens } from './useUserAddedTokens';

//Returns tokens from the API and user added
export const useAllTokens = (tokenInitiator?: string) => {
  const { tokensAsMap: apiTokensAsMap, tokens: apiTokens, isLoading } = useApiTokens();
  const { tokensAsMap: userAddedTokensAsMap, tokens: userTokens } = useUserAddedTokens();

  return {
    tokensAsMap: { ...apiTokensAsMap, ...userAddedTokensAsMap },
    tokens: [...apiTokens, ...userTokens],
    isLoading: isLoading,
  };
};
