import { styled, useTheme } from '@mui/material';
import { RowFixed } from 'components/Row';
import { BodySmall } from 'components/Text';
import useGetMyBalances from 'hooks/useGetMyBalances';
import { useEffect, useState } from 'react';

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
  networkFees?: number;
}

export default function CurrencyBalance({
  currency,
  address,
  onMax,
  hideBalance,
  showMaxButton,
  networkFees,
}: CurrencyBalanceProps) {
  const [fee, setFee] = useState<number>(0);
  const [adjustedBalance, setAdjustedBalance] = useState<number>(0);
  const { tokenBalancesResponse } = useGetMyBalances();
  const balance =
    tokenBalancesResponse?.balances?.find((b) => b?.contract === currency?.contract)?.balance ||
    '0';

  useEffect(() => {
    const setNetworkFeeVar = () => {
      if (networkFees) {
        setFee(networkFees);
      }
      if (currency.code != 'XLM') {
        setAdjustedBalance(Number(balance));
      } else {
        const baseReserve = 1;
        const availableBalance = Number(balance) - fee - baseReserve;
        if (adjustedBalance < 0) {
          setAdjustedBalance(0);
          showMaxButton = false;
        } else {
          setAdjustedBalance(availableBalance);
        }
      }
    };

    setNetworkFeeVar();
  }, [networkFees, fee, setFee, adjustedBalance, setAdjustedBalance]);

  const theme = useTheme();
  return (
    <RowFixed style={{ height: '17px' }}>
      <BodySmall color={theme.palette.secondary.main}>
        {!hideBalance && currency ? `Available balance: ${Number(balance) - 1}` : null}
      </BodySmall>
      {showMaxButton ? (
        <StyledBalanceMax onClick={() => onMax(adjustedBalance.toString())}>Max</StyledBalanceMax>
      ) : null}
    </RowFixed>
  );
}
