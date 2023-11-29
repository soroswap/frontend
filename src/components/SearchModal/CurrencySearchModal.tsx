import { Modal } from '@mui/material';
import { memo, useCallback, useEffect, useState } from 'react';
import useLast from '../../hooks/useLast';
import { TokenType } from '../../interfaces';
import { CurrencySearch } from './CurrencySearch';

interface CurrencySearchModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  selectedCurrency?: TokenType | null;
  onCurrencySelect: (currency: TokenType) => void;
  otherSelectedCurrency?: TokenType | null;
  showCommonBases?: boolean;
  showCurrencyAmount?: boolean;
  disableNonToken?: boolean;
  onlyShowCurrenciesWithBalance?: boolean;
}

enum CurrencyModalView {
  search,
  importToken,
  tokenSafety,
}

export default memo(function CurrencySearchModal({
  isOpen,
  onDismiss,
  onCurrencySelect,
  selectedCurrency,
  otherSelectedCurrency,
  showCommonBases = false,
  showCurrencyAmount = true,
  disableNonToken = false,
  onlyShowCurrenciesWithBalance = false,
}: CurrencySearchModalProps) {
  const [modalView, setModalView] = useState<CurrencyModalView>(CurrencyModalView.search);
  const lastOpen = useLast(isOpen);
  // const userAddedTokens = useUserAddedTokens()

  useEffect(() => {
    if (isOpen && !lastOpen) {
      setModalView(CurrencyModalView.search);
    }
  }, [isOpen, lastOpen]);

  const showTokenSafetySpeedbump = (token: TokenType) => {
    // setWarningToken(token)
    setModalView(CurrencyModalView.tokenSafety);
  };

  const handleCurrencySelect = useCallback(
    (currency: TokenType, hasWarning?: boolean) => {
      // if (hasWarning && currency.isToken && !userAddedTokens.find((token) => token.equals(currency))) {
      //   // showTokenSafetySpeedbump(currency)
      // } else {
      onCurrencySelect(currency);
      onDismiss();
      // }
    },
    [onDismiss, onCurrencySelect],
  );

  return (
    <Modal
      open={isOpen}
      onClose={onDismiss}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <div>
        <CurrencySearch
          isOpen={isOpen}
          onDismiss={onDismiss}
          onCurrencySelect={handleCurrencySelect}
          selectedCurrency={selectedCurrency}
          otherSelectedCurrency={otherSelectedCurrency}
          showCommonBases={showCommonBases}
          showCurrencyAmount={showCurrencyAmount}
          disableNonToken={disableNonToken}
          onlyShowCurrenciesWithBalance={onlyShowCurrenciesWithBalance}
        />
      </div>
    </Modal>
  );
});
