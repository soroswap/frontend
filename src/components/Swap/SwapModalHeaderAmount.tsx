import { Box, styled, useMediaQuery, useTheme } from 'soroswap-ui';
import Column from 'components/Column';
import CurrencyLogo from 'components/Logo/CurrencyLogo';
import Row from 'components/Row';
import { BodySecondary, BodySmall, ResponsiveMediumText } from 'components/Text';
import { MouseoverTooltip } from 'components/Tooltip';
import { formatTokenAmount } from 'helpers/format';
import { TokenType } from 'interfaces';
import { ReactNode } from 'react';
import { Field } from 'state/swap/actions';

const MAX_AMOUNT_STR_LENGTH = 9;

export const Label = styled(BodySmall)<{ cursor?: string }>`
  cursor: ${({ cursor }) => cursor};
  color: ${({ theme }) => theme.palette.secondary.main};
  margin-right: 8px;
`;

const CurrencyWrapper = styled('div')`
  display: flex;
  flex-direction: row;
  gap: 8px;
  background: ${({ theme }) => theme.palette.customBackground.interactive};
  border-radius: 79px;
  padding: 4px 8px 4px 4px;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-family: 'Inter';
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
`;

const CustomRow = styled(Row)`
  border-radius: 16px;
  border: 1px solid #4e4e4e;
  padding: 15px;
  overflow: auto;
`;

interface AmountProps {
  field: Field;
  tooltipText?: ReactNode;
  label: ReactNode;
  amount: string;
  usdAmount?: string;
  currency: TokenType | undefined;
}
export function SwapModalHeaderAmount({
  tooltipText,
  label,
  amount,
  usdAmount,
  field,
  currency,
}: AmountProps) {
  const theme = useTheme();
  let formattedAmount = formatTokenAmount(amount); //formatCurrencyAmount(amount, NumberType.TokenTx)
  // if (formattedAmount.length > MAX_AMOUNT_STR_LENGTH) {
  //   formattedAmount = ""//formatCurrencyAmount(amount, NumberType.SwapTradeAmount)
  // }

  const isSmallDevice = useMediaQuery('(max-width: 400px)');

  return (
    <CustomRow align="end" justify="space-between" flexDirection="row" gap="8px">
      <Column gap="4px" alignItems="flex-start">
        <BodySecondary component="div">
          <MouseoverTooltip title={tooltipText} disableInteractive={!tooltipText}>
            <Label cursor="help">{label}</Label>
          </MouseoverTooltip>
        </BodySecondary>
        <Box alignItems="start" display="flex" flexDirection="column">
          <CurrencyWrapper>
            <CurrencyLogo currency={currency} size="24px" />
            {currency?.code}
          </CurrencyWrapper>
          <Label>{currency?.issuer ? currency?.code : currency?.name}</Label>
        </Box>
      </Column>
      <Column gap="4px" alignItems={isSmallDevice ? 'flex-start' : 'flex-end'}>
        <ResponsiveMediumText>{formattedAmount}</ResponsiveMediumText>
        {usdAmount !== undefined && (
          <BodySmall alignSelf={'end'} color={theme.palette.custom.textTertiary}>
            {usdAmount}
          </BodySmall>
        )}
      </Column>
    </CustomRow>
  );
}
