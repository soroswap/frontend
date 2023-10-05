import { SorobanContextType } from "@soroban-react/core";
import { FactoryResponseType } from "interfaces/factory";

export const getPairs = async (sorobanContext: SorobanContextType) => {
  const fetchResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/pairs`)
  const data = await fetchResponse.json()

  const filtered = data?.filter(
    (item: FactoryResponseType) =>
      item.network === sorobanContext?.activeChain?.name?.toLowerCase(),
  );

  return filtered[0].pairs;
};