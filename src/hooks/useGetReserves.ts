import { useSorobanReact } from 'stellar-react';
import useSWRImmutable from 'swr/immutable';
import { reservesBNWithTokens } from './useReserves';

interface Props {
  pairAddress?: string;
}

const useGetReserves = ({ pairAddress }: Props) => {
  const sorobanContext = useSorobanReact();
  const { data, error, isLoading, mutate } = useSWRImmutable(
    ['reserves', pairAddress],
    ([key, pairAddress]) => reservesBNWithTokens(pairAddress ?? '', sorobanContext),
  );

  return { data, isError: error, isLoading, mutate };
};

export default useGetReserves;
