import { FactoryResponseType, FactoryType } from '../interfaces/factory';
import { fetchFactory } from 'services/factory';
import { SorobanContext, SorobanContextType } from '@soroban-react/core';
import { useEffect, useState } from 'react';
import useSWRImmutable from 'swr/immutable';

export const useFactory = (sorobanContext: SorobanContextType) => {
  const { data } = useSWRImmutable('factory', fetchFactory);

  const [factory, setFactory] = useState<FactoryType>({
    factory_address: '',
    factory_id: '',
  });

  useEffect(() => {
    if (!data || !SorobanContext) return;

    const filtered = data?.filter(
      (item: FactoryResponseType) =>
        item.network === sorobanContext?.activeChain?.name?.toLowerCase(),
    );

    if (filtered?.length > 0) {
      setFactory({
        factory_address: filtered[0].factory_address,
        factory_id: filtered[0].factory_id,
      });
    }
  }, [data, sorobanContext]);

  return factory;
};
