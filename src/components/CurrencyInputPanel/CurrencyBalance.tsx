import { styled, useTheme } from '@mui/material';
import { RowFixed } from 'components/Row';
import { BodySmall } from 'components/Text';
import useGetMyBalances from 'hooks/useGetMyBalances';
import { MouseoverTooltip } from 'components/Tooltip';

import { TokenType } from 'interfaces/tokens';
import { xlmTokenList } from 'constants/xlmToken';
import { useMemo } from 'react';
import { useSorobanReact } from '@soroban-react/core';
import { TextWithLoadingPlaceholder } from 'components/Swap/AdvancedSwapDetails';

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
  networkFees?: number | undefined | null;
  subentryCount?: number | undefined | null;
  isLoadingNetworkFees?: boolean;
}

export default function CurrencyBalance({
  currency,
  address,
  onMax,
  hideBalance,
  showMaxButton,
  networkFees,
  subentryCount,
  isLoadingNetworkFees,
}: CurrencyBalanceProps) {
  // const [fee, setFee] = useState<number>(0);
  // const [adjustedBalance, setAdjustedBalance] = useState<number>(0);
  const { tokenBalancesResponse, isLoading: isLoadingMyBalances } = useGetMyBalances();

  const balance =
    tokenBalancesResponse?.balances?.find((b) => b?.contract === currency?.contract)?.balance ||
    '0';
  const { activeChain } = useSorobanReact();

  let availableBalance: number;
  const xlmTokenContract = useMemo(() => {
    return xlmTokenList.find((tList) => tList.network === activeChain?.id)?.assets[0].contract;
  }, [activeChain]);

  const isXLM = currency.contract === xlmTokenContract;

  if (isXLM) {
    availableBalance =
      Number(balance) - Number(networkFees) - 1 - 0.5 * Number(subentryCount) > 0
        ? Number(balance) - Number(networkFees) - 1 - 0.5 * Number(subentryCount)
        : 0;
  } else {
    availableBalance = Number(balance);
  }

  const theme = useTheme();

  return (
    <TextWithLoadingPlaceholder
      syncing={(isXLM && Boolean(isLoadingNetworkFees)) || isLoadingMyBalances}
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
              {!hideBalance && currency ? `Available balance: ${availableBalance}` : null}
            </BodySmall>
          </MouseoverTooltip>
        ) : (
          <BodySmall color={theme.palette.secondary.main}>
            {!hideBalance && currency ? `Balance: ${availableBalance}` : null}
          </BodySmall>
        )}

        {showMaxButton && availableBalance > 0 && ((isXLM && Number(networkFees) > 0) || !isXLM) ? (
          <StyledBalanceMax onClick={() => onMax(availableBalance.toString())}>
            Max
          </StyledBalanceMax>
        ) : null}
      </RowFixed>
    </TextWithLoadingPlaceholder>
  );
}
