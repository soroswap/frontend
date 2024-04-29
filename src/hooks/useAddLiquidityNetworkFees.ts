import { calculateLiquidityFees, calculateSwapFees } from 'functions/getNetworkFees';
import { InterfaceTrade } from 'state/routing/types';
import { SorobanContextType, useSorobanReact } from '@soroban-react/core';
import useSWRImmutable from 'swr/immutable';
import BigNumber from 'bignumber.js';
import { RouterMethod } from './useRouterCallback';
import * as StellarSdk from '@stellar/stellar-sdk';

const fetchNetworkFees = async (
  args: StellarSdk.xdr.ScVal[] | undefined,
  sorobanContext: SorobanContextType,
) => {
  if (!args || !sorobanContext) return 0;

  const fees = await calculateLiquidityFees(sorobanContext, args, RouterMethod.ADD_LIQUIDITY);

  return fees ? Number(fees) / 10 ** 7 : 0;
};

const useAddLiquidityNetworkFees = (args: StellarSdk.xdr.ScVal[] | undefined) => {
  const sorobanContext = useSorobanReact();

  const { data, error, isLoading, mutate } = useSWRImmutable(
    args && sorobanContext ? ['add-liquidity-network-fees', sorobanContext] : null,
    ([key, sorobanContext]) => fetchNetworkFees(args, sorobanContext),
  );

  return { networkFees: data || 0, isLoading, isError: error, mutate };
};

export default useAddLiquidityNetworkFees;
