import axios from 'axios';
import {
  BuildSplitTradeReturn,
  BuildTradeReturn,
  MercuryPair,
  PlatformType,
  SwapRouteRequest,
  SwapRouteSplitRequest,
} from 'state/routing/types';

export const fetchPairsFromApi = async (
  network: string,
  protocol: string,
): Promise<MercuryPair[]> => {
  try {
    const response = await axios.get(
      `api/pairs?network=${network.toLowerCase()}&protocol=${protocol}`,
    );

    return response.data;
  } catch (error: any) {
    console.error(`Unexpected error: ${error}`);
    return [];
  }
};

export const getSwapRoute = async (
  network: string,
  request: SwapRouteRequest,
): Promise<BuildTradeReturn | undefined> => {
  try {
    const response = await axios.post<BuildTradeReturn>(
      `api/swap?network=${network.toLowerCase()}`,
      request,
    );

    return { ...response.data, platform: PlatformType.ROUTER };
  } catch (error: any) {
    console.error(`Unexpected error: ${error}`);
    return undefined;
  }
};

export const getSwapSplitRoute = async (
  network: string,
  request: SwapRouteSplitRequest,
): Promise<BuildSplitTradeReturn | undefined> => {
  try {
    const response = await axios.post(`api/swap/split?network=${network.toLowerCase()}`, request);

    return { ...response.data, platform: PlatformType.AGGREGATOR };
  } catch (error: any) {
    console.error(`Unexpected error: ${error}`);
    return undefined;
  }
};
