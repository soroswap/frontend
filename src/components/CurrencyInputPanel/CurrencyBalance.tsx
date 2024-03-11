import { styled, useTheme } from '@mui/material';
import { RowFixed } from 'components/Row';
import { BodySmall } from 'components/Text';
import useGetMyBalances from 'hooks/useGetMyBalances';

import { TokenType } from 'interfaces/tokens';

const StyledBalanceMax = styled('button')<{ disabled?: boolean }>`
  background-color: transparent;
  border: none;
  color: ${({ theme }) => theme.palette.custom.borderColor};
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  opacity: ${({ disabled }) => (!disabled ? 1 : 0.4)};
  padding: 4px 6px;
  pointer-events: ${({ disabled }) => (!disabled ? 'initial' : 'none')};

  :hover {
    opacity: ${({ disabled }) => (!disabled ? 0.8 : 0.4)};
  }

  :focus {
    outline: none;
  }
`;

interface CurrencyBalanceProps {
  address: string;
  currency: TokenType;
  onMax: (maxValue: string) => void;
  hideBalance: any;
  showMaxButton: any;
}

export default function CurrencyBalance({
  currency,
  address,
  onMax,
  hideBalance,
  showMaxButton,
}: CurrencyBalanceProps) {
  const { tokenBalancesResponse } = useGetMyBalances();
  const balance =
    tokenBalancesResponse?.balances?.find((b) => b?.contract === currency?.address)?.balance || '0';

  const theme = useTheme();
  return (
    <RowFixed style={{ height: '17px' }}>
      <BodySmall color={theme.palette.secondary.main}>
        {!hideBalance && currency ? `Balance: ${balance}` : null}
      </BodySmall>
      {showMaxButton ? (
        <StyledBalanceMax onClick={() => onMax(balance as string)}>Max</StyledBalanceMax>
      ) : null}
    </RowFixed>
  );
}
