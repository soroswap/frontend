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
// import styled, { useTheme } from 'styled-components/macro'
// import { flexColumnNoWrap, flexRowNoWrap } from 'theme/styles'
// import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'

import { styled, useTheme } from "@mui/material";
import { ButtonGray } from "components/Buttons/Button";
import { flexColumnNoWrap, flexRowNoWrap } from "themes/styles";
import { darken } from 'polished'
import { ArrowDownward } from "@mui/icons-material";
import NumericalInput from "components/NumericalInput";
import { LoadingOpacityContainer, loadingOpacityMixin } from "components/Loader/styled";
import { ReactNode, useCallback, useState } from "react";
import { TokenType } from "interfaces";
import { useSorobanReact } from "@soroban-react/core";
import { AutoColumn } from "components/Column";
import { Lock } from "react-feather";
import { BodyPrimary, SubHeader } from "components/Text";
import { RowBetween, RowFixed } from "components/Row";
import CurrencyLogo from "components/Logo/CurrencyLogo";
import { FiatValue } from "./FiatValue";
import CurrencySearchModal from "components/SearchModal/CurrencySearchModal";

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
  background-color: ${({ theme, hideInput }) => (hideInput ? 'transparent' : theme.palette.customBackground.interactive)};
  z-index: 1;
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  transition: height 1s ease;
  will-change: height;
`

const FixedContainer = styled('div')`
  width: 100%;
  height: 100%;
  position: absolute;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.palette.customBackground.interactive};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
`

const Container = styled('div')<{ hideInput: boolean; disabled: boolean }>`
  border-radius: ${({ hideInput }) => (hideInput ? '16px' : '20px')};
  border: 1px solid ${({ theme }) => theme.palette.customBackground.surface};
  background-color: ${({ theme }) => theme.palette.customBackground.bg1};
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  ${({ theme, hideInput, disabled }) =>
    !disabled &&
    `
    :focus,
    :hover {
      border: 1px solid ${hideInput ? ' transparent' : theme.palette.customBackground.bg3};
    }
  `}
`

const CurrencySelect = styled(ButtonGray)<{
  visible: boolean
  selected: boolean
  hideInput?: boolean
  disabled?: boolean
}>`
  align-items: center;
  background-color: ${({ selected, theme }) => (selected ? theme.palette.customBackground.interactive : theme.palette.customBackground.accentAction)};
  opacity: ${({ disabled }) => (!disabled ? 1 : 0.4)};
  box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  color: ${({ selected, theme }) => (selected ? theme.palette.primary.main : "#FFFFFF")};
  cursor: pointer;
  border-radius: 16px;
  outline: none;
  user-select: none;
  border: none;
  font-size: 24px;
  font-weight: 500;
  height: ${({ hideInput }) => (hideInput ? '2.8rem' : '2.4rem')};
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  padding: 0 8px;
  justify-content: space-between;
  margin-left: ${({ hideInput }) => (hideInput ? '0' : '12px')};
  :focus,
  :hover {
    background-color: ${({ selected, theme }) => (selected ? theme.palette.customBackground.bg3 : darken(0.05, theme.palette.customBackground.accentAction))};
  }
  visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};
`

const InputRow = styled('div')<{ selected: boolean }>`
  ${flexRowNoWrap};
  align-items: center;
  justify-content: space-between;
  padding: ${({ selected }) => (selected ? ' 1rem 1rem 0.75rem 1rem' : '1rem 1rem 1rem 1rem')};
`

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
`

const FiatRow = styled(LabelRow)`
  justify-content: flex-end;
  padding: 0px 1rem 0.75rem;
  height: 32px;
`

const Aligner = styled('span')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

const StyledDropDown = styled(ArrowDownward)<{ selected: boolean }>`
  margin: 0 0.25rem 0 0.35rem;
  height: 35%;

  path {
    stroke: ${({ selected, theme }) => (selected ? theme.palette.primary.main : "#FFFFFF")};
    stroke-width: 1.5px;
  }
`

const StyledTokenName = styled('span')<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.25rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size: 20px;
`

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
`

const StyledNumericalInput = styled(NumericalInput)<{ $loading: boolean }>`
  ${loadingOpacityMixin};
  text-align: left;
`

interface CurrencyInputPanelProps {
  value: string
  onUserInput: (value: string) => void
  onMax?: () => void
  showMaxButton: boolean
  label?: ReactNode
  onCurrencySelect?: (currency: TokenType) => void
  currency?: TokenType | null
  hideBalance?: boolean
  pair?: any | null
  hideInput?: boolean
  otherCurrency?: TokenType | null
  fiatValue?: { data?: number; isLoading: boolean }
  id: string
  showCommonBases?: boolean
  showCurrencyAmount?: boolean
  disableNonToken?: boolean
  renderBalance?: (amount: any) => ReactNode
  locked?: boolean
  loading?: boolean
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
  hideBalance = false,
  pair = null, // used for double token logo
  hideInput = false,
  locked = false,
  loading = false,
  ...rest
}: CurrencyInputPanelProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const { address, activeChain } = useSorobanReact();
  const selectedCurrencyBalance = 0//useCurrencyBalance(address ?? undefined, currency ?? undefined)
  const theme = useTheme()

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  return (
    <InputPanel id={id} hideInput={hideInput} {...rest}>
      {locked && (
        <FixedContainer>
          <AutoColumn gap="sm" justify="center">
            <Lock />
            <SubHeader fontSize="12px" textAlign="center" padding="0 12px">
              The market price is outside your specified price range. Single-asset deposit only.
            </SubHeader>
          </AutoColumn>
        </FixedContainer>
      )}
      <Container hideInput={hideInput} disabled={!activeChain}>
        <InputRow style={hideInput ? { padding: '0', borderRadius: '8px' } : {}} selected={!onCurrencySelect}>
          {!hideInput && (
            <StyledNumericalInput
              className="token-amount-input"
              value={value}
              onUserInput={onUserInput}
              disabled={!activeChain}
              $loading={loading}
            />
          )}

          <CurrencySelect
            disabled={!activeChain}
            visible={currency !== undefined}
            selected={!!currency}
            hideInput={hideInput}
            className="open-currency-select-button"
            onClick={() => {
              if (onCurrencySelect) {
                setModalOpen(true)
              }
            }}
          >
            <Aligner>
              <RowFixed>
                {pair ? (
                  <span style={{ marginRight: '0.5rem' }}>
                    {/* <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={24} margin={true} /> */}
                  </span>
                ) : currency ? (
                  <CurrencyLogo style={{ marginRight: '0.5rem' }} currency={currency} size="24px" />
                ) : null}
                {pair ? (
                  <StyledTokenName className="pair-name-container">
                    {pair?.token0.token_symbol}:{pair?.token1.token_symbol}
                  </StyledTokenName>
                ) : (
                  <StyledTokenName className="token-symbol-container" active={Boolean(currency && currency.token_symbol)}>
                    {(currency && currency.token_symbol && currency.token_symbol.length > 20
                      ? currency.token_symbol.slice(0, 4) +
                        '...' +
                        currency.token_symbol.slice(currency.token_symbol.length - 5, currency.token_symbol.length)
                      : currency?.token_symbol) || `Select a token`}
                  </StyledTokenName>
                )}
              </RowFixed>
              {onCurrencySelect && <StyledDropDown selected={!!currency} />}
            </Aligner>
          </CurrencySelect>
        </InputRow>
        {!hideInput && !hideBalance && currency && (
          <FiatRow>
            <RowBetween>
              <LoadingOpacityContainer $loading={loading}>
                {fiatValue && <FiatValue fiatValue={fiatValue} />}
              </LoadingOpacityContainer>
              {address ? (
                <RowFixed style={{ height: '17px' }}>
                  <BodyPrimary
                    onClick={onMax}
                    color={theme.palette.custom.textTertiary}
                    fontWeight={500}
                    fontSize={14}
                    style={{ display: 'inline', cursor: 'pointer' }}
                  >
                    {!hideBalance && currency && selectedCurrencyBalance ? (
                      renderBalance ? (
                        renderBalance(selectedCurrencyBalance)
                      ) : (
                        `Balance: ${selectedCurrencyBalance}`
                      )
                    ) : null}
                  </BodyPrimary>
                  {showMaxButton && selectedCurrencyBalance ? (
                      <StyledBalanceMax onClick={onMax}>
                        `MAX`
                      </StyledBalanceMax>
                  ) : null}
                </RowFixed>
              ) : (
                <span />
              )}
            </RowBetween>
          </FiatRow>
        )}
      </Container>
      {onCurrencySelect && (
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
      )}
    </InputPanel>
  )
}
