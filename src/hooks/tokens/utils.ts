import { SorobanContextType } from '@soroban-react/core';
import { isAddress } from 'helpers/address';
import { getTokenDecimals, getTokenName, getTokenSymbol } from 'helpers/soroban';
import { TokenMapType, TokenType, tokensResponse } from 'interfaces';

export const tokensToMap = (tokens: TokenType[]) => {
  if (!tokens) return {};

  return tokens.reduce((map: TokenMapType, token) => {
    map[token.address] = token;
    return map;
  }, {});
};

//Adds a token to the userAddedTokens localStorage
export const addUserToken = (token: TokenType, sorobanContext: SorobanContextType) => {
  const activeChain = sorobanContext.activeChain?.name?.toLowerCase();

  const userAddedTokensStr = localStorage.getItem(`userAddedTokens`) || '[]';
  const userAddedTokens = JSON.parse(userAddedTokensStr);

  //get tokens added in the current network
  const findNetwork = userAddedTokens.find(
    ({ network }: tokensResponse) => network === activeChain,
  );

  let newUserAddedTokens = [];

  if (findNetwork) {
    newUserAddedTokens = userAddedTokens.map(({ tokens, network }: tokensResponse) => {
      if (network === activeChain) {
        return {
          network,
          tokens: [...tokens, token],
        };
      }
    });
  } else {
    newUserAddedTokens = [
      ...userAddedTokens,
      {
        network: activeChain,
        tokens: [token],
      },
    ];
  }

  localStorage.setItem(`userAddedTokens`, JSON.stringify(newUserAddedTokens));
};

export async function getToken(
  sorobanContext: SorobanContextType,
  tokenAddress?: string | undefined,
): Promise<TokenType | undefined> {
  if (!tokenAddress || tokenAddress === '' || !sorobanContext.activeChain) return undefined;

  let name, symbol, decimals, logo;

  try {
    const formattedAddress = isAddress(tokenAddress);
    if (!formattedAddress) return;
    name = await getTokenName(formattedAddress, sorobanContext);
    symbol = await getTokenSymbol(formattedAddress, sorobanContext);
    decimals = await getTokenDecimals(formattedAddress, sorobanContext);
    logo = await getTokenLogo(formattedAddress, sorobanContext);

    const token: TokenType = {
      address: formattedAddress,
      name: name as string,
      symbol: symbol as string,
      decimals,
      logoURI: logo,
    };

    return token;
  } catch (error) {
    console.log('🚀 « error:', error);
  }
}

export const getTokenLogo = async (address: string, sorobanContext: SorobanContextType) => {
  const backendURL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tokens`;

  // fetch token list from url
  try {
    const response = await fetch(backendURL);
    if (!response.ok) {
      return undefined;
    }

    const tokenData = await response.json();

    // Find the object that matches the activeChain
    const activeChainTokens = tokenData.find(
      (chain: { network: string }) =>
        chain.network.toLowerCase() === sorobanContext.activeChain?.name?.toLowerCase(),
    );
    if (!activeChainTokens) return undefined;

    // Find the token that matches the tokenAddress
    const token: TokenType = activeChainTokens.tokens.find(
      (tkn: TokenType) => tkn.address.toLowerCase() === address.toLowerCase(),
    );
    if (!token) return undefined;

    return token.logoURI;
  } catch (error) {
    return undefined;
  }
  return '';
};
