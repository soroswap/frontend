import { styled, useTheme } from 'soroswap-ui';
import { RowFixed } from 'components/Row';
import { BodySmall } from 'components/Text';
import { MouseoverTooltip } from 'components/Tooltip';
import useGetMyBalances, { calculateAvailableBalance } from 'hooks/useGetMyBalances';
import BigNumber from 'bignumber.js';
import { TextWithLoadingPlaceholder } from 'components/Swap/AdvancedSwapDetails';
import useGetSubentryCount from 'hooks/useGetSubentryCount';
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

interface XlmCurrencyBalanceProps {
  contract: string;
  onMax: (maxValue: string) => void;
  hideBalance: any;
  showMaxButton: any;
  networkFees?: string | number | BigNumber | null;
  isLoadingNetworkFees?: boolean;
}

 const XlmCurrencyBalance = ({
  contract,
  onMax,
  hideBalance,
  showMaxButton,
  networkFees,
  isLoadingNetworkFees,
}: XlmCurrencyBalanceProps) => {

  const { subentryCount, nativeBalance, isLoading: isSubentryLoading } = useGetSubentryCount();

  const availableBalance = calculateAvailableBalance(nativeBalance, networkFees, subentryCount)

  const theme = useTheme();

  return (
    <TextWithLoadingPlaceholder
      syncing={Boolean(isLoadingNetworkFees)}
      width={150}
    >
      <RowFixed style={{ height: '17px' }}>
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

        {showMaxButton && Number(availableBalance) > 0 ? (
          <StyledBalanceMax onClick={() => onMax(availableBalance.toString())}>
            Max
          </StyledBalanceMax>
        ) : null}
      </RowFixed>
    </TextWithLoadingPlaceholder>
  );
}

export default memo(XlmCurrencyBalance)