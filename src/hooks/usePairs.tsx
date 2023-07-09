import { SorobanContextType } from "@soroban-react/core";
import useSWR from "swr";
// TODO: verify type of fetcher args
const fetcher = (...args: [any, any]) => fetch(...args).then((resp) => resp.json());

export const usePairs = (sorobanContext: SorobanContextType) => {
  const { data } = useSWR(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/pairs`,
    fetcher,
  );

  console.log("🚀 ~ file: usePairs.tsx:8 ~ usePairs ~ data:", data);
  let pairs;

  const filtered = data?.filter(
    (item: any) =>
      item.network === sorobanContext?.activeChain?.name?.toLowerCase(),
  );

  if (filtered?.length > 0) {
    pairs = filtered[0].pairs;
  }

  return pairs;
};
