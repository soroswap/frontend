import { useSorobanReact } from 'stellar-react';
import { useEffect, useState } from 'react';
import useGetNativeTokenBalance from './useGetNativeTokenBalance';

const useGetSubentryCount = () => {
  const { address, horizonServer:serverHorizon } = useSorobanReact();

  const [subentryCount, setSubentryCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const nativeBalance = useGetNativeTokenBalance();

  useEffect(() => {
    const getSubentryCount = async () => {
      if (address && nativeBalance.data?.validAccount) {
        setIsLoading(true);
        try {
          const account = await serverHorizon?.loadAccount(address);
          const count = account?.subentry_count ?? 0;
          setSubentryCount(count);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    getSubentryCount();
  }, [address, nativeBalance.data?.validAccount, serverHorizon]);

  return { subentryCount, nativeBalance: nativeBalance?.data?.data, isLoading };
};

export default useGetSubentryCount;
