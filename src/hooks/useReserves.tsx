import { contractInvoke, useContractValue } from '@soroban-react/contracts';
import { SorobanContextType } from '@soroban-react/core';
import BigNumber from 'bignumber.js';
import { scValToJs } from 'helpers/convert';
import * as StellarSdk from '@stellar/stellar-sdk';
import { xdr } from '@stellar/stellar-sdk';
import { bigNumberToI128, scvalToBigNumber } from '../helpers/utils';

export function useReservesScVal(pairAddress: string, sorobanContext: SorobanContextType) {
  let reserves;
  const reserves_scval = useContractValue({
    contractAddress: pairAddress,
    method: 'get_reserves',
    args: [],
    sorobanContext: sorobanContext,
  });
  let values: any = reserves_scval.result?.value();
  let scValZero = bigNumberToI128(BigNumber(0));
  let reserve0ScVal: StellarSdk.xdr.ScVal = values ? values[0] ?? scValZero : scValZero;
  let reserve1ScVal: StellarSdk.xdr.ScVal = values ? values[1] ?? scValZero : scValZero;
  return {
    reserve0ScVal,
    reserve1ScVal,
  };
}

export function useReservesBigNumber(pairAddress: string, sorobanContext: SorobanContextType) {
  let reservesScVal = useReservesScVal(pairAddress, sorobanContext);

  return {
    reserve0: scvalToBigNumber(reservesScVal.reserve0ScVal),
    reserve1: scvalToBigNumber(reservesScVal.reserve1ScVal),
  };
  // }
}

export async function reservesBigNumber(pairAddress: string, sorobanContext: SorobanContextType) {
  if (!sorobanContext.activeChain || !pairAddress) return;

  const reserves_scval = await contractInvoke({
    contractAddress: pairAddress,
    method: 'get_reserves',
    args: [],
    sorobanContext,
  });

  const reserves: string = scValToJs(reserves_scval as xdr.ScVal);

  return {
    reserve0: BigNumber(reserves[0]),
    reserve1: BigNumber(reserves[1]),
  };
}

export async function reservesBNWithTokens(
  pairAddress: string,
  sorobanContext: SorobanContextType,
) {
  const result = await reservesBigNumber(pairAddress, sorobanContext);
  const reserve0 = result?.reserve0;
  const reserve1 = result?.reserve1;

  const token0_scval = await contractInvoke({
    contractAddress: pairAddress,
    method: 'token_0',
    args: [],
    sorobanContext,
  });
  const token0: string = scValToJs(token0_scval as xdr.ScVal);

  const token1_scval = await contractInvoke({
    contractAddress: pairAddress,
    method: 'token_1',
    args: [],
    sorobanContext,
  });
  const token1: string = scValToJs(token1_scval as xdr.ScVal);

  return {
    token0: token0,
    reserve0: reserve0,
    token1: token1,
    reserve1: reserve1,
  };
}
