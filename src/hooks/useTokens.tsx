import { SorobanContextType, useSorobanReact } from '@soroban-react/core';
import { isAddress } from 'helpers/address';
import { getTokenDecimals, getTokenName, getTokenSymbol } from 'helpers/soroban';
import { useEffect, useMemo, useState } from 'react';
import { fetchTokens } from 'services/tokens';
import useSWRImmutable from 'swr/immutable';
import { TokenMapType, TokenType, tokensResponse } from '../interfaces';

export const useTokens = () => {
  const sorobanContext = useSorobanReact();

  const { data, mutate, isLoading, error } = useSWRImmutable('tokens', fetchTokens);

  const [tokens, setTokens] = useState<TokenType[]>([]);

  useEffect(() => {
    if (data && data.length > 0) {
      const filtered = data?.filter(
        (item: tokensResponse) => item.network === (sorobanContext?.activeChain?.id) ,
      );

      if (filtered?.length > 0) {
        setTokens(filtered[0].tokens);
      }
    }
  }, [data, sorobanContext?.activeChain?.id, tokens]);

  return { tokens, mutate, isLoading, isError: error, data };
};

// reduce token array into a map
function useTokensAsMap(): TokenMapType {
  const sorobanContext = useSorobanReact();
  const { tokens } = useTokens();

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

  return token ?? tokenFromNetwork;
}

/**
 * Returns a Token from the tokenAddress.
 * Returns null if null was passed.
 * Returns undefined if tokenAddress is invalid or token does not exist.
 */
export function useTokenFromActiveNetwork(
  tokenAddress: string | undefined,
): TokenType | null {
  const sorobanContext = useSorobanReact()
  const [token, setToken] = useState<TokenType | null>(null); // Initialize tokenName state

  useEffect(() => {
    async function fetchTokenInfo() {
      if (tokenAddress) {
        const formattedAddress = isAddress(tokenAddress)

        if (formattedAddress) {
          try {
            const name = await getTokenName(formattedAddress, sorobanContext)
            const symbol = await getTokenSymbol(formattedAddress, sorobanContext)
            const decimals = await getTokenDecimals(formattedAddress, sorobanContext)

            if (!name || !symbol) {
              setToken(null)
            } else {
              setToken({address: formattedAddress, name, symbol, decimals})
            }
          } catch (error) {
            setToken(null)
          }

        } else {
          setToken(null)
        }
      } else {
        setToken(null)
      }
    }

    fetchTokenInfo()
  }, [tokenAddress, sorobanContext])

  return token
}
