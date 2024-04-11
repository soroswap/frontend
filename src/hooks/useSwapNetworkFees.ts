import { calculateSwapFees } from 'functions/getNetworkFees';
import { InterfaceTrade } from 'state/routing/types';
import { SorobanContextType, useSorobanReact } from '@soroban-react/core';
import useSWRImmutable from 'swr/immutable';

const fetchNetworkFees = async (
  trade: InterfaceTrade | undefined,
  sorobanContext: SorobanContextType,
) => {
  if (!trade || !sorobanContext) return 0;

  const fees = await calculateSwapFees(sorobanContext, trade);
  return fees ? Number(fees) / 10 ** 7 : 0;
};

const useSwapNetworkFees = (trade: InterfaceTrade | undefined) => {
  const sorobanContext = useSorobanReact();
  const { data, error, isLoading, mutate } = useSWRImmutable(
    ['swap-network-fees', trade, sorobanContext],
    ([key, trade, sorobanContext]) => fetchNetworkFees(trade, sorobanContext),
  );

  return { networkFees: data || 0, isLoading, isError: error, mutate };
};

export default useSwapNetworkFees;
