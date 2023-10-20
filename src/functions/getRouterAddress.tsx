import { SorobanContextType } from "@soroban-react/core";
import { RouterResponseType, RouterType } from "interfaces/router";

export const getRouterAddress = async (sorobanContext: SorobanContextType) => {
  const fetchResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/router`)
  const data = await fetchResponse.json()

  let factory: RouterType = {
    router_address: "",
    router_id: "",
  };

  const filtered = data?.filter(
    (item: RouterResponseType) =>
      item.network === sorobanContext?.activeChain?.name?.toLowerCase(),
  );

  if (filtered?.length > 0) {
    factory = {
      router_address: filtered[0].router_address,
      router_id: filtered[0].router_id,
    };
  }

  return factory;
};