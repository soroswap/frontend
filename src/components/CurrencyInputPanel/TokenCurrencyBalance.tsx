import { styled, useTheme } from 'soroswap-ui';
import { RowFixed } from 'components/Row';
import { BodySmall } from 'components/Text';
import useGetMyBalances from 'hooks/useGetMyBalances';
import BigNumber from 'bignumber.js';
import { TextWithLoadingPlaceholder } from 'components/Swap/AdvancedSwapDetails';
import { memo } from 'react';

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

interface TokenCurrencyBalanceProps {
  contract: string;
  onMax: (maxValue: string) => void;
  hideBalance: any;
  showMaxButton: any;
}

 const TokenCurrencyBalance = ({
  contract,
  onMax,
  hideBalance,
  showMaxButton,
}: TokenCurrencyBalanceProps) => {

  const {
    tokenBalancesResponse,
    isLoading: isLoadingMyBalances,
  } = useGetMyBalances();

  const balance =
    tokenBalancesResponse?.balances?.find((b) => b?.contract === contract)?.balance || '0';

  const availableBalance = balance;

  const theme = useTheme();

  return (
    <TextWithLoadingPlaceholder
      syncing={isLoadingMyBalances || !tokenBalancesResponse}
      width={150}
    >
      <RowFixed style={{ height: '17px' }}>
        <BodySmall color={theme.palette.secondary.main}>
          {!hideBalance && contract ? `Balance: ${Number(availableBalance)}` : null}
        </BodySmall>

        {showMaxButton && Number(availableBalance) > 0 ? (
          <StyledBalanceMax onClick={() => onMax(availableBalance.toString())}>
            Max
          </StyledBalanceMax>
        ) : null}
      </RowFixed>
    </TextWithLoadingPlaceholder>
  );
}

export default memo(TokenCurrencyBalance);