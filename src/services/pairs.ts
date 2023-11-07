import axios from './axios';

export const fetchPairs = async () => {
  const { data } = await axios.get('/api/pairs');

  return data;
};
