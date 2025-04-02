import { SorobanContext, SorobanContextType } from 'stellar-react';
import { useEffect, useState } from 'react';
import { fetchFactory } from 'services/factory';
import useSWRImmutable from 'swr/immutable';
import { passphraseToBackendNetworkName } from 'services/pairs';

export const useFactory = (sorobanContext: SorobanContextType) => {
  const { activeNetwork } = sorobanContext;
  const activeChain = passphraseToBackendNetworkName[activeNetwork!].toLowerCase();

    const { data, error, isLoading, mutate } = useSWRImmutable(
    ['factory', activeChain],
    ([key, activeChain]) =>
      fetchFactory(activeChain),
  );

  const [factory, setFactory] = useState<string>();

  useEffect(() => {
    if (!data || !SorobanContext) return;

    setFactory(data.address)
  }, [data, sorobanContext]);

  return { factory, isLoading, isError: error, mutate };
};
