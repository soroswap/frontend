import useSWR from 'swr';
const fetcher = (...args) => fetch(...args).then((resp) => resp.json());

export const useTokens = () => {
  const { data } = useSWR(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tokens`,
    fetcher
  );

  return data
}