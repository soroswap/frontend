import axios from './axios';

export const fetchRouter = async (network: string) => {
  const { data } = await axios.get(`/api/${network}/router`);

  return data;
};
