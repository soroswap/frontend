import { ChevronRight } from '@mui/icons-material';
import { Box, styled } from '@mui/material';
import { useSorobanReact } from '@soroban-react/core';
import BigNumber from 'bignumber.js';
import Column from 'components/Column';
import { LoadingRows } from 'components/Loader/styled';
import CurrencyLogo from 'components/Logo/CurrencyLogo';
import { RowBetween, RowFixed } from 'components/Row';
import { Separator } from 'components/SearchModal/styleds';
import { BodySmall } from 'components/Text';
import { MouseoverTooltip } from 'components/Tooltip';
import { getPriceImpactNew2 } from 'functions/getPriceImpact';
import { formatTokenAmount, twoDecimalsPercentage } from 'helpers/format';
import { useAllTokens } from 'hooks/tokens/useAllTokens';
import { findToken } from 'hooks/tokens/useToken';
import useGetReservesByPair from 'hooks/useGetReservesByPair';
import { useEffect, useState } from 'react';
import { InterfaceTrade } from 'state/routing/types';

export const PathBox = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
`

interface AdvancedSwapDetailsProps {
  trade: InterfaceTrade | undefined;
  allowedSlippage: number;
  syncing?: boolean;
  networkFees: number | null;
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
  networkFees,
}: AdvancedSwapDetailsProps) {
  // const { chainId } = useWeb3React()
  // const nativeCurrency = useNativeCurrency(chainId)
  // const txCount = getTransactionCount(trade)
  const sorobanContext = useSorobanReact();
  const {tokensAsMap, isLoading} = useAllTokens()

  // const supportsGasEstimate = true; //chainId && SUPPORTED_GAS_ESTIMATE_CHAIN_IDS.includes(chainId)

  // {twoDecimalsPercentage().toString())
  // }%

  // const priceImpact = async () => {
  //   const pairAddress = await getPairAddress(trade?.inputAmount.currency.contract, trade?.outputAmount.currency.contract, sorobanContext)
  //   const reserves = await reservesBNWithTokens(pairAddress, sorobanContext)
  //   const { token0, token1 } = reserves
  //

  //   if (trade?.inputAmount.currency && trade.outputAmount.currency) {
  //     const priceImpactTemp = getPriceImpact(
  //       pairAddress,
  //       BigNumber(trade?.inputAmount.value).shiftedBy(7),
  //       token0 === trade.inputAmount.currency.contract ? reserves.reserve0 : reserves.reserve1,
  //       token1 === trade.outputAmount.currency.contract ? reserves.reserve1 : reserves.reserve0,
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
    baseAddress: trade?.inputAmount?.currency?.contract,
    otherAddress: trade?.outputAmount?.currency.contract,
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
        setPriceImpact(twoDecimalsPercentage(BigNumber(resp).absoluteValue().toString()));
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

  const [pathArray, setPathArray] = useState<string[]>([])
  
  useEffect(() => {  
    (async () => {
      if (!trade?.path || isLoading) return
  
      const promises = trade.path.map(async (contract) => {
        const asset = await findToken(contract, tokensAsMap, sorobanContext);
        const code = asset?.code == 'native' ? "XLM" : asset?.code
        return code;
      });
  
      const results = await Promise.allSettled(promises);
  
      const fulfilledValues = results
        .filter((result) => result.status === 'fulfilled' && result.value)
        .map((result) => result.status === 'fulfilled' && result.value ? result.value : "");
  
      setPathArray(fulfilledValues)
    })();
  }, [trade?.path, isLoading, sorobanContext])

  return (
    <Column gap="md">
      <Separator />
      {(networkFees != 0) && (
        <RowBetween>
          <MouseoverTooltip
            title={'The fee paid to miners who process your transaction. This must be paid in XLM.'}
          >
            <BodySmall color="textSecondary">Network fee</BodySmall>
          </MouseoverTooltip>
          <TextWithLoadingPlaceholder syncing={syncing} width={50}>
            <BodySmall>~{networkFees} XLM</BodySmall>
          </TextWithLoadingPlaceholder>
        </RowBetween>
      )}
      {true && (
        <RowBetween>
          <MouseoverTooltip title={'The impact your trade has on the market price of this pool.'}>
            <BodySmall color="textSecondary">Price Impact</BodySmall>
          </MouseoverTooltip>
          <TextWithLoadingPlaceholder syncing={syncing} width={50}>
            <BodySmall>~{priceImpact}%</BodySmall>
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
            <BodySmall color="textSecondary">Expected output</BodySmall>
          </MouseoverTooltip>
        </RowFixed>
        <TextWithLoadingPlaceholder syncing={syncing} width={65}>
          <BodySmall style={{ display: 'flex', alignItems: 'center' }} component="div">
            {formatTokenAmount(trade?.outputAmount?.value ?? '0')}{' '}
            {trade?.outputAmount?.currency.code}{' '}
            <CurrencyLogo
              currency={trade?.outputAmount?.currency}
              size="16px"
              style={{ marginLeft: '6px' }}
            />
          </BodySmall>
        </TextWithLoadingPlaceholder>
      </RowBetween>
      {pathArray.length > 0 && (
        <RowBetween>
          <RowFixed>
            <MouseoverTooltip
              title={`
                  Routing through these assets resulted in the best price for your trade
                `}
            >
              <BodySmall color="textSecondary">Path</BodySmall>
            </MouseoverTooltip>
          </RowFixed>
          <TextWithLoadingPlaceholder syncing={syncing} width={65}>
            <PathBox>
              {pathArray?.map((contract, index) => (
                <>
                  {contract}
                  {index !== pathArray.length - 1 && <ChevronRight style={{opacity: "50%"}}/>}
                </>
                )
              )}
            </PathBox>
          </TextWithLoadingPlaceholder>
        </RowBetween>
      )}
    </Column>
  );
}
