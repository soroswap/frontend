import { SorobanContextType } from '@soroban-react/core';
import useSWR from 'swr';
import { FactoryResponseType } from '../interfaces/factory';
// TODO: verify type of fetcher args
const fetcher = (...args) => fetch(...args).then((resp) => resp.json());

export const useFactory = (sorobanContext: SorobanContextType) => {
  const { data } = useSWR(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/factory`,
    fetcher
  );

  //TODO: Uncomment line 16 to 23 when factory is an array with futurenet data
  let factory: string = data?.factory;

  // const filtered = data?.filter(
  //   (item: FactoryResponseType) =>
  //     item.network === sorobanContext?.activeChain?.name?.toLowerCase()
  // );

  // if (filtered?.length > 0) {
  //   factory = filtered[0].factory;
  // }

  return factory;
};
