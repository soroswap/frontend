import { Modal, styled } from '@mui/material';
import { useSorobanReact } from '@soroban-react/core';
import { ButtonError, ButtonLight, ButtonPrimary } from 'components/Buttons/Button';
import { AutoColumn } from 'components/Column';
import ConfirmSwapModal from 'components/Swap/ConfirmSwapModal';
import SwapDetailsDropdown from 'components/Swap/SwapDetailsDropdown';
import { ButtonText } from 'components/Text';
import { AppContext } from 'contexts';
import { formatTokenAmount } from 'helpers/format';
import { relevantTokensType } from 'hooks';
import { useSwapCallback } from 'hooks/useSwapCallback';
import { ReactNode, useCallback, useContext, useMemo, useReducer, useState } from 'react';
import { ArrowDown } from 'react-feather';
import { InterfaceTrade, TradeState } from 'state/routing/types';
import { Field } from 'state/swap/actions';
import { useDerivedSwapInfo, useSwapActionHandlers } from 'state/swap/hooks';
import swapReducer, { SwapState, initialState as initialSwapState } from 'state/swap/reducer';
import SwapCurrencyInputPanel from '../src/components/CurrencyInputPanel/SwapCurrencyInputPanel';
import SEO from '../src/components/SEO';
import SwapHeader from '../src/components/Swap/SwapHeader';
import { ArrowWrapper, SwapWrapper } from '../src/components/Swap/styleds';
import { TokenType } from '../src/interfaces';
import { opacify } from '../src/themes/utils';
import { TransactionFailedContent } from 'components/TransactionConfirmationModal';

const SwapSection = styled('div')(({ theme }) => ({
  position: 'relative',
  backgroundColor: theme.palette.customBackground.module,
  borderRadius: 12,
  padding: 16,
  color: theme.palette.secondary.main,
  fontSize: 14,
  lineHeight: '20px',
  fontWeight: 500,
  '&:before': {
    boxSizing: 'border-box',
    backgroundSize: '100%',
    borderRadius: 'inherit',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    border: `1px solid ${theme.palette.customBackground.module}`,
  },
  '&:hover:before': {
    borderColor: opacify(8, theme.palette.secondary.main),
  },
  '&:focus-within:before': {
    borderColor: opacify(24, theme.palette.secondary.light),
  },
}));

const OutputSwapSection = styled(SwapSection)`
  border-bottom: ${({ theme }) => `1px solid ${theme.palette.customBackground.module}`};
  border-radius: 16px;
  border: 1px solid rgba(180, 239, 175, 0.2);
  background: ${({ theme }) => theme.palette.customBackground.outputBackground};
`;

export const ArrowContainer = styled('div')`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 100%;
`;

function getIsValidSwapQuote(
  trade: InterfaceTrade | undefined,
  tradeState: TradeState,
  swapInputError?: ReactNode,
): boolean {
  return Boolean(!swapInputError && trade && tradeState === TradeState.VALID);
}

export default function SwapPage({ className }: { className?: string }) {
  // const { chainId: connectedChainId } = useWeb3React()
  // const loadedUrlParams = useDefaultsFromURLSearch()

  // const location = useLocation()

  //TODO: Use pathname to get prefilled tokens
  // {
  //   [Field.INPUT]: { currencyId: loadedUrlParams?.[Field.INPUT]?.currencyId },
  //   [Field.OUTPUT]: { currencyId: loadedUrlParams?.[Field.OUTPUT]?.currencyId },
  // }

  const prefilledState = {
    [Field.INPUT]: { currencyId: 'CC5HHVS5EGDBF7XR5PKJSPXFGR6KZ7NU3GV4LHC62MII4FM3CXOOQOUV' }, //TODO: This is the hardcoded default token, should we get it from the api? maybe show the native token address from stellar (XLM)
    [Field.OUTPUT]: { currencyId: null },
  };

  return (
    <>
      <SEO title="Swap - Soroswap" description="Soroswap Swap" />
      <SwapComponent className={className} prefilledState={prefilledState} />
    </>
  );
}

export function SwapComponent({
  className,
  prefilledState = {},
  onCurrencyChange,
  disableTokenInputs = false,
}: {
  className?: string;
  prefilledState?: Partial<SwapState>;
  onCurrencyChange?: (selected: Pick<SwapState, Field.INPUT | Field.OUTPUT>) => void;
  disableTokenInputs?: boolean;
}) {
  const sorobanContext = useSorobanReact();
  const { address } = sorobanContext;

  const { ConnectWalletModal } = useContext(AppContext);
  const { isConnectWalletModalOpen, setConnectWalletModalOpen } = ConnectWalletModal;

  const [showPriceImpactModal, setShowPriceImpactModal] = useState<boolean>(false);
  const [txError, setTxError] = useState<boolean>(false);

  // modal and loading
  const [{ showConfirm, tradeToConfirm, swapError, swapResult }, setSwapState] = useState<{
    showConfirm: boolean;
    tradeToConfirm?: InterfaceTrade;
    swapError?: Error;
    swapResult?: any;
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    swapError: undefined,
    swapResult: undefined,
  });

  const [state, dispatch] = useReducer(swapReducer, { ...initialSwapState, ...prefilledState });
  const { typedValue, recipient, independentField } = state;

  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } =
    useSwapActionHandlers(dispatch);
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT;

  const swapInfo = useDerivedSwapInfo(state);
  const {
    trade: { state: tradeState, trade },
    allowedSlippage,
    // autoSlippage,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
  } = swapInfo;

  const parsedAmounts = useMemo(
    () => ({
      [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
      [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
    }),
    [independentField, parsedAmount, trade],
  );

  const decimals = useMemo(
    () => ({
      [Field.INPUT]:
        independentField === Field.INPUT
          ? trade?.outputAmount.currency.decimals ?? 7
          : trade?.inputAmount.currency.decimals ?? 7,
      [Field.OUTPUT]:
        independentField === Field.OUTPUT
          ? trade?.inputAmount.currency.decimals ?? 7
          : trade?.outputAmount.currency.decimals ?? 7,
    }),
    [independentField, trade],
  );

  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] &&
      currencies[Field.OUTPUT] &&
      parsedAmounts[independentField]?.value > 0,
  );

  const fiatValueInput = { data: 0, isLoading: true }; //useUSDPrice(parsedAmounts[Field.INPUT]) //TODO: create USDPrice function when available method to get this, for now it will be shown as loading
  const fiatValueOutput = { data: 0, isLoading: true }; //useUSDPrice(parsedAmounts[Field.OUTPUT])
  const showFiatValueInput = Boolean(parsedAmounts[Field.INPUT]);
  const showFiatValueOutput = Boolean(parsedAmounts[Field.OUTPUT]);

  const maxInputAmount: relevantTokensType | undefined = useMemo(
    () => currencyBalances[Field.INPUT],
    // () => maxAmountSpend(currencyBalances[Field.INPUT]), TODO: Create maxAmountSpend if is native token (XLM) should count for the fees and minimum xlm for the account to have
    [currencyBalances],
  );

  const handleInputSelect = useCallback(
    (inputCurrency: TokenType) => {
      onCurrencySelection(Field.INPUT, inputCurrency);
      onCurrencyChange?.({
        [Field.INPUT]: {
          currencyId: inputCurrency.address,
        },
        [Field.OUTPUT]: state[Field.OUTPUT],
      });
    },
    [onCurrencyChange, onCurrencySelection, state],
  );

  const handleOutputSelect = useCallback(
    (outputCurrency: TokenType) => {
      onCurrencySelection(Field.OUTPUT, outputCurrency);
      onCurrencyChange?.({
        [Field.INPUT]: state[Field.INPUT],
        [Field.OUTPUT]: {
          currencyId: outputCurrency.address,
        },
      });
    },
    [onCurrencyChange, onCurrencySelection, state],
  );

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value);
    },
    [onUserInput],
  );
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value);
    },
    [onUserInput],
  );

  const formattedAmounts = useMemo(
    () => ({
      [independentField]: typedValue,
      [dependentField]: formatTokenAmount(trade?.expectedAmount, decimals[independentField]),
    }),
    [decimals, dependentField, independentField, trade?.expectedAmount, typedValue],
  );

  const showMaxButton = Boolean(maxInputAmount?.balance ?? 0 > 0);

  const [routeNotFound, routeIsLoading, routeIsSyncing] = useMemo(
    () => [
      tradeState === TradeState.NO_ROUTE_FOUND,
      tradeState === TradeState.LOADING,
      tradeState === TradeState.LOADING && Boolean(trade),
    ],
    [trade, tradeState],
  );

  const handleContinueToReview = useCallback(() => {
    setSwapState({
      tradeToConfirm: trade,
      swapError: undefined,
      showConfirm: true,
      swapResult: undefined,
    });
  }, [trade]);

  const handleConfirmDismiss = useCallback(() => {
    setSwapState((currentState) => ({ ...currentState, showConfirm: false }));
    // If there was a swap, we want to clear the input
    if (swapResult) {
      onUserInput(Field.INPUT, '');
    }
  }, [onUserInput, swapResult]);

  const swapCallback = useSwapCallback(
    trade,
    // swapFiatValues,
    // allowedSlippage,
    // allowance.state === AllowanceState.ALLOWED ? allowance.permitSignature : undefined
  );

  const handleSwap = () => {
    if (!swapCallback) {
      return;
    }
    // if (stablecoinPriceImpact && !confirmPriceImpactWithoutFee(stablecoinPriceImpact)) {
    //   return
    // }
    setSwapState((currentState) => ({
      ...currentState,
      swapError: undefined,
      swapResult: undefined,
    }));
    swapCallback()
      .then((result) => {
        setSwapState((currentState) => ({
          ...currentState,
          swapError: undefined,
          swapResult: result,
        }));
      })
      .catch((error) => {
        setTxError(true);
        setSwapState((currentState) => ({
          ...currentState,
          showConfirm: false,
        }));
      });
  };

  const showDetailsDropdown = Boolean(
    userHasSpecifiedInputOutput && (trade || routeIsLoading || routeIsSyncing),
  );

  const inputCurrency = currencies[Field.INPUT] ?? undefined;
  const swapIsUnsupported = false; //useIsSwapUnsupported(currencies[Field.INPUT], currencies[Field.OUTPUT])
  const priceImpactSeverity = 2; //IF is < 2 it shows Swap anyway button in red
  const showPriceImpactWarning = false;

  return (
    <>
      <SwapWrapper>
        <SwapHeader />
        <Modal
          open={txError}
          onClose={() => setTxError(false)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <div>
            <TransactionFailedContent onDismiss={() => setTxError(false)} />
          </div>
        </Modal>
        {trade && showConfirm && (
          <ConfirmSwapModal
            trade={trade}
            inputCurrency={inputCurrency}
            originalTrade={tradeToConfirm}
            onAcceptChanges={() => null} //handleAcceptChanges}
            onCurrencySelection={onCurrencySelection}
            swapResult={swapResult}
            allowedSlippage={() => null} //allowedSlippage}
            onConfirm={handleSwap}
            allowance={() => null} //allowance}
            swapError={swapError}
            onDismiss={handleConfirmDismiss}
            swapQuoteReceivedDate={new Date()} //swapQuoteReceivedDate}
            fiatValueInput={{ data: 32, isLoading: false }} //fiatValueTradeInput}
            fiatValueOutput={{ data: 32, isLoading: false }} //fiatValueTradeOutput}
          />
        )}
        {/* {showPriceImpactModal && showPriceImpactWarning && (
          <PriceImpactModal
            priceImpact={largerPriceImpact}
            onDismiss={() => setShowPriceImpactModal(false)}
            onContinue={() => {
              setShowPriceImpactModal(false)
              handleContinueToReview()
            }}
          />
        )} */}
        <div style={{ display: 'relative' }}>
          <SwapSection>
            <SwapCurrencyInputPanel
              label={
                independentField === Field.OUTPUT ? <span>From (at most)</span> : <span>From</span>
              }
              // disabled={disableTokenInputs}
              value={formattedAmounts[Field.INPUT]}
              showMaxButton={showMaxButton}
              onUserInput={handleTypeInput}
              onMax={(maxBalance) => handleTypeInput(maxBalance.toString())}
              fiatValue={showFiatValueInput ? fiatValueInput : undefined}
              onCurrencySelect={handleInputSelect}
              otherCurrency={currencies[Field.OUTPUT]}
              // showCommonBases
              // id={InterfaceSectionName.CURRENCY_INPUT_PANEL}
              loading={independentField === Field.OUTPUT && routeIsSyncing}
              currency={currencies[Field.INPUT] ?? null}
              id={'swap-input'}
            />
          </SwapSection>
          <ArrowWrapper clickable={true}>
            <ArrowContainer
              data-testid="swap-currency-button"
              onClick={() => {
                !disableTokenInputs && onSwitchTokens();
              }}
            >
              <ArrowDown
                size="16"
                color={'#000000'} //currencies[Field.INPUT] && currencies[Field.OUTPUT] ? theme.palette.custom.textTertiary}
              />
            </ArrowContainer>
          </ArrowWrapper>
        </div>
        <AutoColumn gap="14px">
          <div>
            <OutputSwapSection>
              <SwapCurrencyInputPanel
                id={'swap-output'}
                value={formattedAmounts[Field.OUTPUT]}
                //disabled={disableTokenInputs}
                onUserInput={handleTypeOutput}
                // onUserInput={(value: string) => handleOutputTokenAmountChange(Number(value))}
                label={
                  independentField === Field.INPUT ? <span>To (at least)</span> : <span>To</span>
                }
                showMaxButton={false}
                hideBalance={false}
                onMax={() => {}}
                fiatValue={showFiatValueOutput ? fiatValueOutput : undefined}
                //priceImpact={stablecoinPriceImpact}
                currency={currencies[Field.OUTPUT] ?? null}
                onCurrencySelect={handleOutputSelect}
                otherCurrency={currencies[Field.INPUT]}
                //showCommonBases
                //id={InterfaceSectionName.CURRENCY_OUTPUT_PANEL}
                loading={independentField === Field.INPUT && routeIsSyncing}
              />
            </OutputSwapSection>
          </div>
          {showDetailsDropdown && (
            <SwapDetailsDropdown
              trade={trade}
              syncing={routeIsSyncing}
              loading={routeIsLoading}
              allowedSlippage={allowedSlippage}
            />
          )}
          {/* {showPriceImpactWarning && <PriceImpactWarning priceImpact={largerPriceImpact} />} */}
          <div>
            {swapIsUnsupported ? (
              <ButtonPrimary disabled={true}>
                <ButtonText mb="4px">Unsupported Asset</ButtonText>
              </ButtonPrimary>
            ) : !address ? (
              <ButtonLight onClick={() => setConnectWalletModalOpen(true)}>
                Connect Wallet
              </ButtonLight>
            ) : routeNotFound ? (
              <ButtonError disabled={true}>
                <ButtonText>Route not found</ButtonText>
              </ButtonError>
            ) : (
              <ButtonError
                onClick={() =>
                  showPriceImpactWarning ? setShowPriceImpactModal(true) : handleContinueToReview()
                }
                id="swap-button"
                data-testid="swap-button"
                disabled={swapInputError ? true : false}
                error={!swapInputError && priceImpactSeverity > 2} //&& allowance.state === AllowanceState.ALLOWED}
              >
                <ButtonText fontSize={20} fontWeight={600}>
                  {swapInputError ? (
                    swapInputError
                  ) : routeIsSyncing || routeIsLoading ? (
                    <>Swap</>
                  ) : priceImpactSeverity > 2 ? (
                    <>Swap Anyway</>
                  ) : (
                    <>Swap</>
                  )}
                </ButtonText>
              </ButtonError>
            )}
          </div>
        </AutoColumn>
      </SwapWrapper>
    </>
  );
}
