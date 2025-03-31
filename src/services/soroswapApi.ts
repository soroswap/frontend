import axios from 'axios';
import { MercuryPair } from './pairs';

export const fetchPairs = async (
  network: string,
  protocol: string,
): Promise<MercuryPair[] | null> => {
  try {
    const response = await axios.get(
      `api/pairs?network=${network.toLowerCase()}&protocol=${protocol}`,
    );

    console.log(response);
    return response.data;
  } catch (error: any) {
    console.error(`Unexpected error: ${error}`);
    return null;
  }
};
