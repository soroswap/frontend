import { ApiNetwork } from "../types/network";
import { Pool } from "../types/pools";
import { fillDatesAndSort } from "../utils/complete-chart";
import axiosInstance from "./axios";

export const fetchPools = async ({ network }: ApiNetwork) => {
  const { data } = await axiosInstance.get<Pool[]>("/api/pairs", {
    params: { network },
  });

  return data;
};

interface FetchPoolProps extends ApiNetwork {
  poolAddress: string;
}

export const fetchPool = async ({ poolAddress, network }: FetchPoolProps) => {
  const { data } = await axiosInstance.get<Pool>(
    `/api/pairs?address=${poolAddress}`,
    { params: { network } }
  );
  return data;
};

export const fetchPoolTVLChart = async ({
  poolAddress,
}: {
  poolAddress: string;
}) => {
  const { data } = await axiosInstance.get<{ tvl: number; date: string }[]>(
    `/info/pool/tvl-chart/${poolAddress}?protocols=soroswap`
  );

  const filledData = fillDatesAndSort(data, "tvl");

  return filledData;
};

export const fetchPoolFeesChart = async ({
  poolAddress,
}: {
  poolAddress: string;
}) => {
  const { data } = await axiosInstance.get<{ fees: number; date: string }[]>(
    `/info/pool/fees-chart/${poolAddress}?protocols=soroswap`
  );

  const filledData = fillDatesAndSort(data, "fees");

  return filledData;
};

export const fetchPoolVolumeChart = async ({
  poolAddress,
}: {
  poolAddress: string;
}) => {
  const { data } = await axiosInstance.get<{ volume: number; date: string }[]>(
    `/info/pool/volume-chart/${poolAddress}?protocols=soroswap`
  );

  const filledData = fillDatesAndSort(data, "volume");

  return filledData;
};

export const fetchPoolsByTokenAddress = async ({
  tokenAddress,
}: {
  tokenAddress: string;
}) => {
  const { data } = await axiosInstance.get(`/info/pools/${tokenAddress}`);
  return data;
};
