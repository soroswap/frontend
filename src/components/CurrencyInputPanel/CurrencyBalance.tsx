import { styled } from 'soroswap-ui';;
import XlmCurrencyBalance from './XlmCurrencyBalance';
import TokenCurrencyBalance from './TokenCurrencyBalance';

import { useSorobanReact, WalletNetwork } from 'stellar-react';
import BigNumber from 'bignumber.js';
import { xlmTokenList } from 'constants/xlmToken';
import { memo, useEffect, useMemo, useState } from 'react';

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

const CurrencyBalance = ({
  contract,
  onMax,
  hideBalance,
  showMaxButton,
  networkFees,
  isLoadingNetworkFees,
}: CurrencyBalanceProps) => {
  const { activeNetwork } = useSorobanReact();
  const [activeChain, setActiveChain] = useState('');
  useEffect(() => {
    switch (activeNetwork) {
      case WalletNetwork.TESTNET:
        setActiveChain('testnet');
        break;
      case WalletNetwork.PUBLIC:
        setActiveChain('mainnet');
        break;
      default:
        setActiveChain('testnet');
        break;
    }
  }, [activeNetwork]);
  const xlmTokenContract = useMemo(() => {

    return xlmTokenList.find((tList) => tList.network === activeChain)?.assets[0].contract;
  }, [activeChain]);

  const isXLM = contract === xlmTokenContract;

  if (isLoadingNetworkFees || !xlmTokenContract) return

  /**
   * NOTE: Decomposite Balance view for XLM/OTHER tokens and minifed requests
   * */
  if (isXLM) {
    return (
      <XlmCurrencyBalance
        contract={contract}
        onMax={onMax!}
        hideBalance={hideBalance}
        showMaxButton={showMaxButton}
        networkFees={networkFees}
        isLoadingNetworkFees={isLoadingNetworkFees}
      />
    );
  } else {
    return (
      <TokenCurrencyBalance
        contract={contract}
        onMax={onMax!}
        hideBalance={hideBalance}
        showMaxButton={showMaxButton}
      />
    );
  }
}

export default memo(CurrencyBalance);
