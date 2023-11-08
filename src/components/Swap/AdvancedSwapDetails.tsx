import { getPriceImpactNew2 } from 'functions/getPriceImpact';
import { BodySmall } from 'components/Text';
import { formatTokenAmount, twoDecimalsPercentage } from 'helpers/format';
import { InterfaceTrade } from 'state/routing/types';
import { LoadingRows } from 'components/Loader/styled';
import { MouseoverTooltip } from 'components/Tooltip';
import { RowBetween, RowFixed } from 'components/Row';
import { Separator } from 'components/SearchModal/styleds';
import { useEffect, useState } from 'react';
import { useSorobanReact } from '@soroban-react/core';
import BigNumber from 'bignumber.js';
import Column from 'components/Column';
import CurrencyLogo from 'components/Logo/CurrencyLogo';
import useGetReservesByPair from 'hooks/useGetReservesByPair';

interface AdvancedSwapDetailsProps {
  trade: InterfaceTrade | undefined;
  allowedSlippage: number;
  syncing?: boolean;
}

function TextWithLoadingPlaceholder({
  syncing,
  width,
  children,
}: {
  syncing: boolean;
  width: number;
  children: JSX.Element;
}) {
  return syncing ? (
    <LoadingRows data-testid="loading-rows">
      <div style={{ height: '15px', width: `${width}px` }} />
    </LoadingRows>
  ) : (
    children
  );
}

export function AdvancedSwapDetails({
  trade,
  allowedSlippage,
  syncing = false,
}: AdvancedSwapDetailsProps) {
  // const { chainId } = useWeb3React()
  // const nativeCurrency = useNativeCurrency(chainId)
  // const txCount = getTransactionCount(trade)
  const sorobanContext = useSorobanReact();

  const supportsGasEstimate = true; //chainId && SUPPORTED_GAS_ESTIMATE_CHAIN_IDS.includes(chainId)

  // {twoDecimalsPercentage().toString())
  // }%

  // const priceImpact = async () => {
  //   const pairAddress = await getPairAddress(trade?.inputAmount.currency.address, trade?.outputAmount.currency.address, sorobanContext)
  //   const reserves = await reservesBNWithTokens(pairAddress, sorobanContext)
  //   const { token0, token1 } = reserves
  //

  //   if (trade?.inputAmount.currency && trade.outputAmount.currency) {
  //     const priceImpactTemp = getPriceImpact(
  //       pairAddress,
  //       BigNumber(trade?.inputAmount.value).shiftedBy(7),
  //       token0 === trade.inputAmount.currency.address ? reserves.reserve0 : reserves.reserve1,
  //       token1 === trade.outputAmount.currency.address ? reserves.reserve1 : reserves.reserve0,
  //       sorobanContext
  //     )
  //

  //     return twoDecimalsPercentage(priceImpactTemp).toString()

  //   } else {
  //     return "0"
  //   }

  // }
  // priceImpact().then((Resp) => {
  //
  // })

  const { reserves } = useGetReservesByPair({
    baseAddress: trade?.inputAmount?.currency?.address,
    otherAddress: trade?.outputAmount?.currency.address,
  });

  const [priceImpact, setPriceImpact] = useState<number>(0);

  useEffect(() => {
    if (reserves) {
      getPriceImpactNew2(
        trade?.inputAmount?.currency,
        trade?.outputAmount?.currency,
        BigNumber(trade?.inputAmount?.value ?? '0'),
        reserves,
        trade?.tradeType,
      ).then((resp) => {
        setPriceImpact(twoDecimalsPercentage(resp.toString()));
      });
    }
  }, [
    sorobanContext,
    trade?.inputAmount?.currency,
    trade?.outputAmount?.currency,
    trade?.inputAmount?.value,
    trade?.tradeType,
    reserves,
  ]);

  const getOutputAmount = () => {
    const outputAmount = Number(trade?.outputAmount?.value ?? '0');

    const slippagePercentage = allowedSlippage / 100;

    const slippage = slippagePercentage * outputAmount;

    return formatTokenAmount(outputAmount - slippage);
  };

  // twoDecimalsPercentage()}%

  return (
    <Column gap="md">
      <Separator />
      {supportsGasEstimate && (
        <RowBetween>
          <MouseoverTooltip
            title={'The fee paid to miners who process your transaction. This must be paid in XLM.'}
          >
            <BodySmall color="textSecondary">Network fee</BodySmall>
          </MouseoverTooltip>
          <TextWithLoadingPlaceholder syncing={syncing} width={50}>
            <BodySmall>
              ~$?
              {/* {`${trade.totalGasUseEstimateUSD ? '~' : ''}${formatNumber(
                  trade.totalGasUseEstimateUSD,
                  NumberType.FiatGasPrice
                )}`} */}
            </BodySmall>
          </TextWithLoadingPlaceholder>
        </RowBetween>
      )}
      {true && (
        <RowBetween>
          <MouseoverTooltip title={'The impact your trade has on the market price of this pool.'}>
            <BodySmall color="textSecondary">Price Impact</BodySmall>
          </MouseoverTooltip>
          <TextWithLoadingPlaceholder syncing={syncing} width={50}>
            <BodySmall>{priceImpact}%</BodySmall>
          </TextWithLoadingPlaceholder>
        </RowBetween>
      )}
      <RowBetween>
        <RowFixed>
          <MouseoverTooltip
            title={`
                The amount you expect to receive at the current market price. You may receive less or more if the market
                price changes while your transaction is pending.
              `}
          >
            <BodySmall color="textSecondary">
              {/* TODO: Get slippage and do (outputAmount * (1-slippage%)) */}
              Expected output
            </BodySmall>
          </MouseoverTooltip>
        </RowFixed>
        <TextWithLoadingPlaceholder syncing={syncing} width={65}>
          <BodySmall style={{ display: 'flex', alignItems: 'center' }} component="div">
            {getOutputAmount()} {trade?.outputAmount?.currency.symbol}{' '}
            <CurrencyLogo
              currency={trade?.outputAmount?.currency}
              size="16px"
              style={{ marginLeft: '6px' }}
            />
          </BodySmall>
        </TextWithLoadingPlaceholder>
      </RowBetween>
    </Column>
  );
}
