// import { Trans } from '@lingui/macro'
// import { TraceEvent } from '@uniswap/analytics'
// import { BrowserEvent, InterfaceElementName, SwapEventName } from '@uniswap/analytics-events'
// import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
// import { Pair } from '@uniswap/v2-sdk'
// import { useWeb3React } from '@web3-react/core'
// import { AutoColumn } from 'components/Column'
// import { LoadingOpacityContainer, loadingOpacityMixin } from 'components/Loader/styled'
// import { isSupportedChain } from 'constants/chains'
// import { darken } from 'polished'
// import { ReactNode, useCallback, useState } from 'react'
// import { Lock } from 'react-feather'
// import { flexColumnNoWrap, flexRowNoWrap } from 'theme/styles'
// import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'

import { ButtonBase, styled, useTheme } from '@mui/material';
import { useSorobanReact } from '@soroban-react/core';
import { LoadingOpacityContainer } from 'components/Loader/styled';
import CurrencyLogo from 'components/Logo/CurrencyLogo';
import NumericalInput from 'components/NumericalInput';
import { RowBetween, RowFixed } from 'components/Row';
import CurrencySearchModal from 'components/SearchModal/CurrencySearchModal';
import { TokenType } from 'interfaces';
import { darken } from 'polished';
import { ReactNode, useCallback, useState, useEffect } from 'react';
import { ChevronDown } from 'react-feather';
import { flexColumnNoWrap, flexRowNoWrap } from 'themes/styles';
import CurrencyBalance from './CurrencyBalance';
import { FiatValue } from './FiatValue';

// import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'
// import { useCurrencyBalance } from '../../state/connection/hooks'
// import { ThemedText } from '../../theme'
// import { ButtonGray } from '../Button'
// import DoubleCurrencyLogo from '../DoubleLogo'
// import CurrencyLogo from '../Logo/CurrencyLogo'
// import { Input as NumericalInput } from '../NumericalInput'
// import { RowBetween, RowFixed } from '../Row'
// import CurrencySearchModal from '../SearchModal/CurrencySearchModal'
// import { FiatValue } from './FiatValue'

const InputPanel = styled('div')<{ hideInput?: boolean }>`
  ${flexColumnNoWrap};
  position: relative;
  border-radius: ${({ hideInput }) => (hideInput ? '16px' : '20px')};
  z-index: 1;
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  transition: height 1s ease;
  will-change: height;
`;

const Container = styled('div')<{ hideInput: boolean; disabled: boolean; transparent?: boolean }>`
  border-radius: ${({ hideInput }) => (hideInput ? '16px' : '20px')};
  border: 1px solid ${({ theme }) => theme.palette.custom.textSecondary};
  background-color: ${({ theme, transparent }) =>
    transparent ? 'transparent' : theme.palette.customBackground.bg1};
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
`;

const shouldNotForwardPropsCurrencySelect = ['hideInput', 'visible'];

const CurrencySelect = styled(ButtonBase, {
  shouldForwardProp: (prop) => !shouldNotForwardPropsCurrencySelect.includes(prop as string),
})<{
  visible: boolean;
  selected: boolean;
  hideInput?: boolean;
  disabled?: boolean;
}>`
  align-items: center;
  background-color: ${({ theme }) => theme.palette.customBackground.bg6};
  opacity: ${({ disabled }) => (!disabled ? 1 : 0.4)};
  box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
  color: ${({ selected, theme }) => (selected ? theme.palette.primary.main : '#FFFFFF')};
  cursor: pointer;
  border-radius: 16px;
  outline: none;
  user-select: none;
  border: none;
  font-size: 24px;
  font-weight: 400;
  height: ${({ hideInput }) => (hideInput ? '2.8rem' : '2.4rem')};
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  padding: 0 8px;
  justify-content: space-between;
  margin-left: ${({ hideInput }) => (hideInput ? '0' : '12px')};
  visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};
`;

const InputRow = styled('div')<{ selected: boolean }>`
  ${flexRowNoWrap};
  align-items: center;
  justify-content: space-between;
  padding: ${({ selected }) => (selected ? ' 1rem 1rem 0.75rem 1rem' : '1rem 1rem 1rem 1rem')};
`;

const LabelRow = styled('div')`
  ${flexRowNoWrap};
  align-items: center;
  color: ${({ theme }) => theme.palette.primary.main};
  font-size: 0.75rem;
  line-height: 1rem;
  padding: 0 1rem 1rem;
  span:hover {
    cursor: pointer;
    color: ${({ theme }) => darken(0.2, theme.palette.secondary.main)};
  }
`;

const FiatRow = styled(LabelRow)`
  justify-content: flex-end;
  padding: 0px 1rem 0.75rem;
  height: 32px;
`;

const Aligner = styled('span')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const StyledDropDown = styled(ChevronDown)<{ selected: boolean }>`
  margin: 0 0.25rem 0 0.35rem;
  height: 35%;
  color: ${({ selected, theme }) =>
    selected ? theme.palette.primary.main : theme.palette.custom.textPrimary};
`;

const StyledTokenName = styled('span')<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.25rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  color: ${({ theme }) => theme.palette.custom.textPrimary};
  font-size: 20px;
`;

const StyledBalanceMax = styled('button')<{ disabled?: boolean }>`
  background-color: transparent;
  background-color: ${({ theme }) => theme.palette.customBackground.bg5};
  border: none;
  border-radius: 12px;
  color: ${({ theme }) => theme.palette.customBackground.accentAction};
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  margin-left: 0.25rem;
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

const StyledNumericalInput = styled(NumericalInput)<{ $loading: boolean }>`
  text-align: right;

  filter: ${({ $loading }) => ($loading ? 'grayscale(1)' : 'none')};
  opacity: ${({ $loading }) => ($loading ? '0.4' : '1')};
  transition: opacity 0.2s ease-in-out;
  text-align: right;
  font-size: 24px;
  line-height: 44px;
  font-variant: small-caps;

  @media (max-width: ${({ theme }) => theme.breakpoints.values.md}px) {
    font-size: 20px;
  }
`;

interface CurrencyInputPanelProps {
  value: string;
  onUserInput: (value: string) => void;
  onMax: (maxValue: string) => void;
  showMaxButton: boolean;
  label?: ReactNode;
  onCurrencySelect: (currency: TokenType) => void;
  currency?: TokenType | null;
  hideBalance?: boolean;
  hideInput?: boolean;
  otherCurrency?: TokenType | null;
  fiatValue?: { data?: number; isLoading: boolean };
  id: string;
  showCommonBases?: boolean;
  showCurrencyAmount?: boolean;
  disableNonToken?: boolean;
  renderBalance?: (amount: any) => ReactNode;
  loading?: boolean;
  transparent?: boolean;
  networkFees?: number | undefined | null;
  subentryCount?: number | undefined | null;
}

export default function CurrencyInputPanel({
  value,
  onUserInput,
  onMax,
  showMaxButton,
  onCurrencySelect,
  currency,
  otherCurrency,
  id,
  showCommonBases,
  showCurrencyAmount,
  disableNonToken,
  renderBalance,
  fiatValue,
  transparent = false,
  hideBalance = false,
  hideInput = false,
  loading = false,
  networkFees,
  subentryCount,
  ...rest
}: CurrencyInputPanelProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { address, activeChain } = useSorobanReact();
  const selectedCurrencyBalance = 0; //useCurrencyBalance(address ?? undefined, currency ?? undefined)
  const theme = useTheme();

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false);
  }, [setModalOpen]);

  return (
    <InputPanel id={id} hideInput={hideInput} {...rest}>
      <Container hideInput={hideInput} disabled={!activeChain} transparent={transparent}>
        <InputRow
          style={hideInput ? { padding: '0', borderRadius: '8px' } : {}}
          selected={!onCurrencySelect}
        >
          <CurrencySelect
            disabled={!activeChain}
            visible={currency !== undefined}
            selected={!!currency}
            hideInput={hideInput}
            className="open-currency-select-button"
            onClick={() => {
              setModalOpen(true);
            }}
          >
            <Aligner>
              <RowFixed>
                {currency ? (
                  <CurrencyLogo style={{ marginRight: '0.5rem' }} currency={currency} size="24px" />
                ) : null}
                <StyledTokenName
                  className="token-symbol-container"
                  active={Boolean(currency && currency.code)}
                >
                  {(currency && currency.code && currency.code.length > 20
                    ? currency.code.slice(0, 4) +
                      '...' +
                      currency.code.slice(currency.code.length - 5, currency.code.length)
                    : currency?.code) || 'Select a token'}
                </StyledTokenName>
              </RowFixed>
              <StyledDropDown selected={!!currency} />
            </Aligner>
          </CurrencySelect>
          {!hideInput && (
            <StyledNumericalInput
              className="token-amount-input"
              value={value}
              onUserInput={onUserInput}
              disabled={Boolean(!activeChain && currency)}
              $loading={loading}
            />
          )}
        </InputRow>
        {Boolean(!hideInput && !hideBalance && currency) && (
          <FiatRow>
            <RowBetween>
              {address && currency ? (
                <CurrencyBalance
                  address={address}
                  currency={currency}
                  onMax={onMax}
                  hideBalance={hideBalance}
                  showMaxButton={showMaxButton}
                  networkFees={networkFees}
                  subentryCount={subentryCount}
                />
              ) : (
                <span />
              )}
              <LoadingOpacityContainer $loading={loading}>
                {fiatValue && <FiatValue fiatValue={fiatValue} />}
              </LoadingOpacityContainer>
            </RowBetween>
          </FiatRow>
        )}
      </Container>
      <CurrencySearchModal
        isOpen={modalOpen}
        onDismiss={handleDismissSearch}
        onCurrencySelect={onCurrencySelect}
        selectedCurrency={currency}
        otherSelectedCurrency={otherCurrency}
        showCommonBases={showCommonBases}
        showCurrencyAmount={showCurrencyAmount}
        disableNonToken={disableNonToken}
      />
    </InputPanel>
  );
}
