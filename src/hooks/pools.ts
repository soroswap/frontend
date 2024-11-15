import { useQuery } from "@tanstack/react-query";
import {
  fetchPool,
  fetchPoolFeesChart,
  fetchPoolTVLChart,
  fetchPoolVolumeChart,
  fetchPools,
  fetchPoolsByTokenAddress,
} from "../services/pools";
import useQueryNetwork from "./use-query-network";

const key = "pools";

export const useQueryPools = () => {
  const { network, isValidQuery } = useQueryNetwork();

  return useQuery({
    queryKey: [key, network],
    queryFn: () => fetchPools({ network: network! }),
    enabled: isValidQuery,
  });
};

export const useQueryPool = ({ poolAddress }: { poolAddress: string }) => {
  const { network, isValidQuery } = useQueryNetwork();

  return useQuery({
    queryKey: [key, network, poolAddress],
    queryFn: () => fetchPool({ poolAddress, network: network! }),
    enabled: !!poolAddress && isValidQuery,
  });
};

export const useQueryPoolTVLChart = ({
  poolAddress,
}: {
  poolAddress: string;
}) => {
  const { network, isValidQuery } = useQueryNetwork();

  return useQuery({
    queryKey: [key, network, poolAddress, "tvl-chart"],
    queryFn: () => fetchPoolTVLChart({ poolAddress }),
    enabled: !!poolAddress && isValidQuery,
  });
};

export const useQueryPoolFeesChart = ({
  poolAddress,
}: {
  poolAddress: string;
}) => {
  const { network, isValidQuery } = useQueryNetwork();

  return useQuery({
    queryKey: [key, network, poolAddress, "fees-chart"],
    queryFn: () => fetchPoolFeesChart({ poolAddress }),
    enabled: !!poolAddress && isValidQuery,
  });
};

export const useQueryPoolVolumeChart = ({
  poolAddress,
}: {
  poolAddress: string;
}) => {
  const { network, isValidQuery } = useQueryNetwork();

  return useQuery({
    queryKey: [key, network, poolAddress, "volume-chart"],
    queryFn: () => fetchPoolVolumeChart({ poolAddress }),
    enabled: !!poolAddress && isValidQuery,
  });
};

export const useQueryPoolsByTokenAddress = ({
  tokenAddress,
}: {
  tokenAddress: string;
}) => {
  const { network, isValidQuery } = useQueryNetwork();

  return useQuery({
    queryKey: [key, network, tokenAddress],
    queryFn: () => fetchPoolsByTokenAddress({ tokenAddress }),
    enabled: !!tokenAddress && isValidQuery,
  });
};
