import axios from './axios';

export const fetchFactory = async (network: string) => {
  if(network == 'mainnet') return {"address":"CA4HEQTL2WPEUYKYKCDOHCDNIV4QHNJ7EL4J4NQ6VADP7SYHVRYZ7AW2"}

  const { data } = await axios.get(`/api/${network}/factory`);

  return data;
};
