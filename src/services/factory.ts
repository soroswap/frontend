import axios from './axios';

export const fetchFactory = async (network: string) => {
  const { data } = await axios.get(`/api/${network}/factory`);

  return data;
};
