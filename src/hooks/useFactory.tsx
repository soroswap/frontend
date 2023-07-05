import { SorobanContextType } from '@soroban-react/core';
import useSWR from 'swr';
import { FactoryResponseType, FactoryType } from '../interfaces/factory';
// TODO: verify type of fetcher args
const fetcher = (...args) => fetch(...args).then((resp) => resp.json());

export const useFactory = (sorobanContext: SorobanContextType) => {
  const { data } = useSWR(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/factory`,
    fetcher
  );

  let factory: FactoryType = {
    factory_address: "",
    factory_id: ""
  };

  const filtered = data?.filter(
    (item: FactoryResponseType) =>
      item.network === sorobanContext?.activeChain?.name?.toLowerCase()
  );

  if (filtered?.length > 0) {
    factory = {
      factory_address: filtered[0].factory_address,
      factory_id: filtered[0].factory_id
    }
  }

  return factory;
};
