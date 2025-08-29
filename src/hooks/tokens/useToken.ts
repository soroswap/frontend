import { SorobanContextType, useSorobanReact, WalletNetwork } from 'stellar-react';
import { getClassicAssetSorobanAddress } from 'functions/getClassicAssetSorobanAddress';
import { getClassicStellarAsset, isAddress } from 'helpers/address';
import { getTokenName } from 'helpers/soroban';
import { TokenMapType, TokenType } from 'interfaces';
import useSWR, { useSWRConfig } from 'swr';
import useSWRImmutable from 'swr/immutable';
import { useAllTokens } from './useAllTokens';
import { getToken, isClassicStellarAsset } from './utils';
import { Asset } from '@stellar/stellar-sdk';

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
  // const token: TokenType = {
  //   contract: formattedAddress,
  //   name: name as string,
  //   code: symbol as string,
  //   decimals,
  //   icon: logo,
  // };

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
  } else {
    return token;
  }
};

const revalidateKeysCondition = (key: any) => {
  const revalidateKeys = new Set(['token', 'isStellarClassicAsset', 'tokenName']);

  return Array.isArray(key) && key.some((k) => revalidateKeys.has(k));
};

//Returns token from map (user added + api) or network
export function useToken(tokenAddress: string | undefined) {
  const sorobanContext = useSorobanReact();
  const { activeNetwork: network } = sorobanContext;
  const { tokensAsMap } = useAllTokens();

  const { data: name } = useSWRImmutable(
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

  const checkContractId = (
    contractId: string,
    code: string,
    issuer: string,
  ): boolean | undefined => {
    if (!issuer) {
      return undefined;
    }
    const asset = new Asset(code, issuer);
    if (asset.contractId(network ?? WalletNetwork.TESTNET) === contractId) {
      return true;
    } else {
      return false;
    }
  };
  const isSafe = data ? checkContractId(data.contract, data.code, data.issuer!) : false;

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
    tokenIsSafe: isSafe,
    needsWrapping,
    isLoading: bothLoading,
    isError: error,
    handleTokenRefresh,
    needsWrappingOnAddLiquidity,
  };
}
