import axios from './axios';

export const fetchTokens = async () => {
  const { data } = await axios.get('/api/tokens');

  return data;
};
