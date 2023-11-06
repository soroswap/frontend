import { styled } from '@mui/material';
import Column from 'components/Column';
import CurrencyLogo from 'components/Logo/CurrencyLogo';
import Row from 'components/Row';
import { BodySecondary, BodySmall } from 'components/Text';
import { TokenType } from 'interfaces';
import { useMemo } from 'react';
import { Field } from 'state/mint/actions';

export const Label = styled(BodySmall)<{ cursor?: string }>`
  cursor: ${({ cursor }) => cursor};
  color: ${({ theme }) => theme.palette.secondary.main};
  margin-right: 8px;
`;
const CurrencyWrapper = styled('div')`
  display: flex;
  flex-direction: row;
  gap: 8px;
  background: #2a2e44;
  border-radius: 79px;
  padding: 8px;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-family: 'Inter';
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
`;
const CustomRow = styled(Row)`
  border-radius: var(--arrendodamento, 16px);
  border: 1px solid var(--fora-do-brading-desativado, #4e4e4e);
  padding: 15px;
`;

export default function AddModalHeader({
  currencies,
  amountOfLpTokensToReceive,
}: {
  currencies: { [field in Field]?: TokenType };
  amountOfLpTokensToReceive: string;
}) {
  const currencyA = useMemo(() => {
    return currencies.CURRENCY_A;
  }, [currencies]);

  const currencyB = useMemo(() => {
    return currencies.CURRENCY_B;
  }, [currencies]);

  return (
    <CustomRow align="end" justify="space-between">
      <Column gap="4px" alignItems="flex-start">
        <Label cursor="help">You will mint</Label>
        <CurrencyWrapper>
          <CurrencyLogo currency={currencyA} size="24px" />
          <CurrencyLogo currency={currencyB} size="24px" />
          {amountOfLpTokensToReceive}
        </CurrencyWrapper>
        {currencyA?.symbol}/{currencyB?.symbol} Liquidity Pool Token
      </Column>
    </CustomRow>
  );
}
