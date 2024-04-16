import { useSorobanReact } from '@soroban-react/core';
import useSWRImmutable from 'swr/immutable';
import useGetNativeTokenBalance from './useGetNativeTokenBalance';

const useHorizonLoadAccount = () => {
  const sorobanContext = useSorobanReact();

  const nativeBalance = useGetNativeTokenBalance();

  const isFunded = nativeBalance.data?.validAccount;

  const { data, isLoading, error } = useSWRImmutable(
    sorobanContext.address && isFunded
      ? ['horizon-account', sorobanContext.address, sorobanContext]
      : null,
    ([_, address]) => sorobanContext.serverHorizon?.loadAccount(address),
  );

  return { account: data, isLoading, error };
};

export default useHorizonLoadAccount;
