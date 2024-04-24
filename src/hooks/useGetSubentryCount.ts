import React, { useEffect, useState } from 'react';
import useGetNativeTokenBalance from './useGetNativeTokenBalance';
import { useSorobanReact } from '@soroban-react/core';
import useSWRImmutable from 'swr/dist/immutable';

const useGetSubentryCount = () => {
  const { address, serverHorizon } = useSorobanReact();

  const [subentryCount, setSubentryCount] = useState<number>(0);
  const nativeBalance = useGetNativeTokenBalance();

  useEffect(() => {
    const getSubentryCount = async () => {
      if (address && nativeBalance.data?.validAccount) {
        const account = await serverHorizon?.loadAccount(address);
        const count = account?.subentry_count ?? 0;
        setSubentryCount(count);
      }
    };

    getSubentryCount();
  }, [address, nativeBalance.data?.validAccount, serverHorizon]);

  return { subentryCount };
};

export default useGetSubentryCount;
