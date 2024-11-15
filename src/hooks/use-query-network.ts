import { useRouter } from "next/router";
import { Network } from "../types/network";

type QueryNetwork = "mainnet" | "testnet";

const useQueryNetwork = () => {
  const router = useRouter();

  const query = router.query.network;

  const isValidQuery = query === "mainnet" || query === "testnet";

  if (!router.isReady) return { network: undefined, isValidQuery };

  const network = (isValidQuery ? query : "mainnet") as QueryNetwork;

  const networkName = network === "mainnet" ? "public" : "testnet";

  return { network: network?.toUpperCase() as Network, networkName, isValidQuery, query };
};

export default useQueryNetwork;
