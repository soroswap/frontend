import useSWRImmutable from 'swr/immutable';
import { fetchAllSubscribedPairs } from 'services/pairs';

const useGetAllSubscribedPairs = () => {
  const { data, isLoading, error, mutate } = useSWRImmutable(['subscribed-pairs'], () =>
    fetchAllSubscribedPairs(),
  );

  return { data, isLoading, isError: error, mutate };
};

export default useGetAllSubscribedPairs;
