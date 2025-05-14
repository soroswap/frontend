import { SorobanContextType, WalletNetwork } from 'stellar-react';
import { getClassicAssetSorobanAddress } from 'functions/getClassicAssetSorobanAddress';
import { getClassicStellarAsset, isAddress } from 'helpers/address';
import { getTokenName } from 'helpers/soroban';
import { TokenMapType, TokenType, tokensResponse } from 'interfaces';
import { getToken, isClassicStellarAsset, tokensToMap } from 'hooks/tokens/utils';
import { Asset } from '@stellar/stellar-sdk';
import { fetchTokens } from 'services/tokens';
import { passphraseToBackendNetworkName } from 'services/pairs';

export const findTokenService = async (
  tokenAddress: string | undefined,
  tokensAsMap: TokenMapType,
  sorobanContext: SorobanContextType
): Promise<TokenType | undefined> => {
  if (!tokenAddress || tokenAddress === '') return undefined;

  const classicAssetSearch = getClassicAssetSorobanAddress(tokenAddress!, sorobanContext);

  const formattedAddress = isAddress(classicAssetSearch ? classicAssetSearch : tokenAddress);
  if (!formattedAddress) return undefined;

  const fromMap = tokensAsMap[formattedAddress];

  if (fromMap) return fromMap;

  const token = await getToken(sorobanContext, formattedAddress);

  if (!token?.name || !token?.code) return undefined;
  // Here from token.name we will try to understand if this is a classic asset (even if we got a soroban contracta as address).
  const stellarAsset = getClassicStellarAsset(token.name);

  /*
    TODO: Here we might have a situation where a Soroban Contract has as name a CODE:ISSUER
    We need to have a beter way to know if a soroban contract its for sure a stellar classic asset, and which.
  */
  if (stellarAsset && typeof stellarAsset !== 'boolean') {
    return {
      issuer: stellarAsset.issuer,
      contract: token.contract,
      name: stellarAsset.asset,
      code: stellarAsset.assetCode,
      decimals: 7,
      icon: '',
    };
  }
  else {
    return token
  };
};

// Helper function to check if a token is a classic stellar asset
export const isClassicStellarAssetService = async (
  tokenAddress: string | undefined,
  sorobanContext: SorobanContextType
): Promise<boolean | undefined> => {
  if (!tokenAddress) return undefined;
  return isClassicStellarAsset(tokenAddress, sorobanContext);
};

// Helper function to get token name
export const getTokenNameService = async (
  tokenAddress: string | undefined,
  sorobanContext: SorobanContextType,
  
): Promise<string | null | undefined> => {
  if (!tokenAddress) return undefined;
  return getTokenName(tokenAddress, sorobanContext);
};

export const getAllTokensService = async (
  sorobanContext: SorobanContextType,
  
): Promise<{ tokens: TokenType[]; tokensAsMap: TokenMapType }> => {
  const { activeNetwork } = sorobanContext;
  if (!activeNetwork) {
    return { tokens: [], tokensAsMap: {} };
  }

  const activeChain = passphraseToBackendNetworkName[activeNetwork].toLowerCase();

  // Fetch API tokens
  const apiTokensData = await fetchTokens(activeChain);

  // If test net: apiTokens has strucuture [{network: 'mainnet': assets: []...}], 
  // for mainNet: {network: 'mainnet', assets: []}
  const apiTokens = (apiTokensData && apiTokensData?.length) ? 
  apiTokensData?.find((tkn: { network: string; }) => tkn && tkn.
    network === activeChain
  )?.assets : apiTokensData?.assets; 
  // Get user-added tokens from localStorage
  const userAddedTokensStr = localStorage.getItem(`userAddedTokens`) || '[]';
  const userAddedTokens = (JSON.parse(userAddedTokensStr) ?? []) as tokensResponse[];
  const userTokensFromActiveChain = userAddedTokens?.find(
    (item: tokensResponse) => item?.network === activeChain,
  )?.tokens ?? [];

  // Combine tokens
  const allTokens = [...apiTokens, ...userTokensFromActiveChain];
  const allTokensAsMap = tokensToMap(allTokens);

  return { tokens: allTokens, tokensAsMap: allTokensAsMap };
};