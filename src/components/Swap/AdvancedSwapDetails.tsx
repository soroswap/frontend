import { BodySmall } from 'components/Text';
import { Box, styled } from 'soroswap-ui';
import { ChevronRight } from '@mui/icons-material';
import { useSorobanReact } from '@soroban-react/core';
import Column from 'components/Column';
import { LoadingRows } from 'components/Loader/styled';
import CurrencyLogo from 'components/Logo/CurrencyLogo';
import { RowBetween, RowFixed } from 'components/Row';
import { Separator } from 'components/SearchModal/styleds';
import { MouseoverTooltip } from 'components/Tooltip';
import { formatTokenAmount } from 'helpers/format';
import { useAllTokens } from 'hooks/tokens/useAllTokens';
import { findToken } from 'hooks/tokens/useToken';
import React, { useEffect, useState } from 'react';
import { Percent } from 'soroswap-router-sdk';
import { InterfaceTrade, PlatformType } from 'state/routing/types';

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

export const formattedPriceImpact = (priceImpact: Percent | Number | undefined) => {
  if (!priceImpact) return 0;

  const value = priceImpact?.toFixed(3);

  if (!value) {
    return 0;
  }

  if (Number(value) < 0.01) {
    return '<0.01%';
  }

  return `~${priceImpact?.toFixed(2)}%`;
};

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

  const [pathArray, setPathArray] = useState<string[]>([]);

  const [pathTokensIsLoading, setPathTokensIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (!trade?.path || isLoading) return;
      if (trade.platform == PlatformType.ROUTER) {
        setPathTokensIsLoading(true);
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
        setPathTokensIsLoading(false);
      } else if (trade.platform == PlatformType.STELLAR_CLASSIC) {
        setPathTokensIsLoading(true);
        const codes = trade.path.map((address) => {
          if (address == 'native') return 'XLM';
          return address.split(':')[0];
        });
        setPathArray(codes);
        setPathTokensIsLoading(false);
      }
    })();
  }, [trade?.path, isLoading, sorobanContext]);

  return (
    <Column gap="md">
      <Separator />
      {networkFees != 0 && (
        <RowBetween>
          <MouseoverTooltip
            title={'The fee paid to process your transaction. This must be paid always in XLM.'}
          >
            <BodySmall color="textSecondary">Network fee</BodySmall>
          </MouseoverTooltip>
          <TextWithLoadingPlaceholder syncing={syncing} width={50}>
            <BodySmall display={'flex'}>~{networkFees} XLM</BodySmall>
          </TextWithLoadingPlaceholder>
        </RowBetween>
      )}
      {true && (
        <RowBetween>
          <MouseoverTooltip title={'The impact your trade has on the market price of this pool.'}>
            <BodySmall color="textSecondary">Price Impact</BodySmall>
          </MouseoverTooltip>
          <BodySmall data-testid="swap__details__priceImpact">
            {formattedPriceImpact(trade?.priceImpact)}
          </BodySmall>
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
          <BodySmall
            data-testid="swap__details__expectedOutput"
            style={{ display: 'flex', alignItems: 'center' }}
            component="div"
          >
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
      {
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
          <TextWithLoadingPlaceholder syncing={pathTokensIsLoading} width={100}>
            <PathBox data-testid="swap__details__path">
              {pathArray?.map((contract, index) => (
                <React.Fragment key={index}>
                  {contract}
                  {index !== pathArray.length - 1 && <ChevronRight style={{ opacity: '50%' }} />}
                </React.Fragment>
              ))}
            </PathBox>
          </TextWithLoadingPlaceholder>
        </RowBetween>
      }
      {trade?.platform && (
        <RowBetween>
          <MouseoverTooltip title={'The platform where the swap will be made.'}>
            <BodySmall color="textSecondary">Platform</BodySmall>
          </MouseoverTooltip>
          <BodySmall data-testid="swap__details__platform">{trade.platform}</BodySmall>
        </RowBetween>
      )}
    </Column>
  );
}
