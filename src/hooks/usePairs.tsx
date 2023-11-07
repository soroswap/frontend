import { useSorobanReact } from '@soroban-react/core';
import { useEffect, useState } from 'react';
import { fetchPairs } from 'services/pairs';
import useSWRImmutable from 'swr/immutable';

export const usePairs = () => {
  const sorobanContext = useSorobanReact();
  const { data } = useSWRImmutable('pairs', fetchPairs);

  const [pairs, setPairs] = useState([]);

  useEffect(() => {
    if (!data || !sorobanContext) return;

    const filtered = data?.filter(
      (item: any) => item.network === sorobanContext?.activeChain?.name?.toLowerCase(),
    );

    if (filtered?.length > 0) {
      setPairs(filtered[0].pairs);
    }
  }, [data, sorobanContext]);

  return pairs;
};
