import { SorobanContextType } from "@soroban-react/core";
import { FactoryResponseType, FactoryType } from "interfaces/factory";

export const getFactory = async (sorobanContext: SorobanContextType) => {
  const fetchResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/factory`)
  const data = await fetchResponse.json()

  let factory: FactoryType = {
    factory_address: "",
    factory_id: "",
  };

  const filtered = data?.filter(
    (item: FactoryResponseType) =>
      item.network === sorobanContext?.activeChain?.name?.toLowerCase(),
  );

  if (filtered?.length > 0) {
    factory = {
      factory_address: filtered[0].factory_address,
      factory_id: filtered[0].factory_id,
    };
  }

  return factory;
};