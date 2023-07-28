import SEO from "../src/components/SEO";
import { ChooseTokens } from "../src/components/ChooseTokens";
import { ArrowWrapper, SwapWrapper } from "../src/components/Swap/styleds";
import SwapHeader from "../src/components/Swap/SwapHeader";
import { styled } from "@mui/material";
import { opacify } from "../src/themes/utils";
import SwapCurrencyInputPanel from "../src/components/CurrencyInputPanel/SwapCurrencyInputPanel";
import { useCallback, useEffect, useState } from "react";
import { TokenType } from "../src/interfaces";
import { ArrowDown } from "react-feather";
import { AutoColumn } from "components/Column";
import { useSorobanReact } from "@soroban-react/core";
import { useTokens } from "hooks/useTokens";
import { useAllPairsFromTokens } from "hooks/usePairExist";
import { useTokenBalances } from "hooks/useBalances";
import { SwapButtonNew } from "components/Buttons/SwapButtonNew";
import { AllPairs } from "components/AllPairs";
import { useReservesBigNumber } from "hooks/useReserves";
import BigNumber from "bignumber.js";
import fromExactInputGetExpectedOutput from "functions/fromExactInputGetExpectedOutput";
import fromExactOutputGetExpectedInput from "functions/fromExactOutputGetExpectedInput";


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


export default function SwapPage() {
  const [inputAmount, setInputAmount] = useState<number>(0);
  const [outputAmount, setOutputAmount] = useState<number>(0);
  const [selectedToken, setSelectedToken] = useState<TokenType|null>(null)
  const [selectedTokenOutput, setSelectedTokenOutput] = useState<TokenType|null>(null)
  const [token0, setToken0] = useState<TokenType | null>(null);
  const [token1, setToken1] = useState<TokenType | null>(null);
  const sorobanContext = useSorobanReact();
  const tokens = useTokens(sorobanContext);
  console.log(tokens)
  const [allPairs, setAllPairs] = useState<any[]>([]);
  const [pairExist, setPairExist] = useState<boolean | undefined>(
    undefined,
  );
  const [pairAddress, setPairAddress] = useState<string | undefined>(
    undefined,
  );
  const reserves = useReservesBigNumber(pairAddress??"", sorobanContext);

  function getPairExists(token0: any, token1: any, allPairs: any) {
    return allPairs.some((pair: any) => {
      return (
        (pair.token_0 === token0 && pair.token_1 === token1) 
        ||(pair.token_0 === token1 && pair.token_1 === token0)
      );
    });
  }

  useEffect(() => {
    // Code to run when the component mounts or specific dependencies change
    setPairExist(getPairExists(selectedToken, selectedTokenOutput, allPairs));

    let selectedPair = allPairs.find((pair: any) => {
      return (
        (pair.token_0.token_address === selectedToken?.token_address &&
        pair.token_1.token_address === selectedTokenOutput?.token_address) 
        || (pair.token_1.token_address === selectedToken?.token_address &&
          pair.token_0.token_address === selectedTokenOutput?.token_address)
      );
    });
    if (selectedPair) setPairAddress(selectedPair.pair_address);

    console.log(
      "🚀 ~ file: ChooseTokens.tsx:88 ~ React.useEffect ~ getPairExists(inputToken, outputToken, allPairs):",
      getPairExists(selectedToken, selectedTokenOutput, allPairs),
    );
  }, [selectedToken, selectedTokenOutput, allPairs]);
  
  const handleInputSelect = useCallback(
    (inputCurrency: TokenType) => {
      console.log("inputCurrency", inputCurrency)
      if (inputCurrency.token_address === selectedTokenOutput?.token_address) setSelectedTokenOutput(null)
      setSelectedToken(inputCurrency)
      
    },
    [selectedTokenOutput]
  )
  
  const handleOutputSelect = useCallback(
    (inputCurrency: TokenType) => {
      console.log("outputCurrency", inputCurrency)
      if (inputCurrency.token_address === selectedToken?.token_address) setSelectedToken(null)
      setSelectedTokenOutput(inputCurrency)
    },
    [selectedToken]
  )

  const handleMaxInput = useCallback((maxValue: number) => {
    console.log("MAX INPUT")
    setInputAmount(maxValue)
  }, [])

  const handleInputTokenAmountChange = (value: number) => {
    setInputAmount(value);
    let output = fromExactInputGetExpectedOutput(
        pairAddress??"", 
        BigNumber(value).shiftedBy(7), 
        token0?.token_address === selectedToken?.token_address?reserves.reserve0:reserves.reserve1,
        token1?.token_address === selectedTokenOutput?.token_address?reserves.reserve1:reserves.reserve0,
        sorobanContext
        )
    setOutputAmount(BigNumber(output).decimalPlaces(0).shiftedBy(-7).toNumber())
  };

  const handleOutputTokenAmountChange = (value: number) => {
      let output = fromExactOutputGetExpectedInput(
        pairAddress??"", 
        BigNumber(value).shiftedBy(7), 
        token0?.token_address === selectedToken?.token_address?reserves.reserve0:reserves.reserve1,
        token1?.token_address === selectedTokenOutput?.token_address?reserves.reserve1:reserves.reserve0,
        sorobanContext
        )
      setInputAmount(BigNumber(output).decimalPlaces(0).shiftedBy(-7).toNumber())
  }

  const fiatValueInput = {data: 0, isLoading: false}
  const fiatValueOutput = {data: 0, isLoading: false}
  const showFiatValueInput = true
  const showFiatValueOutput = true
  const showMaxButton = true //This could be Boolean(maxInputAmount?.greaterThan(0) && !parsedAmounts[Field.INPUT]?.equalTo(maxInputAmount))

  const onSwitchTokens = () => {
    console.log(inputAmount, outputAmount)
    const token = selectedToken
    const amount = inputAmount
    setSelectedToken(selectedTokenOutput)
    setInputAmount(outputAmount)
    setSelectedTokenOutput(token)
    setOutputAmount(amount)
  }

  return (
    <>
      <SEO title="Swap - Soroswap" description="Soroswap Swap" />
      <SwapWrapper>
        {tokens.length > 0 && sorobanContext.address!=null && <AllPairs tokens={tokens} setPairs={setAllPairs} sorobanContext={sorobanContext} />}
        <SwapHeader />
        <div style={{ display: 'relative' }}>
          <SwapSection>
            <SwapCurrencyInputPanel
              // label={
              //   independentField === Field.OUTPUT && !showWrap ? <Trans>From (at most)</Trans> : <Trans>From</Trans>
              // }
              // disabled={disableTokenInputs}
              // value={formattedAmounts[Field.INPUT]}
              showMaxButton={showMaxButton}
              // onUserInput={handleTypeInput}
              onMax={handleMaxInput}
              fiatValue={showFiatValueInput ? fiatValueInput : undefined}
              onCurrencySelect={handleInputSelect}
              //otherCurrency={selectedTokenOutput}
              // showCommonBases
              // id={InterfaceSectionName.CURRENCY_INPUT_PANEL}
              // loading={independentField === Field.OUTPUT && routeIsSyncing}

              value={inputAmount}
              currency={selectedToken}
              onUserInput={(value: string) => handleInputTokenAmountChange(Number(value))}
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
                color={
                  "white"
                  //currencies[Field.INPUT] && currencies[Field.OUTPUT] ? theme.textPrimary : theme.textTertiary
                }
              />
            </ArrowContainer>
        </ArrowWrapper>
        </div>
      <AutoColumn gap="xs">
        <div>
          <OutputSwapSection>
              <SwapCurrencyInputPanel
                id={""} 
                value={outputAmount}
                //disabled={disableTokenInputs}
                onUserInput={(value: string) => handleOutputTokenAmountChange(Number(value))}
                //label={independentField === Field.INPUT && !showWrap ? <span>To (at least)</span> : <span>To</span>}
                showMaxButton={false}
                hideBalance={false}
                onMax={() => {}}
                fiatValue={showFiatValueOutput ? fiatValueOutput : undefined}
                //priceImpact={stablecoinPriceImpact}
                currency={selectedTokenOutput}
                onCurrencySelect={handleOutputSelect}
                //otherCurrency={selectedToken}
                //showCommonBases
                //id={InterfaceSectionName.CURRENCY_OUTPUT_PANEL}
                //loading={independentField === Field.INPUT && routeIsSyncing}
              />
          </OutputSwapSection>
          {pairExist && selectedTokenOutput && selectedToken && pairAddress && <SwapButtonNew
            sorobanContext={sorobanContext}
            pairAddress={pairAddress}
            inputTokenAmount={inputAmount}
            outputTokenAmount={outputAmount}
            setToken0={setToken0}
            setToken1={setToken1}
            isBuy={selectedToken?.token_address==token1?.token_address}
            tokens={tokens}
          />}
        </div>
      </AutoColumn>
      </SwapWrapper>
      {/* <ChooseTokens isLiquidity={false} /> */}
    </>
  );
}
