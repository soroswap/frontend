import { styled, useTheme } from '@mui/material';
import { useSorobanReact } from '@soroban-react/core';
import BigNumber from 'bignumber.js';
import { ButtonError, SmallButtonPrimary } from 'components/Buttons/Button';
import Column from 'components/Column';
import Row, { AutoRow, RowBetween, RowFixed } from 'components/Row';
import { BodySmall, HeadlineSmall, SubHeaderSmall } from 'components/Text';
import { MouseoverTooltip } from 'components/Tooltip';
import { getExpectedAmount } from 'functions/getExpectedAmount';
import { getPriceImpactNew } from 'functions/getPriceImpact';
import { formatTokenAmount, twoDecimalsPercentage } from 'helpers/format';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { AlertTriangle } from 'react-feather';
import { InterfaceTrade, TradeType } from 'state/routing/types';
import { Label } from './SwapModalHeaderAmount';
import { SwapCallbackError, SwapShowAcceptChanges } from './styleds';
import CurrencyLogo from 'components/Logo/CurrencyLogo';

const DetailsContainer = styled(Column)`
  padding: 0 8px;
`;

const StyledAlertTriangle = styled(AlertTriangle)`
  margin-right: 8px;
  min-width: 24px;
`;

const ConfirmButton = styled(ButtonError)`
  height: 56px;
  margin-top: 10px;
`;

const DetailRowValue = styled(BodySmall)`
  text-align: right;
  overflow-wrap: break-word;
`;

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
}) {
  const sorobanContext = useSorobanReact();
  const theme = useTheme();
  // const transactionDeadlineSecondsSinceEpoch = useTransactionDeadline()?.toNumber() // in seconds since epoch
  // const isAutoSlippage = useUserSlippageTolerance()[0] === 'auto'
  // const [routerPreference] = useRouterPreference()
  // const routes = isClassicTrade(trade) ? getRoutingDiagramEntries(trade) : undefined
  // const { chainId } = useWeb3React()
  // const nativeCurrency = useNativeCurrency(chainId)

  const label = `${trade?.inputAmount?.currency.symbol}`;
  const labelInverted = `${trade?.outputAmount?.currency.symbol}`;

  const [expectedAmountOfOne, setExpectedAmountOfOne] = useState<string | number>();

  useEffect(() => {
    console.log('entro aca expetec amunt');
    getExpectedAmount(
      trade?.inputAmount?.currency,
      trade?.outputAmount?.currency,
      BigNumber(1).shiftedBy(7),
      sorobanContext,
    ).then((resp) => {
      setExpectedAmountOfOne(formatTokenAmount(resp));
    });
  }, [sorobanContext, trade?.inputAmount?.currency, trade?.outputAmount?.currency]);

  const [priceImpact, setPriceImpact] = useState<number>(0);

  useEffect(() => {
    console.log('entro aca impactnew');
    getPriceImpactNew(
      trade?.inputAmount?.currency,
      trade?.outputAmount?.currency,
      BigNumber(trade?.inputAmount?.value ?? '0'),
      sorobanContext,
      trade.tradeType,
    ).then((resp) => {
      setPriceImpact(twoDecimalsPercentage(resp.toString()));
    });
  }, [
    sorobanContext,
    trade?.inputAmount?.currency,
    trade?.outputAmount?.currency,
    trade?.inputAmount?.value,
    trade.tradeType,
  ]);

  return (
    <>
      <DetailsContainer gap="md">
        <BodySmall>
          <Row align="flex-start" justify="space-between" gap="sm">
            <Label>Exchange rate</Label>
            <DetailRowValue>{`1 ${label} = ${
              expectedAmountOfOne ?? '-'
            } ${labelInverted}`}</DetailRowValue>
          </Row>
        </BodySmall>
        <BodySmall>
          <Row align="flex-start" justify="space-between" gap="sm">
            <MouseoverTooltip
              title={
                'The fee paid to miners who process your transaction. This must be paid in ${nativeCurrency.symbol}.'
              }
            >
              <Label cursor="help">Network fees</Label>
            </MouseoverTooltip>
            <MouseoverTooltip placement="right" title={'<GasBreakdownTooltip trade={trade} />'}>
              <DetailRowValue>-$0</DetailRowValue>
            </MouseoverTooltip>
          </Row>
        </BodySmall>
        {true && (
          <BodySmall>
            <Row align="flex-start" justify="space-between" gap="sm">
              <MouseoverTooltip title="The impact your trade has on the market price of this pool.">
                <Label cursor="help">Price impact</Label>
              </MouseoverTooltip>
              <DetailRowValue>{priceImpact}%</DetailRowValue>
            </Row>
          </BodySmall>
        )}
        <BodySmall>
          <Row align="flex-start" justify="space-between" gap="sm">
            <MouseoverTooltip
              title={
                trade.tradeType === TradeType.EXACT_INPUT ? (
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
                {trade.tradeType === TradeType.EXACT_INPUT ? (
                  <>Minimum received</>
                ) : (
                  <>Maximum sent</>
                )}
              </Label>
            </MouseoverTooltip>
            <DetailRowValue style={{ display: 'flex', alignItems: 'center' }}>
              {formatTokenAmount(trade?.outputAmount?.value ?? '0')}{' '}
              {trade?.outputAmount?.currency.symbol}
              <CurrencyLogo
                currency={trade?.outputAmount?.currency}
                size="16px"
                style={{ marginLeft: '6px' }}
              />
            </DetailRowValue>
          </Row>
        </BodySmall>
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
              Confirm swap
            </HeadlineSmall>
          </ConfirmButton>
          {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
        </AutoRow>
      )}
    </>
  );
}
