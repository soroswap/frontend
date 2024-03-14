import { useSorobanReact } from '@soroban-react/core';
import useSWRImmutable from 'swr/immutable';

const useHorizonLoadAccount = () => {
  const sorobanContext = useSorobanReact();

  const { data, isLoading, error } = useSWRImmutable(
    sorobanContext.address ? ['horizon-account', sorobanContext.address, sorobanContext] : null,
    ([_, address]) => sorobanContext.serverHorizon?.loadAccount(address),
  );

  return { account: data, isLoading, error };
};

export default useHorizonLoadAccount;
