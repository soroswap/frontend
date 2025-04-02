import { SorobanContextType, useSorobanReact } from 'stellar-react';
import { tokenBalance } from './useBalances';
import useSWRImmutable from 'swr/immutable';
import nativeTokens from '../../public/native_tokens.json';
import { passphraseToBackendNetworkName } from 'services/pairs';

interface FetchBalanceProps {
  sorobanContext: SorobanContextType;
  address?: string;
}

const fetchBalance = async ({ sorobanContext, address }: FetchBalanceProps) => {
  if (!sorobanContext || !address) throw new Error('Missing sorobanContext or address');
  const {activeNetwork} = sorobanContext;
  if (!activeNetwork) throw new Error('Missing active network');
  const currentNetwork = passphraseToBackendNetworkName[activeNetwork].toLowerCase();

  const networkNativeToken = nativeTokens.nativeTokens.find(
    (nativeToken) => nativeToken.network === currentNetwork,
  );

  if (!networkNativeToken) throw new Error(`Native token not found for network ${currentNetwork}`);

  try {
    await sorobanContext.sorobanServer?.getAccount(address);
  } catch (error) {
    return { data: 0, validAccount: false };
  }

  const balance = await tokenBalance(networkNativeToken.address, address, sorobanContext);

  if (balance === null) {
    throw new Error('Failed to fetch balance');
  }

  return { data: balance, validAccount: true };
};

const useGetNativeTokenBalance = () => {
  const sorobanContext = useSorobanReact();
  const { address } = sorobanContext;

  const { data, isLoading, mutate, error } = useSWRImmutable(
    ['native-balance', sorobanContext, address],
    ([key, sorobanContext, address]) => fetchBalance({ sorobanContext, address }),
  );

  return {
    data,
    isLoading,
    mutate,
    isError: error,
  };
};

export default useGetNativeTokenBalance;
