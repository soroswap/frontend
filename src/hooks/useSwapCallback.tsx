import { useSorobanReact } from '@soroban-react/core';
import BigNumber from 'bignumber.js';
import { AppContext, SnackbarIconType } from 'contexts';
import { getCurrentTimePlusOneHour } from 'functions/getCurrentTimePlusOneHour';
import { sendNotification } from 'functions/sendNotification';
import { formatTokenAmount } from 'helpers/format';
import { bigNumberToI128, bigNumberToU64 } from 'helpers/utils';
import { useCallback, useContext } from 'react';
import * as SorobanClient from 'soroban-client';
import { InterfaceTrade, TradeType } from 'state/routing/types';
import { RouterMethod, useRouterCallback } from './useRouterCallback';

// Returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useSwapCallback(
  trade: InterfaceTrade | undefined, // trade to execute, required
  // fiatValues: { amountIn?: number; amountOut?: number }, // usd values for amount in and out, logged for analytics
  // allowedSlippage: Percent, // in bips
  // permitSignature: PermitSignature | undefined
) {
  const { SnackbarContext } = useContext(AppContext);
  const sorobanContext = useSorobanReact();
  const { activeChain, address } = sorobanContext;
  const routerCallback = useRouterCallback();

  const doSwap = () => {
    console.log('Trying out the TRADE');
    if (!trade) throw new Error('missing trade');
    if (!address || !activeChain) throw new Error('wallet must be connected to swap');

    //Checks which method in the router to use
    const routerMethod =
      trade.tradeType == TradeType.EXACT_INPUT
        ? RouterMethod.SWAP_EXACT_IN
        : RouterMethod.SWAP_EXACT_OUT;

    // TODO, this is just temporal, when implementing the Router we'll calculate this better
    //(12-10-2023) Amounts that are too large will fail with a panic exit, this will depend on the amounts in the liquidity pool
    //Thats why we are incrementing the inputAmount by 50% so it doesnt fail, this should be fixed when we implement the router
    // const amountInBigNumber = BigNumber(trade.inputAmount?.value || 0).multipliedBy(1.5)
    // const amountInScVal = bigNumberToI128(amountInBigNumber);
    // const amountOutBigNumber = BigNumber(trade.outputAmount?.value || 0)

    // const amountOutScVal = bigNumberToI128(amountOutBigNumber);

    const amount0 =
      routerMethod === RouterMethod.SWAP_EXACT_IN
        ? BigNumber(trade.inputAmount?.value as string).multipliedBy(1.5)
        : BigNumber(trade.outputAmount?.value as string).multipliedBy(1.5);
    const amount1 =
      routerMethod === RouterMethod.SWAP_EXACT_IN
        ? BigNumber(trade.outputAmount?.value as string)
        : BigNumber(trade.inputAmount?.value as string);
    const amount0ScVal = bigNumberToI128(amount0);
    const amount1ScVal = bigNumberToI128(amount1);
    //   fn swap_exact_tokens_for_tokens(
    //     e: Env,
    //     amount_in: i128,
    //     amount_out_min: i128,
    //     path: Vec<Address>,
    //     to: Address,
    //     deadline: u64,
    // ) -> Vec<i128>;

    //   fn swap_tokens_for_exact_tokens(
    //     e: Env,
    //     amount_out: i128,
    //     amount_in_max: i128,
    //     path: Vec<Address>,
    //     to: Address,
    //     deadline: u64,
    // ) -> Vec<i128>;
    const pathAddresses = [
      new SorobanClient.Address(trade.inputAmount?.currency.address as string),
      new SorobanClient.Address(trade.outputAmount?.currency.address as string),
    ];

    const args = [
      amount0ScVal,
      amount1ScVal,
      SorobanClient.nativeToScVal(pathAddresses),
      new SorobanClient.Address(address!).toScVal(),
      bigNumberToU64(BigNumber(getCurrentTimePlusOneHour())),
    ];

    return routerCallback(routerMethod, args, true)
      .then((result) => {
        console.log('🚀 « result:', result);

        //TODO: Investigate result xdr to get swapped amount and hash, there is a warmHash, is it this one?
        const notificationMessage = `${formatTokenAmount(trade?.inputAmount?.value ?? '0')} ${trade
          ?.inputAmount?.currency.symbol} for ${formatTokenAmount(
          trade?.outputAmount?.value ?? '0',
        )} ${trade?.outputAmount?.currency.symbol}`;
        sendNotification(notificationMessage, 'Swapped', SnackbarIconType.SWAP, SnackbarContext);

        return result;
      })
      .catch((error) => {
        console.log('🚀 « error:', error);
        throw error;
      });
  };

  return doSwap;
}
