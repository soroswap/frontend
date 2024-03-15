import { SorobanContextType } from '@soroban-react/core';
import { getClassicStellarAsset, isAddress } from 'helpers/address';
import { getTokenDecimals, getTokenName, getTokenSymbol } from 'helpers/soroban';
import { TokenMapType, TokenType, tokensResponse } from 'interfaces';

export const tokensToMap = (tokens: TokenType[]) => {
  if (!tokens) return {};

  return tokens.reduce((map: TokenMapType, token) => {
    map[token.contract] = token;
    return map;
  }, {});
};

//Adds a token to the userAddedTokens localStorage
export const addUserToken = (token: TokenType, sorobanContext: SorobanContextType) => {
  if (!token) return;

  const activeChain = sorobanContext.activeChain?.name?.toLowerCase();

  const userAddedTokensStr = localStorage.getItem(`userAddedTokens`) || '[]';
  const userAddedTokens = JSON.parse(userAddedTokensStr) ?? [];

  //get tokens added in the current network
  const findNetwork = userAddedTokens?.find(
    (item: tokensResponse) => item?.network === activeChain,
  );

  let newUserAddedTokens = [];

  if (findNetwork) {
    newUserAddedTokens = userAddedTokens.map((item: tokensResponse) => {
      if (item?.network === activeChain) {
        return {
          network: item?.network,
          tokens: [...(item?.tokens ?? []), token],
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
      contract: formattedAddress,
      name: name as string,
      code: symbol as string,
      decimals,
      icon: logo,
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
      (tkn: TokenType) => tkn.contract.toLowerCase() === address.toLowerCase(),
    );
    if (!token) return undefined;

    return token.icon;
  } catch (error) {
    return undefined;
  }
  return '';
};

//Checks if the stellar asset is wrapped
export async function isClassicStellarAsset(value: string, sorobanContext: SorobanContextType) {
  if (!value) return false;
  const { serverHorizon } = sorobanContext;
  const classicAsset = getClassicStellarAsset(value);
  try {
    if (!classicAsset) return false;

    const assets = await serverHorizon
      ?.assets()
      .forCode(classicAsset.assetCode)
      .forIssuer(classicAsset.issuer)
      .call();
    const exists = assets?.records && assets.records.length > 0;
    return !!exists;
  } catch (error) {
    console.log('Error checking asset:', error);
    return false;
  }
}
