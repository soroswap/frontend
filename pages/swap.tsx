import SEO from "../src/components/SEO";
import { ChooseTokens } from "../src/components/ChooseTokens";
import { ArrowWrapper, SwapWrapper } from "../src/components/Swap/styleds";
import SwapHeader from "../src/components/Swap/SwapHeader";
import { styled, useTheme } from "@mui/material";
import { opacify } from "../src/themes/utils";
import SwapCurrencyInputPanel from "../src/components/CurrencyInputPanel/SwapCurrencyInputPanel";
import { ReactNode, useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { TokenType } from "../src/interfaces";
import { ArrowDown } from "react-feather";
import { AutoColumn } from "components/Column";
import { useSorobanReact } from "@soroban-react/core";
import { useTokens } from "hooks/useTokens";
import { useAllPairsFromTokens, usePairExist } from "hooks/usePairExist";
import { useTokenBalances } from "hooks/useBalances";
import { SwapButtonNew } from "components/Buttons/SwapButtonNew";
import { AllPairs } from "components/AllPairs";
import { useReservesBigNumber } from "hooks/useReserves";
import BigNumber from "bignumber.js";
import fromExactInputGetExpectedOutput from "functions/fromExactInputGetExpectedOutput";
import fromExactOutputGetExpectedInput from "functions/fromExactOutputGetExpectedInput";
import { usePairContractAddress } from "hooks/usePairContractAddress";
import { ButtonError, ButtonLight, ButtonPrimary } from "components/Buttons/Button";
import { GrayCard } from "components/Card";
import { ButtonText, ButtonTextSecondary } from "components/Text";
import { useDerivedSwapInfo, useSwapActionHandlers } from "state/swap/hooks";
import swapReducer, { initialState as initialSwapState, SwapState } from 'state/swap/reducer'
import { Field } from "state/swap/actions";
import { InterfaceTrade, TradeState } from "state/routing/types";


const SwapSection = styled('div')(({ theme }) => ({
  position: "relative",
  backgroundColor: theme.palette.customBackground.module,
  borderRadius: 12,
  padding: 16,
  color: theme.palette.secondary.main,
  fontSize: 14,
  lineHeight: "20px",
  fontWeight: 500,
  "&:before": {
    boxSizing: "border-box",
    backgroundSize: "100%",
    borderRadius: "inherit",
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    border: `1px solid ${theme.palette.customBackground.module}`,
  },
  "&:hover:before": {
    borderColor: opacify(8, theme.palette.secondary.main),
  },
  "&:focus-within:before": {
    borderColor:  opacify(24, theme.palette.secondary.light),
  }
}));

const OutputSwapSection = styled(SwapSection)`
  border-bottom: ${({ theme }) => `1px solid ${theme.palette.customBackground.module}`};
`

export const ArrowContainer = styled('div')`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 100%;
`

function getIsValidSwapQuote(
  trade: InterfaceTrade | undefined,
  tradeState: TradeState,
  swapInputError?: ReactNode
): boolean {
  return Boolean(!swapInputError && trade && tradeState === TradeState.VALID)
}

export default function SwapPage() {
  const theme = useTheme()
  const [inputAmount, setInputAmount] = useState<number>(0);
  const [outputAmount, setOutputAmount] = useState<number>(0);
  const [selectedToken, setSelectedToken] = useState<TokenType|null>(null)
  const [selectedTokenOutput, setSelectedTokenOutput] = useState<TokenType|null>(null)
  const [token0, setToken0] = useState<TokenType | null>(null);
  const [token1, setToken1] = useState<TokenType | null>(null);
  const sorobanContext = useSorobanReact();
  const { address, connect } = sorobanContext
  const tokens = useTokens(sorobanContext);
  //const [allPairs, setAllPairs] = useState<any[]>([]);
  //const [pairExist, setPairExist] = useState<boolean>(false);
  //const [pairAddress, setPairAddress] = useState<string | null>(null);
  const pairExist = usePairExist(
    selectedToken?.token_address??null,
    selectedTokenOutput?.token_address??null,
    sorobanContext,
  );
  const pairAddress = usePairContractAddress(
    selectedToken?.token_address??null,
    selectedTokenOutput?.token_address??null,
    sorobanContext,
  );
  const reserves = useReservesBigNumber(pairAddress??"", sorobanContext);

  const [showPriceImpactModal, setShowPriceImpactModal] = useState<boolean>(false)

  // function getPairExists(token0: any, token1: any, allPairs: any) {
  //   return allPairs.some((pair: any) => {
  //     return (
  //       (pair.token_0 === token0 && pair.token_1 === token1)
  //       ||(pair.token_0 === token1 && pair.token_1 === token0)
  //     );
  //   });
  // }

  // useEffect(() => {
  //   // Code to run when the component mounts or specific dependencies change
  //   //setPairExist(getPairExists(selectedToken, selectedTokenOutput, allPairs));

  //   let selectedPair = allPairs.find((pair: any) => {
  //     return (
  //       (pair.token_0.token_address === selectedToken?.token_address &&
  //       pair.token_1.token_address === selectedTokenOutput?.token_address)
  //       || (pair.token_1.token_address === selectedToken?.token_address &&
  //         pair.token_0.token_address === selectedTokenOutput?.token_address)
  //     );
  //   });
  //   if (selectedPair) setPairAddress(selectedPair.pair_address);

  //   console.log(
  //     "🚀 ~ file: ChooseTokens.tsx:88 ~ React.useEffect ~ getPairExists(inputToken, outputToken, allPairs):",
  //     getPairExists(selectedToken, selectedTokenOutput, allPairs),
  //   );
  // }, [selectedToken, selectedTokenOutput, allPairs]);
  
  // const handleInputSelect = useCallback(
  //   (inputCurrency: TokenType) => {
  //     console.log("inputCurrency", inputCurrency)
  //     if (inputCurrency.token_address === selectedTokenOutput?.token_address) setSelectedTokenOutput(null)
  //     setSelectedToken(inputCurrency)
      
  //   },
  //   [selectedTokenOutput]
  // )
  const prefilledState={
    [Field.INPUT]: { currencyId: "CDO5AFKO3CNWM2CDEZAMPJXQKJ5NLYBHAGRPSINQUZEFQJTE4HNKD243" },
    [Field.OUTPUT]: { currencyId: null },
  }
  
  const [state, dispatch] = useReducer(swapReducer, { ...initialSwapState, ...prefilledState })
  const { typedValue, recipient, independentField } = state

  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers(dispatch)
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const handleInputSelect = useCallback(
    (inputCurrency: TokenType) => {
      onCurrencySelection(Field.INPUT, inputCurrency)
      setSelectedToken(inputCurrency)
    },
    [ onCurrencySelection]
  )
  
  const handleOutputSelect = useCallback(
    (outputCurrency: TokenType) => {
      onCurrencySelection(Field.OUTPUT, outputCurrency)
      setSelectedTokenOutput(outputCurrency)
    },
    [onCurrencySelection]
  )

  const handleMaxInput = useCallback((maxValue: number) => {
    console.log("MAX INPUT")
    setInputAmount(maxValue)
  }, [])

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput]
  )
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput]
  )

  const formattedAmounts = useMemo(
    () => ({
      [independentField]: typedValue,
      [dependentField]: 0//formatCurrencyAmount(parsedAmounts[dependentField], NumberType.SwapTradeAmount, ''),
    }),
    [dependentField, independentField, typedValue]
  )

  const handleContinueToReview = useCallback(() => {
    console.log("on continue")
    // setSwapState({
    //   tradeToConfirm: trade,
    //   swapError: undefined,
    //   showConfirm: true,
    //   swapResult: undefined,
    // })
  }, [])//trade])

  const fiatValueInput = {data: 0, isLoading: false}
  const fiatValueOutput = {data: 0, isLoading: false}
  const showFiatValueInput = false //TODO: Change this
  const showFiatValueOutput = false //TODO: Change this
  const showMaxButton = true //This could be Boolean(maxInputAmount?.greaterThan(0) && !parsedAmounts[Field.INPUT]?.equalTo(maxInputAmount))

  const swapInfo = useDerivedSwapInfo(state)
  const {
    trade: { state: tradeState, trade },
    // allowedSlippage,
    // autoSlippage,
    // currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
  } = swapInfo
  // console.log("🚀 « inputError:", swapInputError)
  console.log("🚀 « trade:", trade)

  const [routeNotFound, routeIsLoading, routeIsSyncing] = useMemo(
    () => [
      tradeState === TradeState.NO_ROUTE_FOUND,
      tradeState === TradeState.LOADING,
      tradeState === TradeState.LOADING && Boolean(trade),
    ],
    [trade, tradeState]
  )

  const swapIsUnsupported = false//useIsSwapUnsupported(currencies[Field.INPUT], currencies[Field.OUTPUT])
  const priceImpactSeverity = 2 //IF is < 2 it shows Swap anyway button in red
  const showPriceImpactWarning = false
  return (
    <>
      <SEO title="Swap - Soroswap" description="Soroswap Swap" />
      <SwapWrapper>
        {
        //selectedToken!==null && selectedTokenOutput!==null && sorobanContext.address!==null &&
        // <AllPairs 
        //   selectedToken={selectedToken}
        //   selectedOutputToken={selectedTokenOutput}
        //   setPairAddress={setPairAddress}
        //   setPairExist={setPairExist}
        //   sorobanContext={sorobanContext} 
        //   />
        }
        <SwapHeader />
        {/* {trade && showConfirm && (
          <ConfirmSwapModal
            trade={trade}
            inputCurrency={inputCurrency}
            originalTrade={tradeToConfirm}
            onAcceptChanges={handleAcceptChanges}
            onCurrencySelection={onCurrencySelection}
            swapResult={swapResult}
            allowedSlippage={allowedSlippage}
            onConfirm={handleSwap}
            allowance={allowance}
            swapError={swapError}
            onDismiss={handleConfirmDismiss}
            swapQuoteReceivedDate={swapQuoteReceivedDate}
            fiatValueInput={fiatValueTradeInput}
            fiatValueOutput={fiatValueTradeOutput}
          />
        )}
        {showPriceImpactModal && showPriceImpactWarning && (
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
              onMax={handleMaxInput}
              fiatValue={showFiatValueInput ? fiatValueInput : undefined}
              onCurrencySelect={handleInputSelect}
              otherCurrency={currencies[Field.OUTPUT]}
              // showCommonBases
              // id={InterfaceSectionName.CURRENCY_INPUT_PANEL}
              loading={independentField === Field.OUTPUT && routeIsSyncing}
              currency={currencies[Field.INPUT] ?? null}
              id={""} />
          </SwapSection>
          <ArrowWrapper clickable={true}>
            <ArrowContainer
              data-testid="swap-currency-button"
              onClick={() => {
                //!disableTokenInputs &&
                onSwitchTokens()
              }}
            >
              <ArrowDown
                size="16"
                color={selectedToken && selectedTokenOutput ? theme.palette.primary.main : theme.palette.custom.textTertiary }//currencies[Field.INPUT] && currencies[Field.OUTPUT] ? theme.palette.custom.textTertiary}
              />
            </ArrowContainer>
          </ArrowWrapper>
        </div>
        <AutoColumn gap="4px">
          <div>
            <OutputSwapSection>
              <SwapCurrencyInputPanel
                id={""} 
                value={formattedAmounts[Field.OUTPUT]}
                //disabled={disableTokenInputs}
                onUserInput={handleTypeOutput}
                // onUserInput={(value: string) => handleOutputTokenAmountChange(Number(value))}
                label={independentField === Field.INPUT ? <span>To (at least)</span> : <span>To</span>}
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
          {/* {showDetailsDropdown && (
            <SwapDetailsDropdown
              trade={trade}
              syncing={routeIsSyncing}
              loading={routeIsLoading}
              allowedSlippage={allowedSlippage}
            />
          )} */}
          {/* {showPriceImpactWarning && <PriceImpactWarning priceImpact={largerPriceImpact} />} */}
          <div>
            {swapIsUnsupported ? (
              <ButtonPrimary disabled={true}>
                <ButtonText mb="4px">
                  Unsupported Asset
                </ButtonText>
              </ButtonPrimary>
            ) : !address ? (
              <ButtonLight onClick={() => connect()} fontWeight={600}>
                Connect Wallet
              </ButtonLight>
            ) : routeNotFound ? (
              <GrayCard style={{ textAlign: 'center' }}>
                <ButtonTextSecondary mb="4px">
                  Insufficient liquidity for this trade.
                </ButtonTextSecondary>
              </GrayCard>
            ) : (
              <ButtonError
                onClick={() => showPriceImpactWarning ? setShowPriceImpactModal(true) : handleContinueToReview()}
                id="swap-button"
                data-testid="swap-button"
                disabled={swapInputError}
                error={!swapInputError && priceImpactSeverity > 2}//&& allowance.state === AllowanceState.ALLOWED}
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
          {
          //Button to test logic of swap, replace after for the correct button
          pairAddress!==undefined&&selectedToken!==null&&selectedTokenOutput!==null?
          <SwapButtonNew
            sorobanContext={sorobanContext}
            pairAddress={pairAddress}
            inputTokenAmount={inputAmount}
            outputTokenAmount={outputAmount}
            setToken0={setToken0}
            setToken1={setToken1}
            tokens={tokens}
            isBuy={selectedToken?.token_address==token1?.token_address}
          />:null}
        </AutoColumn>
      </SwapWrapper>
    </>
  );
}
