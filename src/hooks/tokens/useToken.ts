import { SorobanContextType, useSorobanReact } from '@soroban-react/core';
import { getClassicAssetSorobanAddress } from 'functions/getClassicAssetSorobanAddress';
import { getClassicStellarAsset, isAddress } from 'helpers/address';
import { getTokenName } from 'helpers/soroban';
import { TokenMapType, TokenType } from 'interfaces';
import useSWR, { useSWRConfig } from 'swr';
import useSWRImmutable from 'swr/immutable';
import { useAllTokens } from './useAllTokens';
import { getToken, isClassicStellarAsset } from './utils';
import { Asset } from '@stellar/stellar-sdk';

interface TokenVolumeData {
  asset: {
    name: string;
    contract: string;
    code: string;
    icon: string;
    decimals: number;
  };
  volume24h: number;
}

interface TokenWithVolume extends TokenType {
  volume24h: number;
}

const fetchTokenVolumes = async (network: string): Promise<TokenVolumeData[]> => {
  const response = await fetch(`https://info.soroswap.finance/api/tokens?network=${network}`);
  if (!response.ok) {
    throw new Error('Failed to fetch token volumes');
  }
  const data = await response.json();
  return data.map((token: any) => ({
    asset: token.asset,
    volume24h: token.volume24h,
  }));
};

export function useVolumeData(networkName: string) {
  const { data, error } = useSWR(['tokenVolumes', networkName], ([_, network]) =>
    fetchTokenVolumes(network),
  );
  return {
    volumeData: data,
    isLoading: !data && !error,
    error,
  };
}

const revalidateKeysCondition = (key: any) => {
  const revalidateKeys = new Set(['token', 'isStellarClassicAsset', 'tokenName']);
  return Array.isArray(key) && key.some((k) => revalidateKeys.has(k));
};

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

  const stellarAsset = getClassicStellarAsset(token.name);

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

export function useToken(tokenAddress: string | undefined) {
  const sorobanContext = useSorobanReact();
  const { activeChain: network } = sorobanContext;
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

  const checkContractId = (
    contractId: string,
    code: string,
    issuer: string,
  ): boolean | undefined => {
    if (!issuer) {
      return undefined;
    }
    const asset = new Asset(code, issuer);
    if (asset.contractId(network?.networkPassphrase!) === contractId) {
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

  // Add volume data
  const networkName = network?.name === 'TESTNET' ? 'TESTNET' : 'MAINNET';
  const { volumeData } = useVolumeData(networkName);

  const specificTokenVolume = tokenAddress
    ? volumeData?.find((t) => t.asset.contract === tokenAddress)?.volume24h
    : undefined;

  const tokenWithVolume: TokenWithVolume | undefined = data
    ? {
        ...data,
        volume24h: specificTokenVolume ?? 0,
      }
    : newTokenData
    ? {
        ...newTokenData,
        volume24h: specificTokenVolume ?? 0,
      }
    : undefined;

  return {
    token: tokenWithVolume,
    tokenIsSafe: isSafe,
    needsWrapping,
    isLoading: bothLoading,
    isError: error,
    handleTokenRefresh,
    needsWrappingOnAddLiquidity,
  };
}
