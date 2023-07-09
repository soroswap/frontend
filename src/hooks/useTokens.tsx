import { SorobanContextType } from "@soroban-react/core";
import useSWR from "swr";
import { TokenType, tokensResponse } from "../interfaces";
// TODO: verify type of fetcher args
const fetcher = (...args: [any, any]) => fetch(...args).then((resp) => resp.json());

export const useTokens = (sorobanContext: SorobanContextType) => {
  const { data } = useSWR(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tokens`,
    fetcher,
  );
  let tokens: TokenType[] = [];

  const filtered = data?.filter(
    (item: tokensResponse) =>
      item.network === sorobanContext?.activeChain?.name?.toLowerCase(),
  );

  if (filtered?.length > 0) {
    tokens = filtered[0].tokens;
  }

  return tokens;
};
