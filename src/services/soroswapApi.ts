import axios from 'axios';
import {
  MercuryPair,
  PlatformType,
  QuoteRequest,
  QuoteResponse,
} from 'state/routing/types';

export const fetchPairsFromApi = async (
  network: string,
  protocol: string,
): Promise<MercuryPair[]> => {
  try {
    const response = await axios.get(
      `/api/pools?network=${network.toLowerCase()}&protocol=${protocol}`,
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

    console.log(response.data);

    return { ...response.data, platform: PlatformType.AGGREGATOR };
  } catch (error: any) {
    console.error(`Unexpected error: ${error}`);
    return undefined;
  }
};
