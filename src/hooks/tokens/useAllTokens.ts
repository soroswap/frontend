import { useApiTokens } from './useApiTokens';
import { useUserAddedTokens } from './useUserAddedTokens';

//Returns tokens from the API and user added
export const useAllTokens = () => {
  const { tokensAsMap: apiTokensAsMap, tokens: apiTokens } = useApiTokens();
  const { tokensAsMap: userAddedTokensAsMap, tokens: userTokens } = useUserAddedTokens();

  return {
    tokensAsMap: { ...apiTokensAsMap, ...userAddedTokensAsMap },
    tokens: [...apiTokens, ...userTokens],
  };
};
