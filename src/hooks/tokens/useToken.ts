import { SorobanContextType, useSorobanReact } from '@soroban-react/core';
import { getClassicAssetSorobanAddress } from 'functions/getClassicAssetSorobanAddress';
import { getClassicStellarAsset, isAddress } from 'helpers/address';
import { getTokenName } from 'helpers/soroban';
import { TokenMapType, TokenType } from 'interfaces';
import useSWR, { useSWRConfig } from 'swr';
import useSWRImmutable from 'swr/immutable';
import { useAllTokens } from './useAllTokens';
import { getToken, isClassicStellarAsset } from './utils';

export const findToken = async (
  tokenAddress: string | undefined,
  tokensAsMap: TokenMapType,
  sorobanContext: SorobanContextType,
) => {
  if (!tokenAddress || tokenAddress === '') return undefined;

  const classicAssetSearch = getClassicAssetSorobanAddress(tokenAddress!, sorobanContext);

  const formattedAddress = isAddress(classicAssetSearch ? classicAssetSearch : tokenAddress);
  if (!formattedAddress) return undefined;

  const fromMap = tokensAsMap[formattedAddress];

  if (fromMap) return fromMap;

  const token = await getToken(sorobanContext, formattedAddress);

  if (!token?.name || !token?.code) return undefined;

  return token;
};

const revalidateKeysCondition = (key: any) => {
  const revalidateKeys = new Set(['token', 'isStellarClassicAsset', 'tokenName']);

  return Array.isArray(key) && key.some((k) => revalidateKeys.has(k));
};

//Returns token from map (user added + api) or network
export function useToken(tokenAddress: string | undefined) {
  const sorobanContext = useSorobanReact();
  const { tokensAsMap } = useAllTokens();

  const { data: name } = useSWR(
    tokenAddress && sorobanContext ? ['tokenName', tokenAddress, sorobanContext] : null,
    ([key, tokenAddress, sorobanContext]) => getTokenName(tokenAddress!, sorobanContext),
  );

  const { mutate } = useSWRConfig();
  const { data, isLoading, error } = useSWRImmutable(
    ['token', tokenAddress, tokensAsMap, sorobanContext],
    ([key, tokenAddress, tokensAsMap, sorobanContext]) =>
      findToken(tokenAddress, tokensAsMap, sorobanContext),
  );

  const handleTokenRefresh = () => {
    mutate((key: any) => revalidateKeysCondition(key), undefined, { revalidate: true });
  };

  const {
    data: isStellarClassicAsset,
    isLoading: isStellarClassicAssetLoading,
    error: isStellarClassicAssetError,
  } = useSWRImmutable(
    ['isStellarClassicAsset', tokenAddress, sorobanContext],
    ([key, tokenAddress, sorobanContext]) => isClassicStellarAsset(tokenAddress!, sorobanContext),
  );
  const bothLoading = isLoading || isStellarClassicAssetLoading;

  const needsWrapping = !data && isStellarClassicAsset;

  const needsWrappingOnAddLiquidity = (!data && isStellarClassicAsset) || !name;

  let newTokenData: TokenType | undefined = undefined;

  if (needsWrapping) {
    const sorobanAddress = getClassicAssetSorobanAddress(tokenAddress!, sorobanContext);
    const stellarAsset = getClassicStellarAsset(tokenAddress!);
    if (sorobanAddress || (stellarAsset && typeof sorobanAddress === 'string')) {
      if (stellarAsset && typeof stellarAsset !== 'boolean') {
        newTokenData = {
          issuer: stellarAsset.issuer,
          contract: sorobanAddress,
          name: stellarAsset.asset,
          code: stellarAsset.assetCode,
          decimals: 7,
          icon: '',
        };
      }
    }
  }

  //if not data and AssetExists return isWrapped: false
  return {
    token: data ?? newTokenData,
    needsWrapping,
    isLoading: bothLoading,
    isError: error,
    handleTokenRefresh,
    needsWrappingOnAddLiquidity,
  };
}
