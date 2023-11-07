import { SorobanContextType, useSorobanReact } from '@soroban-react/core';
import { isAddress } from 'helpers/address';
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { TokenMapType, TokenType, tokensResponse } from '../interfaces';
import useSWRImmutable from 'swr/immutable';

// TODO: verify type of fetcher args
const fetcher = (url: string) => fetch(url).then((resp) => resp.json());

export const useTokens = (sorobanContext: SorobanContextType) => {
  const { data } = useSWRImmutable(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tokens`, fetcher);

  const [tokens, setTokens] = useState<TokenType[]>([]);

  useEffect(() => {
    if (data && data.length > 0) {
      //TODO: Hardcode one activeChain for default tokens
      const filtered = data?.filter(
        (item: tokensResponse) => item.network === sorobanContext?.activeChain?.name?.toLowerCase(),
      );

      if (filtered?.length > 0) {
        setTokens(filtered[0].tokens);
      }
    }
  }, [data, sorobanContext?.activeChain?.name, tokens]);

  return tokens;
};

// reduce token array into a map
function useTokensAsMap(): TokenMapType {
  const sorobanContext = useSorobanReact();
  const tokens = useTokens(sorobanContext);

  return useMemo(() => {
    // reduce to just tokens
    return tokens.reduce((map: TokenMapType, token) => {
      map[token.address] = token;
      return map;
    }, {});
  }, [tokens]);
}

//TODO: Enable useUserAddedTokens() from uniswap interface
export function useDefaultActiveTokens(): TokenMapType {
  const tokensAsMap = useTokensAsMap();

  // const userAddedTokens = useUserAddedTokens()
  // return useMemo(() => {
  //   return (
  //     userAddedTokens
  //       // reduce into all ALL_TOKENS filtered by the current chain
  //       .reduce<{ [address: string]: Token }>(
  //         (tokenMap, token) => {
  //           tokenMap[token.address] = token
  //           return tokenMap
  //         },
  //         // must make a copy because reduce modifies the map, and we do not
  //         // want to make a copy in every iteration
  //         { ...tokensFromMap }
  //       )
  //   )
  // }, [tokensFromMap, userAddedTokens])
  return tokensAsMap;
}

export function useToken(tokenAddress?: string | null) {
  const tokens = useDefaultActiveTokens();
  return useTokenFromMapOrNetwork(tokens, tokenAddress);
}

export async function getToken(
  sorobanContext: SorobanContextType,
  tokenAddress?: string | undefined,
): Promise<TokenType | undefined> {
  if (!tokenAddress || tokenAddress === '' || !sorobanContext.activeChain) return undefined;

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
    const token = activeChainTokens.tokens.find(
      (tkn: TokenType) => tkn.address.toLowerCase() === tokenAddress.toLowerCase(),
    );
    if (!token) return undefined;

    // Set decimals to 7 if not present
    if (token.decimals === undefined) {
      token.decimals = 7;
    }

    return token;
  } catch (error) {
    return undefined;
  }
}

export function useTokenFromMapOrNetwork(
  tokens: TokenMapType,
  tokenAddress?: string | null,
): TokenType | null | undefined {
  const address = isAddress(tokenAddress);
  const token: TokenType | undefined = address ? tokens[address] : undefined;
  const tokenFromNetwork = useTokenFromActiveNetwork(
    token ? undefined : address ? address : undefined,
  );

  return tokenFromNetwork ?? token;
}

/**
 * Returns a Token from the tokenAddress.
 * Returns null if token is loading or null was passed.
 * Returns undefined if tokenAddress is invalid or token does not exist.
 */
export function useTokenFromActiveNetwork(
  tokenAddress: string | undefined,
): TokenType | null | undefined {
  //This is from uniswap interface
  //TODO: Make it work with useContractValue
  return null;
  // const { chainId } = useWeb3React()

  // const formattedAddress = isAddress(tokenAddress)
  // const tokenContract = useTokenContract(formattedAddress ? formattedAddress : undefined, false)
  // const tokenContractBytes32 = useBytes32TokenContract(formattedAddress ? formattedAddress : undefined, false)

  // // TODO (WEB-1709): reduce this to one RPC call instead of 5
  // // TODO: Fix redux-multicall so that these values do not reload.
  // const tokenName = useSingleCallResult(tokenContract, 'name', undefined, NEVER_RELOAD)
  // const tokenNameBytes32 = useSingleCallResult(tokenContractBytes32, 'name', undefined, NEVER_RELOAD)
  // const symbol = useSingleCallResult(tokenContract, 'symbol', undefined, NEVER_RELOAD)
  // const symbolBytes32 = useSingleCallResult(tokenContractBytes32, 'symbol', undefined, NEVER_RELOAD)
  // const decimals = useSingleCallResult(tokenContract, 'decimals', undefined, NEVER_RELOAD)

  // const isLoading = useMemo(
  //   () => decimals.loading || symbol.loading || tokenName.loading,
  //   [decimals.loading, symbol.loading, tokenName.loading]
  // )
  // const parsedDecimals = useMemo(() => decimals?.result?.[0] ?? DEFAULT_ERC20_DECIMALS, [decimals.result])

  // const parsedSymbol = useMemo(
  //   () => parseStringOrBytes32(symbol.result?.[0], symbolBytes32.result?.[0], UNKNOWN_TOKEN_SYMBOL),
  //   [symbol.result, symbolBytes32.result]
  // )
  // const parsedName = useMemo(
  //   () => parseStringOrBytes32(tokenName.result?.[0], tokenNameBytes32.result?.[0], UNKNOWN_TOKEN_NAME),
  //   [tokenName.result, tokenNameBytes32.result]
  // )

  // return useMemo(() => {
  //   // If the token is on another chain, we cannot fetch it on-chain, and it is invalid.
  //   if (typeof tokenAddress !== 'string' || !isSupportedChain(chainId) || !formattedAddress) return undefined
  //   if (isLoading || !chainId) return null

  //   return new Token(chainId, formattedAddress, parsedDecimals, parsedSymbol, parsedName)
  // }, [chainId, tokenAddress, formattedAddress, isLoading, parsedDecimals, parsedSymbol, parsedName])
}
