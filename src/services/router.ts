import axios from './axios';

export const fetchRouter = async () => {
  const { data } = await axios.get('/api/router');

  return data;
};
