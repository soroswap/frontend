import axios from 'axios';
import {
  MercuryPair,
  PlatformType,
  QuoteRequest,
} from 'state/routing/types';
import { QuoteResponse } from '@soroswap/sdk';

export const fetchPairsFromApi = async (
  network: string,
  protocol: string,
): Promise<MercuryPair[]> => {
  try {
    const response = await axios.get(
      `/api/pairs?network=${network.toLowerCase()}&protocol=${protocol}`,
    );

    return response.data;
  } catch (error: any) {
    console.error(`Unexpected error: ${error}`);
    return [];
  }
};

export const getQuote = async (
  network: string,
  request: QuoteRequest,
): Promise<QuoteResponse | undefined> => {
  try {
    const response = await axios.post(`/api/quote?network=${network.toLowerCase()}`, request);

    return { ...response.data, platform: response.data.platform === "aggregator" ? PlatformType.AGGREGATOR : PlatformType.ROUTER };
  } catch (error: any) {
    console.error(`Unexpected error: ${error}`);
    return undefined;
  }
};
