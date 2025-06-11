import { useSorobanReact, WalletNetwork } from 'stellar-react';
import { AppContext, ProtocolsStatus } from 'contexts';
import { useFactory } from 'hooks';
import { useAggregator } from 'hooks/useAggregator';
import { useContext, useMemo } from 'react';
import { TokenType } from 'interfaces';
import { getBestPath, getHorizonBestPath } from 'helpers/horizon/getHorizonPath';
import {
  BuildSplitTradeReturn,
  BuildTradeReturn,
  PlatformType,
  Protocol,
  SwapRouteRequest,
  SwapRouteSplitRequest,
  TradeType,
} from 'state/routing/types';
import { CurrencyAmount as AmountAsset } from 'interfaces';
import { reservesBNWithTokens } from 'hooks/useReserves';
import { getPairAddress } from './getPairAddress';
import BigNumber from 'bignumber.js';
import { getExpectedAmount } from './getExpectedAmount';
import { Networks } from '@stellar/stellar-sdk';
import { getSwapRoute, getSwapSplitRoute } from 'services/soroswapApi';
import { passphraseToBackendNetworkName } from 'services/pairs';
import { DEFAULT_SLIPPAGE_INPUT_VALUE } from 'components/Settings/MaxSlippageSettings';
import { useUserSlippageToleranceWithDefault } from 'state/user/hooks';

export interface GenerateRouteProps {
  amountAsset: AmountAsset;
  quoteAsset: TokenType;
  amount: string;
  tradeType: TradeType;
  currentProtocolsStatus: ProtocolsStatus[];
}

const shouldUseDirectPath = process.env.NEXT_PUBLIC_DIRECT_PATH_ENABLED === 'true';

export const useSoroswapApi = () => {
  const sorobanContext = useSorobanReact();
  const { Settings } = useContext(AppContext);
  const allowedSlippage = useUserSlippageToleranceWithDefault(DEFAULT_SLIPPAGE_INPUT_VALUE);


  const { factory } = useFactory(sorobanContext);

  const { maxHops, protocolsStatus, setProtocolsStatus, isAggregatorState: isAggregator } = Settings;

  const getNetwork = useMemo(() => {
    switch (sorobanContext.activeNetwork) {
      case WalletNetwork.PUBLIC:
        return Networks.PUBLIC;
      case WalletNetwork.TESTNET:
        return Networks.TESTNET;
      case WalletNetwork.STANDALONE:
        return Networks.STANDALONE;
      case WalletNetwork.FUTURENET:
        return Networks.FUTURENET;
      case WalletNetwork.SANDBOX:
        return Networks.SANDBOX;
      default:
        return Networks.TESTNET;
    }
  }, [sorobanContext]);
  const network = passphraseToBackendNetworkName[getNetwork];

  const getProtocols = useMemo(() => {
    const newProtocols = [];
    for (let protocol of protocolsStatus) {
      if (protocol.key != PlatformType.STELLAR_CLASSIC && protocol.value === true) {
        newProtocols.push(protocol.key);
      }
    }
    return newProtocols as Protocol[];
  }, [protocolsStatus]);

  const resetRouterSdkCache = () => {
    console.log('Resetting router cache');
  };

  const generateRoute = async ({
    amountAsset,
    quoteAsset,
    amount,
    tradeType,
    currentProtocolsStatus,
  }: GenerateRouteProps): Promise<BuildTradeReturn | BuildSplitTradeReturn | undefined> => {
    if (shouldUseDirectPath) {
      try {
        // get pair address from factory
        const pairAddress = await getPairAddress(
          amountAsset.currency.contract,
          quoteAsset.contract,
          sorobanContext,
        );

        // Get reserves from pair
        const reserves = await reservesBNWithTokens(pairAddress, sorobanContext);
        if (!reserves?.reserve0 || !reserves?.reserve1) {
          throw new Error('Reserves not found');
        }

        // Get amountOut or amountIn from reserves and tradeType
        let quoteAmount = await getExpectedAmount(
          amountAsset.currency,
          quoteAsset,
          new BigNumber(amount),
          sorobanContext,
          tradeType,
        );

        // Convert from lumens to stroops (multiply by 10^7)
        quoteAmount = quoteAmount.integerValue();

        const toReturn: BuildTradeReturn =
          tradeType === TradeType.EXACT_INPUT
            ? {
                assetIn: amountAsset.currency.contract,
                assetOut: quoteAsset.contract,
                priceImpact: {
                  numerator: 0,
                  denominator: 1,
                },
                platform: PlatformType.ROUTER,
                tradeType: TradeType.EXACT_INPUT,
                trade: {
                  amountIn: BigInt(amountAsset.value),
                  amountOutMin: BigInt(quoteAmount.toString()), // fixme: this should count the slippage
                  expectedAmountOut: BigInt(quoteAmount.toString()), 
                  path: [amountAsset.currency.contract, quoteAsset.contract],
                },
              }
            : {
                assetIn: amountAsset.currency.contract,
                assetOut: quoteAsset.contract,
                priceImpact: {
                  numerator: 0,
                  denominator: 1,
                },
                platform: PlatformType.ROUTER,
                tradeType: TradeType.EXACT_OUTPUT,
                trade: {
                  amountOut: BigInt(amount),
                  expectedAmountIn: BigInt(quoteAmount.toString()), 
                  amountInMax: BigInt(quoteAmount.toString()), // fixme: this should count the slippage
                  path: [quoteAsset.contract, amountAsset.currency.contract],
                },
              };

        return toReturn;
      } catch (error) {
        console.error('Error generating direct path:', error);
        throw error;
      }
    }
    if (!factory) throw new Error('Factory address not found');

    const isHorizonEnabled = currentProtocolsStatus.find(
      (p) => p.key === PlatformType.STELLAR_CLASSIC,
    )?.value;

    const isSoroswapEnabled = currentProtocolsStatus.find((p) => p.key === Protocol.SOROSWAP)
      ?.value;

    const horizonProps = {
      assetFrom: amountAsset.currency,
      assetTo: quoteAsset,
      amount,
      tradeType,
    };

    let horizonPath: BuildTradeReturn | undefined;
    if (isHorizonEnabled) {
      horizonPath = (await getHorizonBestPath(horizonProps, sorobanContext)) as BuildTradeReturn;
    }

    let sorobanPath: BuildTradeReturn | BuildSplitTradeReturn | undefined;
    if (isAggregator) {
      const swapSplitRequest: SwapRouteSplitRequest = {
        assetIn: tradeType === TradeType.EXACT_INPUT ? amountAsset.currency.contract : quoteAsset.contract,
        assetOut: tradeType === TradeType.EXACT_INPUT ? quoteAsset.contract : amountAsset.currency.contract,
        amount: amount,
        tradeType: tradeType,
        protocols: getProtocols,
        parts: 10,
        slippageTolerance: Math.floor(Number(allowedSlippage) * 100).toString(),
        assetList: ['SOROSWAP'],
        maxHops: maxHops,
      };

      try {
        const response = await getSwapSplitRoute(network, swapSplitRequest);
        sorobanPath = response;
      } catch (error) {
        //TODO: Here it could be a on chain solution
        console.error('Error getting soroban path:', error);
        return undefined;
      }
    } else if (isSoroswapEnabled) {
      const swapRequest: SwapRouteRequest = {
        assetIn: tradeType === TradeType.EXACT_INPUT ? amountAsset.currency.contract : quoteAsset.contract,
        assetOut: tradeType === TradeType.EXACT_INPUT ? quoteAsset.contract : amountAsset.currency.contract,
        amount: amount,
        tradeType: tradeType,
        slippageTolerance: Math.floor(Number(allowedSlippage) * 100).toString(),
        assetList: ['SOROSWAP'],
        maxHops: maxHops,
      };

      try {
        const response = await getSwapRoute(network, swapRequest);
        sorobanPath = response;
      } catch (error) {
        //TODO: Here it could be a on chain solution
        console.error('Error getting soroban path:', error);
        return undefined;
      }
    }
    const bestPath = getBestPath(horizonPath, sorobanPath, tradeType);
    return bestPath;
  };

  return { generateRoute, resetRouterSdkCache, maxHops };
};
