import { SorobanContext, SorobanContextType } from '@soroban-react/core';
import { useEffect, useState } from 'react';
import { fetchFactory } from 'services/factory';
import useSWRImmutable from 'swr/immutable';

export const useFactory = (sorobanContext: SorobanContextType) => {
  const { activeChain } = sorobanContext;

  const { data, error, isLoading, mutate } = useSWRImmutable(
    ['factory', activeChain],
    ([key, activeChain]) =>
      fetchFactory(activeChain?.id!),
  );

  const [factory, setFactory] = useState<string>();

  useEffect(() => {
    if (!data || !SorobanContext) return;

    setFactory(data.address)
  }, [data, sorobanContext]);

  return { factory, isLoading, isError: error, mutate };
};
