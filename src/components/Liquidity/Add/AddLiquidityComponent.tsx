import { styled, useTheme } from "@mui/material";
import { useSorobanReact } from "@soroban-react/core";
import BigNumber from "bignumber.js";
import { ButtonError, ButtonLight } from "components/Buttons/Button";
import { DarkGrayCard } from "components/Card";
import { AutoColumn, ColumnCenter } from "components/Column";
import CurrencyInputPanel from "components/CurrencyInputPanel";
import { BodySmall, ButtonText } from "components/Text";
import TransactionConfirmationModal, { ConfirmationModalContent } from "components/TransactionConfirmationModal";
import { AppContext } from "contexts";
import { getCurrentTimePlusOneHour } from "functions/getCurrentTimePlusOneHour";
import { formatTokenAmount } from "helpers/format";
import { bigNumberToI128, bigNumberToU64 } from "helpers/utils";
import { useToken } from "hooks";
import { RouterMethod, useRouterCallback } from "hooks/useRouterCallback";
import { TokenType } from "interfaces";
import { useRouter } from "next/router";
import { useCallback, useContext, useMemo, useState } from "react";
import { Plus } from "react-feather";
import * as SorobanClient from 'soroban-client';
import { Field } from "state/mint/actions";
import { useDerivedMintInfo, useMintActionHandlers, useMintState } from "state/mint/hooks";
import { opacify } from "themes/utils";
import { AddRemoveTabs } from "../AddRemoveHeader";
import AddModalFooter from "./AddModalFooter";
import AddModalHeader from "./AddModalHeader";

export const PageWrapper = styled('main')`
  position: relative;
  background: ${({ theme }) => `linear-gradient(${theme.palette.customBackground.bg2}, ${theme.palette.customBackground.bg2}) padding-box,
              linear-gradient(150deg, rgba(136,102,221,1) 0%, rgba(${theme.palette.mode == 'dark' ? "33,29,50,1" : "255,255,255,1"}) 35%, rgba(${theme.palette.mode == 'dark' ? "33,29,50,1" : "255,255,255,1"}) 65%, rgba(136,102,221,1) 100%) border-box`};
  border: 1px solid transparent;
  border-radius: 16px;
  padding: 32px;
  padding-top: 12px;
  box-shadow: 0px 40px 120px 0px #f00bdd29;
  transition: transform 250ms ease;
  max-width: 480px;
  width: 100%;
  &:hover: {
    border: 1px solid ${({ theme }) => opacify(24, theme.palette.secondary.main,)},
  }

  @media (max-width: ${({theme}) => theme.breakpoints.values.md}px) {
    padding: 16px;
  }
`

type TokensType = [string, string];

export default function AddLiquidityComponent() {

  const theme = useTheme()

  const {ConnectWalletModal} = useContext(AppContext)
  const { isConnectWalletModalOpen, setConnectWalletModalOpen } = ConnectWalletModal;

  const router = useRouter();
  const { tokens } = router.query as { tokens: TokensType };

  const [currencyIdA, currencyIdB] = Array.isArray(tokens) ? tokens : ['', ''];

  const sorobanContext = useSorobanReact()

  // const [currencyA, setCurrencyA] = useState<TokenType | undefined>()
  // const [currencyB, setCurrencyB] = useState<TokenType | undefined>()

  const [amountOfLpTokensToReceive, setAmountOfLpTokensToReceive] = useState<string>("")
  // const [amountOfLpTokensToReceiveBN, setAmountOfLpTokensToReceiveBN] = useState<BigNumber>()
  const [totalShares, setTotalShares] = useState<string>("")

  // const navigate = useCallback((destination: any) => { router.push(destination) }, [router]
  // )
  // // console.log("pages/add, currencyA, currencyB", currencyA, currencyB)

  const baseCurrency = useToken(currencyIdA)
  const currencyB = useToken(currencyIdB)

  const derivedMintInfo = useDerivedMintInfo(
    baseCurrency ?? undefined,
    currencyB ?? undefined)
  const { dependentField, currencies, parsedAmounts, noLiquidity, pairAddress } = derivedMintInfo
  // console.log("pages/add derivedMintInfo:", derivedMintInfo)
  // const isCreate = false

  const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noLiquidity)

  const { independentField, typedValue, otherTypedValue } = useMintState()

  // // console.log("src/components/Add/index.tsx: independentField:", independentField)
  const formattedAmounts = useMemo(() => {
    return {
      [independentField]: typedValue,
      // [dependentField]: noLiquidity ? otherTypedValue : parsedAmounts[dependentField]?.value ?? '',
      [dependentField]: noLiquidity ? otherTypedValue : formatTokenAmount(parsedAmounts[dependentField]?.value ?? ''),
      // [dependentField]: otherTypedValue
    }
  }, [dependentField, independentField, noLiquidity, otherTypedValue, parsedAmounts, typedValue])

  // // console.log("src/components/Add/index.tsx: formattedAmounts:", formattedAmounts)
  // // console.log("src/components/Add/index.tsx: formatTokenAmount(formattedAmounts[dependentField]):", formatTokenAmount(formattedAmounts[dependentField]))
  // // console.log("src/components/Add/index.tsx: parsedAmounts:", parsedAmounts)
  // // console.log("src/components/Add/index.tsx: noLiquidity:", noLiquidity)

  // // Modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm
  const [txHash, setTxHash] = useState<string | undefined>(undefined) // clicked confirm

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onFieldAInput('')
    }
    setTxHash('')
    router.push('/liquidity')
  }, [onFieldAInput, router, txHash])

  const routerCallback = useRouterCallback()

  const provideLiquidity = useCallback(() => {
    setAttemptingTxn(true)
    // TODO: check that amount0 corresponds to token0?
    //TODO: Check all of this, is working weird but using the router, withdraw is not working

  //   fn add_liquidity(
  //     e: Env,
  //     token_a: Address,
  //     token_b: Address,
  //     amount_a_desired: i128,
  //     amount_b_desired: i128,
  //     amount_a_min: i128,
  //     amount_b_min: i128,
  //     to: Address,
  //     deadline: u64,
    // ) -> (i128, i128, i128);


    const amount0BN = new BigNumber(formattedAmounts[independentField])
    const amount1BN = new BigNumber(formattedAmounts[dependentField])

    const desiredAScVal = bigNumberToI128(amount0BN.shiftedBy(7));
    const desiredBScVal = bigNumberToI128(amount1BN.shiftedBy(7));

    const minAScVal = bigNumberToI128(amount0BN.multipliedBy(0.9).decimalPlaces(0).shiftedBy(7));
    const minBScVal = bigNumberToI128(amount1BN.multipliedBy(0.9).decimalPlaces(0).shiftedBy(7));

    const args = [
      new SorobanClient.Address(baseCurrency?.address ?? "").toScVal(),
      new SorobanClient.Address(currencyB?.address ?? "").toScVal(),
      desiredAScVal,
      desiredBScVal,
      minAScVal,
      minBScVal,
      new SorobanClient.Address(sorobanContext.address ?? "").toScVal(),
      bigNumberToU64(BigNumber(getCurrentTimePlusOneHour()))
    ]
    
    routerCallback(
      RouterMethod.ADD_LIQUIDITY,
      args,
      true
    ).then((result) => {
      console.log("🚀 « result:", result)
      setAttemptingTxn(false)
      setTxHash(result as string)
    }).catch((error) => {
      console.log("🚀 « error:", error)
      setAttemptingTxn(false)      
    })
    
  }, [formattedAmounts, independentField, dependentField, baseCurrency?.address, currencyB?.address, sorobanContext.address, routerCallback])

  const handleCurrencyASelect = useCallback(
    (currencyA: TokenType) => {
      const newCurrencyIdA = currencyA.address
      if (currencyIdB === undefined) {
        router.push(`/liquidity/add/${newCurrencyIdA}`)
      } else {
        router.push(`/liquidity/add/${newCurrencyIdA}/${currencyIdB}`)
      }
    },
    [currencyIdB, router]
  )

  const handleCurrencyBSelect = useCallback(
    (currencyB: TokenType) => {
      const newCurrencyIdB = currencyB.address
      if (currencyIdA === undefined) {
        router.push(`/liquidity/add/${newCurrencyIdB}`)
      } else {
        router.push(`/liquidity/add/${currencyIdA}/${newCurrencyIdB}`)
      }
    },
    [currencyIdA, router]
  )

  // const handleCurrencyBSelect = useCallback(
  //   (currencyBNew: Currency) => {
  //     const [idB, idA] = handleCurrencySelect(currencyBNew, currencyIdA)
  //     if (idA === undefined) {
  //       navigate(`/add/${idB}`)
  //     } else {
  //       navigate(`/add/${idA}/${idB}`)
  //     }
  //   },
  //   [handleCurrencySelect, currencyIdA, navigate]
  // )

  // // update currencies
  // useEffect(() => {
  //   if (currencyIdA || currencyIdA !== '') {
  //     getToken(sorobanContext, currencyIdA).then((token) => {
  //       // console.log("src/components/Add/index: get Token A called: ", token)
  //       setCurrencyA(token)
  //     })
  //   }
  //   if (currencyIdB || currencyIdB !== '') {
  //     getToken(sorobanContext, currencyIdB).then((token) => {
  //       // console.log("src/components/Add/index: get Token B called: ", token)
  //       setCurrencyB(token)
  //     })
  //   }

  // }, [currencyIdA, currencyIdB, sorobanContext])

  // // Get the LP token amount to receive
  // useEffect(() => {
  //   if (!pairAddress || !currencyA || !currencyB) return
  //   // LP tokens
  //   // We need to get which one is amount0
  //   reservesBNWithTokens(pairAddress, sorobanContext).then((reserves) => {
  //     if (!reserves.reserve0 || !reserves.reserve1 || !formattedAmounts.CURRENCY_A || !formattedAmounts.CURRENCY_B) return

  //     let amount0, amount1
  //     // Check if currencyA corresponds to token0 or token1
  //     if (currencyA.address === reserves.token0) {
  //       amount0 = new BigNumber(formattedAmounts.CURRENCY_A)
  //       amount1 = new BigNumber(formattedAmounts.CURRENCY_B)
  //     } else if (currencyA.address === reserves.token1) {
  //       amount0 = new BigNumber(formattedAmounts.CURRENCY_B)
  //       amount1 = new BigNumber(formattedAmounts.CURRENCY_A)
  //     } else {
  //       console.log("currencyA does not correspond to either token0 or token1");
  //       return
  //     }
  //     getLpTokensAmount(
  //       amount0,
  //       reserves.reserve0,
  //       amount1,
  //       reserves.reserve1,
  //       pairAddress,
  //       sorobanContext
  //     ).then((lpTokens) => {
  //       if (lpTokens === undefined) console.log("src/components/Add/index.tsx: lpTokens are undefined")
  //       else {
  //         setAmountOfLpTokensToReceive(lpTokens.toString())
  //         setAmountOfLpTokensToReceiveBN(lpTokens)
  //       }
  //     })
  //   })
  // }, [currencyA, currencyB, formattedAmounts, pairAddress, sorobanContext])

  // // Get share of Pool
  // useEffect(() => {
  //   if (!pairAddress || !amountOfLpTokensToReceiveBN) return
  //   getTotalShares(pairAddress, sorobanContext).then((totalSharesResult) => {
  //     if (typeof totalSharesResult === 'number' || typeof totalSharesResult === 'string') {
  //       const totalSharesBN = new BigNumber(totalSharesResult)
  //       const share = amountOfLpTokensToReceiveBN.multipliedBy(100).dividedBy(amountOfLpTokensToReceiveBN.plus(totalSharesBN.shiftedBy(-7)))
  //       setTotalShares(share.toString())
  //     } else {
  //       console.error("Invalid type for totalSharesResult", totalSharesResult);
  //     }
  //   })
  // }, [amountOfLpTokensToReceiveBN, pairAddress, sorobanContext])
  
  const pendingText = (
    <BodySmall>Adding {formatTokenAmount(parsedAmounts[Field.CURRENCY_A]?.value ?? "")} {baseCurrency?.symbol} and
    {' '}{formatTokenAmount(parsedAmounts[Field.CURRENCY_B]?.value ?? "")} {currencyB?.symbol}</BodySmall>
)

  return (
    <>
      <PageWrapper>
        <AddRemoveTabs creating={false} adding={true} autoSlippage={"DEFAULT_ADD_V2_SLIPPAGE_TOLERANCE"} />
        <TransactionConfirmationModal
          isOpen={showConfirm}
          onDismiss={handleDismissConfirmation}
          attemptingTxn={attemptingTxn}
          reviewContent={() => (
            <ConfirmationModalContent
              title={true ? <>You are creating a pool</> : <>You will receive</>}
              onDismiss={handleDismissConfirmation}
              topContent={() => AddModalHeader({ currencies, amountOfLpTokensToReceive })}
              bottomContent={() => AddModalFooter({ currencies, formattedAmounts, totalShares, onConfirm: provideLiquidity })}
            />
          )}
          pendingText={pendingText}
          hash={txHash}
        />
        <AutoColumn gap="20px">
          <DarkGrayCard>
            <BodySmall color={theme.palette.custom.textTertiary}>
              <b>Tip: </b>When you add liquidity, you will receive LP tokens representing your position.
              <span style={{marginTop: 15}}>These tokens automatically earn fees proportional to your share of the pool.Can be redeemed at any time</span>
            </BodySmall>
          </DarkGrayCard>          
          {/* //Input Token */}
          <CurrencyInputPanel
            id="add-liquidity-input-tokena"
            value={formattedAmounts[Field.CURRENCY_A]}
            onUserInput={onFieldAInput}
            onMax={() => { }}//TODO: Add max button functionality, currently disabled
            onCurrencySelect={handleCurrencyASelect}
            showMaxButton={false}
            currency={currencies[Field.CURRENCY_A] ?? null}
            transparent
            // showCommonBases
          />
          <ColumnCenter>
            <Plus size="16" color={theme.palette.secondary.main} />
          </ColumnCenter>
          {/* //Output Token */}
          <CurrencyInputPanel
            id="add-liquidity-input-tokenb"
            value={formattedAmounts[Field.CURRENCY_B]}
            onUserInput={onFieldBInput}
            onMax={() => { }}
            onCurrencySelect={handleCurrencyBSelect}
            // onMax={() => {
            //   onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '')
            // }}
            showMaxButton={false}
            currency={currencies[Field.CURRENCY_B] ?? null}
            // showCommonBases
          />
          {!sorobanContext.address ? (

            <ButtonLight onClick={() => setConnectWalletModalOpen(true)}>
              <>Connect Wallet</>
            </ButtonLight>
          ) : (
            <AutoColumn gap="md">
              <ButtonError
                onClick={() => {
                  setShowConfirm(true)
                  // provideLiquidity()
                  console.log("pages/add: ButtonError onClick")
                }}
                disabled={false}
                error={false}
              >
                <ButtonText fontSize={20} fontWeight={600}>
                  Supply
                </ButtonText>
              </ButtonError>
            </AutoColumn>
          )}
        </AutoColumn>
      </PageWrapper>
    </>
  );
}
