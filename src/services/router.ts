import axios from './axios';

export const fetchRouter = async (network: string) => {
  if(network == 'mainnet') return {"address":"CAG5LRYQ5JVEUI5TEID72EYOVX44TTUJT5BQR2J6J77FH65PCCFAJDDH"}

  const { data } = await axios.get(`/api/${network}/router`);

  return data;
};
