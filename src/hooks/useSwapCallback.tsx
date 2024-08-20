import { TxResponse } from '@soroban-react/contracts';
import { useSorobanReact } from '@soroban-react/core';
import * as StellarSdk from '@stellar/stellar-sdk';
import BigNumber from 'bignumber.js';
import { DEFAULT_SLIPPAGE_INPUT_VALUE } from 'components/Settings/MaxSlippageSettings';
import { AppContext, SnackbarIconType } from 'contexts';
import { getCurrentTimePlusOneHour } from 'functions/getCurrentTimePlusOneHour';
import { sendNotification } from 'functions/sendNotification';
import { dexDistributionParser, hasDistribution } from 'helpers/aggregator';
import { scValToJs } from 'helpers/convert';
import { formatTokenAmount } from 'helpers/format';
import { bigNumberToI128, bigNumberToU64 } from 'helpers/utils';
import { useContext } from 'react';
import { InterfaceTrade, PlatformType, TradeType } from 'state/routing/types';
import { useUserSlippageToleranceWithDefault } from 'state/user/hooks';
import { useSWRConfig } from 'swr';
import { AggregatorMethod, useAggregatorCallback } from './useAggregatorCallback';
import { RouterMethod, useRouterCallback } from './useRouterCallback';
import { createStellarPathPayment } from 'helpers/horizon/createHorizonTransaction';
import { extractContractError } from 'functions/extractContractError';

// Returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade

interface GetSwapAmountsProps {
  tradeType: TradeType;
  inputAmount: string;
  outputAmount: string;
  allowedSlippage: number;
}

/**
     * If SWAP_EXACT_IN
     * amount0 becomes the amount_in (hence trade.inputAmount
     * amount1 becomes the amount_out_min (hence trade.outputAmount)
     * Slippage is applied into amount1, we accept to receive 0.5% LESS of the optimal amount_out_min
    
    fn swap_exact_tokens_for_tokens(
        e: Env,
        amount_in: i128,
        amount_out_min: i128,
        path: Vec<Address>,
        to: Address,
        deadline: u64,
    ) -> Vec<i128>;

     */

/**
     * If NOT SWAP_EXACT_IN (nad hence SWAP_EXACT_OUT)
     * amount0 becomes the amount_out (trade.outputAmount)
     * amount1 becomes the amount_in_max (trade.inputAmount)
     * * Slippage is applied into amount1, we accept to send 0.5% MORE of the optimal amount_out_min
     *    fn swap_tokens_for_exact_tokens(
        e: Env,
        amount_out: i128,
        amount_in_max: i128,
        path: Vec<Address>,
        to: Address,
        deadline: u64,
    ) -> Vec<i128>;
     */

export const getSwapAmounts = ({
  tradeType,
  inputAmount,
  outputAmount,
  allowedSlippage = 0.5,
}: GetSwapAmountsProps) => {
  const routerMethod =
    tradeType == TradeType.EXACT_INPUT ? RouterMethod.SWAP_EXACT_IN : RouterMethod.SWAP_EXACT_OUT;

  const aggregatorMethod =
    tradeType == TradeType.EXACT_INPUT
      ? AggregatorMethod.SWAP_EXACT_IN
      : AggregatorMethod.SWAP_EXACT_OUT;

  const factorLess = BigNumber(100).minus(allowedSlippage).dividedBy(100);
  const factorMore = BigNumber(100).plus(allowedSlippage).dividedBy(100);

  //amount_in , amount_out
  const amount0 =
    routerMethod === RouterMethod.SWAP_EXACT_IN ? BigNumber(inputAmount) : BigNumber(outputAmount);

  //amount_out_min , amount_in_max
  const amount1 =
    routerMethod === RouterMethod.SWAP_EXACT_IN
      ? BigNumber(outputAmount).multipliedBy(factorLess).decimalPlaces(0)
      : BigNumber(inputAmount).multipliedBy(factorMore).decimalPlaces(0);

  return { amount0, amount1, routerMethod, aggregatorMethod };
};

export type SuccessfullSwapResponse = StellarSdk.SorobanRpc.Api.GetSuccessfulTransactionResponse &
  TxResponse & {
    switchValues: string[];
  };

export function useSwapCallback(
  trade: InterfaceTrade | undefined, // trade to execute, required
  // fiatValues: { amountIn?: number; amountOut?: number }, // usd values for amount in and out, logged for analytics
  // allowedSlippage: Percent, // in bips
  // permitSignature: PermitSignature | undefined
) {
  const { SnackbarContext } = useContext(AppContext);
  const sorobanContext = useSorobanReact();
  const { activeChain, address, activeConnector } = sorobanContext;
  const routerCallback = useRouterCallback();
  const aggregatorCallback = useAggregatorCallback();
  const allowedSlippage = useUserSlippageToleranceWithDefault(DEFAULT_SLIPPAGE_INPUT_VALUE);
  const isUsingAggregator = hasDistribution(trade);

  const { mutate } = useSWRConfig();

  const doSwap = async (
    simulation?: boolean,
  ): Promise<
    | SuccessfullSwapResponse
    | StellarSdk.SorobanRpc.Api.GetTransactionResponse
    | StellarSdk.Horizon.HorizonApi.SubmitTransactionResponse
  > => {
    if (!trade) throw new Error('missing trade');
    if (!address || !activeChain) throw new Error('wallet must be connected to swap');
    if (!trade.tradeType) throw new Error('tradeType must be defined');

    const { amount0, amount1, routerMethod, aggregatorMethod } = getSwapAmounts({
      tradeType: trade.tradeType,
      inputAmount: trade.inputAmount?.value as string,
      outputAmount: trade.outputAmount?.value as string,
      allowedSlippage: allowedSlippage,
    });
    const amount0ScVal = bigNumberToI128(amount0);
    const amount1ScVal = bigNumberToI128(amount1);

    switch (trade.platform) {
      case PlatformType.ROUTER:
        console.log('USING ROUTER');
        const path = trade.path?.map((address) => new StellarSdk.Address(address));

        const pathScVal = StellarSdk.nativeToScVal(path);

        const args = [
          amount0ScVal,
          amount1ScVal,
          pathScVal, // path
          new StellarSdk.Address(address!).toScVal(),
          bigNumberToU64(BigNumber(getCurrentTimePlusOneHour())),
        ];

        try {
          const result = (await routerCallback(
            routerMethod,
            args,
            !simulation,
          )) as StellarSdk.SorobanRpc.Api.GetTransactionResponse;

          //if it is a simulation should return the result
          if (simulation) return result;

          if (result.status !== StellarSdk.SorobanRpc.Api.GetTransactionStatus.SUCCESS)
            throw result;

          const switchValues: string[] = scValToJs(result.returnValue!);

          const currencyA = switchValues?.[0];
          const currencyB = switchValues?.[switchValues?.length - 1];

          const notificationMessage = `${formatTokenAmount(currencyA ?? '0')} ${trade?.inputAmount
            ?.currency.code} for ${formatTokenAmount(currencyB ?? '0')} ${trade?.outputAmount
              ?.currency.code}`;

          sendNotification(notificationMessage, 'Swapped', SnackbarIconType.SWAP, SnackbarContext);

          return { ...result, switchValues };
        } catch (error) {
          throw error;
        }
      case PlatformType.AGGREGATOR:
        console.log('USING AGGREGATOR');
        if (!isUsingAggregator) throw Error('Non distribution');
        const dexDistributionScValVec = dexDistributionParser(trade?.distribution);
        console.log('🚀 « dexDistributionScValVec:', dexDistributionScValVec);

        const aggregatorSwapParams: StellarSdk.xdr.ScVal[] = [
          new StellarSdk.Address(trade.inputAmount?.currency.contract ?? '').toScVal(), //_from_token: Address,
          new StellarSdk.Address(trade.outputAmount?.currency.contract ?? '').toScVal(), //_dest_token: Address,
          amount0ScVal,
          amount1ScVal,
          dexDistributionScValVec, // proxy_addresses: Vec<ProxyAddressPair>,
          new StellarSdk.Address(address).toScVal(), //admin: Address,
          StellarSdk.nativeToScVal(getCurrentTimePlusOneHour()), //deadline
        ];
        console.log('🚀 « aggregatorSwapParams:', aggregatorSwapParams);

        try {
          const result = (await aggregatorCallback(
            aggregatorMethod,
            aggregatorSwapParams,
            !simulation,
          )) as StellarSdk.SorobanRpc.Api.GetTransactionResponse;

          console.log('🚀 « result:', result);
          //if it is a simulation should return the result
          if (simulation) return result;

          if (result.status !== StellarSdk.SorobanRpc.Api.GetTransactionStatus.SUCCESS)
            throw result;

          const switchValues: string[] = scValToJs(result.returnValue!);

          let currencyA = 0;
          let currencyB = 0;

          for (let i = 0; i < switchValues.length; i++) {
            const values = switchValues[i];

            currencyA += Number(values[0]);
            currencyB += Number(values[values.length - 1]);
          }

          const notificationMessage = `${formatTokenAmount(currencyA ?? '0')} ${trade?.inputAmount
            ?.currency.code} for ${formatTokenAmount(currencyB ?? '0')} ${trade?.outputAmount?.currency
            .code}`;

          sendNotification(notificationMessage, 'Swapped', SnackbarIconType.SWAP, SnackbarContext);

          return { ...result, switchValues };
        } catch (error) {
          if (error instanceof Error) {
            const parsedError = extractContractError(error.message);
            throw parsedError;
          } else {
            throw error;
          }
        }
      case PlatformType.STELLAR_CLASSIC:
        try {
          const result = await createStellarPathPayment(trade, allowedSlippage, sorobanContext);
          const notificationMessage = `${formatTokenAmount(trade.inputAmount?.value ?? '0')} ${trade
            ?.inputAmount?.currency.code} for ${formatTokenAmount(
              trade.outputAmount?.value ?? '0',
            )} ${trade?.outputAmount?.currency.code}`;
          sendNotification(notificationMessage, 'Swapped', SnackbarIconType.SWAP, SnackbarContext);
          return result!;
        } catch (error: any) {
          console.error(error);
          throw new Error('Cannot create path payment');
        }
      default:
        throw new Error('Unsupported platform');
    }
  };

  return { doSwap, isLoading: trade?.isLoading };
}
