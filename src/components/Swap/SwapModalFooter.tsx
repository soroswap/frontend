import { CircularProgress, styled, useTheme } from 'soroswap-ui';
import { useSorobanReact } from '@soroban-react/core';
import BigNumber from 'bignumber.js';
import { ButtonError, SmallButtonPrimary } from 'components/Buttons/Button';
import Column from 'components/Column';
import CurrencyLogo from 'components/Logo/CurrencyLogo';
import Row, { AutoRow, RowBetween, RowFixed } from 'components/Row';
import { BodySmall, HeadlineSmall, SubHeaderSmall } from 'components/Text';
import { MouseoverTooltip } from 'components/Tooltip';
import { getPriceImpactNew2 } from 'functions/getPriceImpact';
import { formatTokenAmount, twoDecimalsPercentage } from 'helpers/format';
import { useAllTokens } from 'hooks/tokens/useAllTokens';
import { findToken } from 'hooks/tokens/useToken';
import useGetReservesByPair from 'hooks/useGetReservesByPair';
import { getSwapAmounts } from 'hooks/useSwapCallback';
import React, { ReactNode, useEffect, useState } from 'react';
import { AlertTriangle, ChevronRight } from 'react-feather';
import { InterfaceTrade, PlatformType, TradeType } from 'state/routing/types';
import { PathBox, TextWithLoadingPlaceholder, formattedPriceImpact } from './AdvancedSwapDetails';
import { Label } from './SwapModalHeaderAmount';
import { getExpectedAmountOfOne } from './TradePrice';
import { SwapCallbackError, SwapShowAcceptChanges } from './styleds';

const DetailsContainer = styled(Column)`
  padding: 0 8px;
  min-height: 100%;
`;

const StyledAlertTriangle = styled(AlertTriangle)`
  margin-right: 8px;
  min-width: 24px;
`;

const ConfirmButton = styled(ButtonError)`
  height: 56px;
  margin-top: 10px;
`;

const DetailRowValue = styled(BodySmall)<{ component?: string }>(({}) => ({
  textAlign: 'right',
  overflowWrap: 'break-word',
}));

export default function SwapModalFooter({
  trade,
  allowedSlippage,
  swapResult,
  onConfirm,
  swapErrorMessage,
  disabledConfirm,
  swapQuoteReceivedDate,
  fiatValueInput,
  fiatValueOutput,
  showAcceptChanges,
  onAcceptChanges,
  trustline,
  networkFees,
}: {
  trade: InterfaceTrade;
  swapResult?: any; //SwapResult
  allowedSlippage: any; //Percent
  onConfirm: () => void;
  swapErrorMessage?: ReactNode;
  disabledConfirm: boolean;
  swapQuoteReceivedDate?: Date;
  fiatValueInput: { data?: number; isLoading: boolean };
  fiatValueOutput: { data?: number; isLoading: boolean };
  showAcceptChanges: boolean;
  onAcceptChanges: () => void;
  trustline: boolean;
  networkFees: number | null;
}) {
  const theme = useTheme();
  // const transactionDeadlineSecondsSinceEpoch = useTransactionDeadline()?.toNumber() // in seconds since epoch
  // const isAutoSlippage = useUserSlippageTolerance()[0] === 'auto'
  // const [routerPreference] = useRouterPreference()
  // const routes = isClassicTrade(trade) ? getRoutingDiagramEntries(trade) : undefined
  // const { chainId } = useWeb3React()
  // const nativeCurrency = useNativeCurrency(chainId)
  const { tokensAsMap, isLoading } = useAllTokens();

  const label = `${trade?.inputAmount?.currency.code}`;
  const labelInverted = `${trade?.outputAmount?.currency.code}`;

  const sorobanContext = useSorobanReact();

  const getSwapValues = () => {
    if (!trade || !trade?.tradeType) return { formattedAmount0: '0', formattedAmount1: '0' };

    const { amount0, amount1 } = getSwapAmounts({
      tradeType: trade.tradeType,
      inputAmount: trade.inputAmount?.value as string,
      outputAmount: trade.outputAmount?.value as string,
      allowedSlippage: allowedSlippage,
    });

    const formattedAmount0 = formatTokenAmount(amount0);
    const formattedAmount1 = formatTokenAmount(amount1);

    return { formattedAmount0, formattedAmount1 };
  };

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
          if (address == "native") return "XLM"
          return address.split(":")[0]
        })
        setPathArray(codes);
        setPathTokensIsLoading(false);
      }
    })();
  }, [trade?.path, isLoading, sorobanContext]);

  return (
    <>
      <DetailsContainer gap="md">
        <BodySmall component="div">
          <Row align="flex-start" justify="space-between" gap="sm">
            <Label>Exchange rate</Label>
            <DetailRowValue>{`1 ${label} = ${
              getExpectedAmountOfOne(trade, true) ?? '-'
            } ${labelInverted}`}</DetailRowValue>
          </Row>
        </BodySmall>
        {networkFees != 0 && (
          <BodySmall component="div">
            <Row align="flex-start" justify="space-between" gap="sm">
              <MouseoverTooltip
                title={
                  'The fee paid to miners who process your transaction. This must be paid in XLM.'
                }
              >
                <Label cursor="help">Network fees</Label>
              </MouseoverTooltip>
              <DetailRowValue>~{networkFees} XML</DetailRowValue>
              {/* <MouseoverTooltip placement="right" title={'<GasBreakdownTooltip trade={trade} />'}>
              </MouseoverTooltip> */}
            </Row>
          </BodySmall>
        )}
        {true && (
          <BodySmall component="div">
            <Row align="flex-start" justify="space-between" gap="sm">
              <MouseoverTooltip title="The impact your trade has on the market price of this pool.">
                <Label cursor="help">Price impact</Label>
              </MouseoverTooltip>
              {formattedPriceImpact(trade?.priceImpact)}
            </Row>
          </BodySmall>
        )}
        <BodySmall component="div">
          <Row align="flex-start" justify="space-between" gap="sm">
            <MouseoverTooltip
              title={
                trade?.tradeType === TradeType.EXACT_INPUT ? (
                  <>
                    The minimum amount you are guaranteed to receive. If the price slips any
                    further, your transaction will revert.
                  </>
                ) : (
                  <>
                    The maximum amount you are guaranteed to spend. If the price slips any further,
                    your transaction will revert.
                  </>
                )
              }
            >
              <Label cursor="help">
                {trade?.tradeType === TradeType.EXACT_INPUT ? (
                  <>Receive at least</>
                ) : (
                  <>Pay at Most</>
                )}
              </Label>
            </MouseoverTooltip>
            <DetailRowValue style={{ display: 'flex', alignItems: 'center' }} component="div">
              {getSwapValues().formattedAmount1} {trade?.outputAmount?.currency.code}
              <CurrencyLogo
                currency={trade?.outputAmount?.currency}
                size="16px"
                style={{ marginLeft: '6px' }}
              />
            </DetailRowValue>
          </Row>
        </BodySmall>
        <RowBetween>
          <RowFixed>
            <MouseoverTooltip
              title={`
                  Routing through these assets resulted in the best price for your trade
                `}
            >
              <Label cursor="help">Path</Label>
            </MouseoverTooltip>
          </RowFixed>
          <TextWithLoadingPlaceholder syncing={pathTokensIsLoading} width={100}>
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
        {trade?.platform && (
          <RowBetween>
            <MouseoverTooltip title={'The platform where the swap will be made.'}>
              <Label>Platform</Label>
            </MouseoverTooltip>
            <BodySmall data-testid="swap__details__platform">{trade.platform}</BodySmall>
          </RowBetween>
        )}
      </DetailsContainer>
      {showAcceptChanges ? (
        <SwapShowAcceptChanges data-testid="show-accept-changes">
          <RowBetween>
            <RowFixed>
              <StyledAlertTriangle size={20} />
              <SubHeaderSmall color={theme.palette.customBackground.accentAction}>
                Price updated
              </SubHeaderSmall>
            </RowFixed>
            <SmallButtonPrimary onClick={onAcceptChanges}>Accept</SmallButtonPrimary>
          </RowBetween>
        </SwapShowAcceptChanges>
      ) : (
        <AutoRow>
          <ConfirmButton
            data-testid="confirm-swap-button"
            onClick={onConfirm}
            disabled={disabledConfirm}
            $borderRadius="20px"
            id={'CONFIRM_SWAP_BUTTON'}
          >
            <HeadlineSmall color={theme.palette.custom.accentTextLightPrimary}>
              {trustline ? `Set ${trade?.outputAmount?.currency.code} trustline` : 'Confirm swap'}
            </HeadlineSmall>
          </ConfirmButton>
          {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
        </AutoRow>
      )}
    </>
  );
}
