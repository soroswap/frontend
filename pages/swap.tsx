import SEO from "../src/components/SEO";
import { ChooseTokens } from "../src/components/ChooseTokens";
import { SwapWrapper } from "../src/components/Swap/styleds";
import SwapHeader from "../src/components/Swap/SwapHeader";
import { styled } from "@mui/material";
import { opacify } from "../src/themes/utils";
import SwapCurrencyInputPanel from "../src/components/CurrencyInputPanel/SwapCurrencyInputPanel";
import { useCallback, useEffect, useState } from "react";
import { TokenType } from "../src/interfaces";

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

export default function SwapPage() {
  const [inputAmount, setInputAmount] = useState();
  const [selectedToken, setSelectedToken] = useState({
    "token_id": "b00817cae188c95611f69ab7ec194c09ca5e5a2561572179da28910840e835b6",
    "token_address": "CCYAQF6K4GEMSVQR62NLP3AZJQE4UXS2EVQVOILZ3IUJCCCA5A23NDDB",
    "token_name": "AAAA",
    "token_symbol": "AAAA"
  })

  const handleInputSelect = useCallback(
    (inputCurrency: TokenType) => {
      console.log("inputCurrency", inputCurrency)
      setSelectedToken(inputCurrency)
    },
    []
  )

  const handleMaxInput = useCallback(() => {
    console.log("MAX INPUT")
  }, [])

  const fiatValueInput = {data: 0, isLoading: false}
  const fiatValueOutput = {data: 0, isLoading: false}
  const showFiatValueInput = true
  const showFiatValueOutput = true
  const showMaxButton = true //This could be Boolean(maxInputAmount?.greaterThan(0) && !parsedAmounts[Field.INPUT]?.equalTo(maxInputAmount))

  return (
    <>
      <SEO title="Swap - Soroswap" description="Soroswap Swap" />
      <SwapWrapper>
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
              // otherCurrency={currencies[Field.OUTPUT]}
              // showCommonBases
              // id={InterfaceSectionName.CURRENCY_INPUT_PANEL}
              // loading={independentField === Field.OUTPUT && routeIsSyncing}

              value={inputAmount}
              currency={selectedToken}
              onUserInput={() => setInputAmount}
              id={""} />
          </SwapSection>
        </div>
      </SwapWrapper>
      {/* <ChooseTokens isLiquidity={false} /> */}
    </>
  );
}
