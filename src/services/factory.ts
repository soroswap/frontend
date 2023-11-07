import axios from './axios';

export const fetchFactory = async () => {
  const { data } = await axios.get('/api/factory');

  return data;
};
