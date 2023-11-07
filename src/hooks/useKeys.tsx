import { SorobanContextType } from '@soroban-react/core';
import useSWRImmutable from 'swr/immutable';
import { AdminKeyResponseType, KeysType } from '../interfaces';
import { useEffect, useState } from 'react';
import { fetchKeys } from 'services/keys';

export const useKeys = (sorobanContext: SorobanContextType) => {
  const { data } = useSWRImmutable('keys', fetchKeys);

  const [keys, setKeys] = useState<KeysType>({
    admin_public: '',
    admin_secret: '',
  });

  useEffect(() => {
    if (!data || !sorobanContext) return;

    const filtered = data?.filter(
      (item: AdminKeyResponseType) =>
        item.network === sorobanContext?.activeChain?.name?.toLowerCase(),
    );

    if (filtered?.length > 0) {
      setKeys({
        admin_public: filtered[0].admin_public,
        admin_secret: filtered[0].admin_secret,
      });
    }
  }, [data, sorobanContext]);

  return keys;
};
