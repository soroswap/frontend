import { BodySmall } from 'components/Text';
import { Box, styled } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';
import { findToken } from 'hooks/tokens/useToken';
import { formatTokenAmount } from 'helpers/format';
import { InterfaceTrade } from 'state/routing/types';
import { LoadingRows } from 'components/Loader/styled';
import { MouseoverTooltip } from 'components/Tooltip';
import { RowBetween, RowFixed } from 'components/Row';
import { Separator } from 'components/SearchModal/styleds';
import { useAllTokens } from 'hooks/tokens/useAllTokens';
import React, { useEffect, useState } from 'react';
import { useSorobanReact } from '@soroban-react/core';
import Column from 'components/Column';
import CurrencyLogo from 'components/Logo/CurrencyLogo';
import useGetPriceImpactFromTrade from 'hooks/useGetPriceImpactFromTrade';

export const PathBox = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
`;

interface AdvancedSwapDetailsProps {
  trade: InterfaceTrade | undefined;
  allowedSlippage: number;
  syncing?: boolean;
  networkFees: number | null;
}

export function TextWithLoadingPlaceholder({
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
  const { tokensAsMap, isLoading } = useAllTokens();

  const { formatted: priceImpact, isLoading: isLoadingPriceImpact } =
    useGetPriceImpactFromTrade(trade);

  const [pathArray, setPathArray] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      if (!trade?.path || isLoading) return;

      const promises = trade.path.map(async (contract) => {
        const asset = await findToken(contract, tokensAsMap, sorobanContext);
        const code = asset?.code == 'native' ? 'XLM' : asset?.code;
        return code;
      });

      const results = await Promise.allSettled(promises);

      const fulfilledValues = results
        .filter((result) => result.status === 'fulfilled' && result.value)
        .map((result) => (result.status === 'fulfilled' && result.value ? result.value : ''));

      setPathArray(fulfilledValues);
    })();
  }, [trade?.path, isLoading, sorobanContext]);

  return (
    <Column gap="md">
      <Separator />
      {networkFees != 0 && (
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
          <TextWithLoadingPlaceholder syncing={isLoadingPriceImpact} width={50}>
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
        <TextWithLoadingPlaceholder syncing={isLoading} width={65}>
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
                <React.Fragment key={index}>
                  {contract}
                  {index !== pathArray.length - 1 && <ChevronRight style={{ opacity: '50%' }} />}
                </React.Fragment>
              ))}
            </PathBox>
          </TextWithLoadingPlaceholder>
        </RowBetween>
      )}
    </Column>
  );
}
