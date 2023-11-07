import axios from './axios';

export const fetchKeys = async () => {
  const { data } = await axios.get('/api/keys');

  return data;
};
