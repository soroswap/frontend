import { styled, useTheme } from '@mui/material';
import { RowFixed } from 'components/Row';
import { BodySmall } from 'components/Text';
import { MouseoverTooltip } from 'components/Tooltip';
import useGetMyBalances from 'hooks/useGetMyBalances';

import { useSorobanReact } from '@soroban-react/core';
import BigNumber from 'bignumber.js';
import { TextWithLoadingPlaceholder } from 'components/Swap/AdvancedSwapDetails';
import { xlmTokenList } from 'constants/xlmToken';
import { useMemo } from 'react';

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
  contract: string;
  onMax: (maxValue: string) => void;
  hideBalance: any;
  showMaxButton: any;
  networkFees?: string | number | BigNumber | null;
  isLoadingNetworkFees?: boolean;
}

export default function CurrencyBalance({
  contract,
  onMax,
  hideBalance,
  showMaxButton,
  networkFees,
  isLoadingNetworkFees,
}: CurrencyBalanceProps) {
  const {
    tokenBalancesResponse,
    availableNativeBalance,
    isLoading: isLoadingMyBalances,
  } = useGetMyBalances();
  const { activeChain } = useSorobanReact();

  const xlmTokenContract = useMemo(() => {
    return xlmTokenList.find((tList) => tList.network === activeChain?.id)?.assets[0].contract;
  }, [activeChain]);

  const isXLM = contract === xlmTokenContract;
  const balance =
    tokenBalancesResponse?.balances?.find((b) => b?.contract === contract)?.balance || '0';

  let availableBalance = balance;

  if (isXLM) {
    availableBalance = availableNativeBalance(networkFees);
  }

  const theme = useTheme();

  return (
    <TextWithLoadingPlaceholder
      syncing={
        (isXLM && Boolean(isLoadingNetworkFees)) || isLoadingMyBalances || !tokenBalancesResponse
      }
      width={150}
    >
      <RowFixed style={{ height: '17px' }}>
        {isXLM ? (
          <MouseoverTooltip
            title={
              <span>
                All Stellar accounts must maintain a minimum balance of lumens.{' '}
                <a
                  href="https://developers.stellar.org/docs/learn/fundamentals/lumens#minimum-balance"
                  style={{ textDecoration: 'underline' }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn More
                </a>
              </span>
            }
          >
            <BodySmall color={theme.palette.secondary.main}>
              {!hideBalance && contract ? `Available balance: ${Number(availableBalance)}` : null}
            </BodySmall>
          </MouseoverTooltip>
        ) : (
          <BodySmall color={theme.palette.secondary.main}>
            {!hideBalance && contract ? `Balance: ${Number(availableBalance)}` : null}
          </BodySmall>
        )}

        {showMaxButton && Number(availableBalance) > 0 ? (
          <StyledBalanceMax onClick={() => onMax(availableBalance.toString())}>
            Max
          </StyledBalanceMax>
        ) : null}
      </RowFixed>
    </TextWithLoadingPlaceholder>
  );
}
