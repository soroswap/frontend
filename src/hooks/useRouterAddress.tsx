import { SorobanContextType, useSorobanReact } from "@soroban-react/core";
import { RouterResponseType, RouterType } from "interfaces/router";
import useSWR from "swr";
// TODO: verify type of fetcher args
const fetcher = (...args: [any, any]) => fetch(...args).then((resp) => resp.json());

export const useRouterAddress = () => {
  const sorobanContext: SorobanContextType = useSorobanReact();
  
  const { data } = useSWR(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/router`,
    fetcher,
  );

  let router: RouterType = {
    router_address: "",
    router_id: "",
  };

  const filtered = data?.filter(
    (item: RouterResponseType) =>
      item.network === sorobanContext?.activeChain?.name?.toLowerCase(),
  );

  if (filtered?.length > 0) {
    router = {
      router_address: filtered[0].router_address,
      router_id: filtered[0].router_id,
    };
  }

  return router;
};
