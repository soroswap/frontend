import { styled, useTheme } from '@mui/material';
import { RowFixed } from 'components/Row';
import { BodySmall } from 'components/Text';
import { TextWithLoadingPlaceholder } from 'components/Swap/AdvancedSwapDetails';
import { xlmTokenList } from 'constants/xlmToken';
import { useEffect, useMemo } from 'react';

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

interface PolkadotAsset {
  code: string;
  issuer: string;
}

interface PolkadotBalance {
  asset: string | undefined;
  balance: number;
}

interface CurrencyBalanceProps {
  balances: PolkadotBalance[] | undefined;
  selectedAsset: PolkadotAsset | undefined;
  isLoading: boolean;
  onMax?: (maxValue: string) => void;
  hideBalance?: boolean;
  showMaxButton?: boolean;
}

export default function PolkadotCurrencyBalance({
  balances,
  selectedAsset,
  isLoading,
  onMax,
  hideBalance,
  showMaxButton,
}: CurrencyBalanceProps) {

  const getAssetBalance = ()=>{
    if (!selectedAsset || !balances) {
      return 0;
    }
    for (let balance in balances) {
      if(balances[balance].asset === selectedAsset.code){
        return Number(balances[balance].balance)
      }
    }
  }

  let availableBalance: number = 0;
  
  const endAmount = useMemo(() => {
    console.log(getAssetBalance())
    return (
      getAssetBalance() || 0
    );
  }, [balances, selectedAsset]);

  useEffect(() => {
    console.log(selectedAsset, balances)
    availableBalance = endAmount;
    
  }, [balances, selectedAsset])
  

  const theme = useTheme();

  return (
    <TextWithLoadingPlaceholder
      syncing={isLoading}
      width={150}
    >
      <RowFixed style={{ height: '17px' }}>

        <BodySmall color={theme.palette.secondary.main}>
          {!hideBalance && selectedAsset && `Balance: ${endAmount}`}
        </BodySmall>

        {showMaxButton && availableBalance > 0  && (
          <StyledBalanceMax onClick={() => onMax!(endAmount.toString())}>
            Max
          </StyledBalanceMax>
        )}
      </RowFixed>
    </TextWithLoadingPlaceholder>
  );
}
