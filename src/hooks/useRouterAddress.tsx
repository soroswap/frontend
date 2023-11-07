import { SorobanContextType, useSorobanReact } from '@soroban-react/core';
import { RouterResponseType, RouterType } from 'interfaces/router';
import { useEffect, useState } from 'react';
import { fetchRouter } from 'services/router';
import useSWRImmutable from 'swr/immutable';

export const useRouterAddress = () => {
  const sorobanContext: SorobanContextType = useSorobanReact();

  const { data } = useSWRImmutable('router', fetchRouter);

  const [router, setRouter] = useState<RouterType>({
    router_address: '',
    router_id: '',
  });

  useEffect(() => {
    if (!data) return;

    const filtered = data?.filter(
      (item: RouterResponseType) =>
        item.network === sorobanContext?.activeChain?.name?.toLowerCase(),
    );

    if (filtered?.length > 0) {
      setRouter({
        router_address: filtered[0].router_address,
        router_id: filtered[0].router_id,
      });
    }
  }, [data, sorobanContext]);

  return router;
};
