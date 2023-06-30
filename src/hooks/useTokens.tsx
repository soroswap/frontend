import { SorobanContextType } from '@soroban-react/core';
import useSWR from 'swr';
const fetcher = (...args) => fetch(...args).then((resp) => resp.json());

export const useTokens = (sorobanContext: SorobanContextType) => {
  const { data } = useSWR(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tokens`,
    fetcher
  );
  let tokens = []

  const filtered = data?.filter((item) => item.network === sorobanContext?.activeChain?.name?.toLowerCase())
  
  if (filtered?.length > 0) {
    tokens = filtered[0].tokens
  }

  return tokens
}