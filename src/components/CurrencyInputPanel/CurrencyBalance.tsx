import { styled, useTheme } from '@mui/material';
import { RowFixed } from 'components/Row';
import { BodySmall } from 'components/Text';

import useGetMyBalances from 'hooks/useGetMyBalances';
import { TokenType } from 'interfaces/tokens';
import { useEffect, useState } from 'react';

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
  onMax: (maxValue: number) => void;
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
  const [balance, setBalance] = useState<string>();

  const { tokenBalancesResponse } = useGetMyBalances();

  useEffect(() => {
    if (!tokenBalancesResponse) return;

    const token = tokenBalancesResponse.balances.find(
      (token) => token.address === currency.address,
    );

    if (token) {
      setBalance(token.balance as string);
    }
  }, [tokenBalancesResponse, currency]);

  const theme = useTheme();

  return (
    <RowFixed style={{ height: '17px' }}>
      <BodySmall color={theme.palette.secondary.main}>
        {!hideBalance && currency && balance ? `Balance: ${balance}` : null}
      </BodySmall>
      {showMaxButton && Number(balance) > 0 ? (
        <StyledBalanceMax onClick={() => onMax(parseInt(balance ?? ''))}>Max</StyledBalanceMax>
      ) : null}
    </RowFixed>
  );
}
