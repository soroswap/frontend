import { Typography, useTheme } from "@mui/material";
import { useSorobanReact } from '@soroban-react/core';
import BigNumber from "bignumber.js";
import AppBody from "components/AppBody";
import { ButtonError, ButtonLight } from "components/Buttons/Button";
import { BlueCard } from "components/Card";
import { AutoColumn, ColumnCenter } from "components/Column";
import CurrencyInputPanel from "components/CurrencyInputPanel";
import { AddRemoveTabs } from "components/NavigationTabs";
import { Wrapper } from "components/Pool/styleds";
import { SubHeader } from "components/Text";
import TransactionConfirmationModal, { ConfirmationModalContent } from "components/TransactionConfirmationModal";
import { getLpTokensAmount, getTotalShares } from "functions/LiquidityPools";
import depositOnContract from "functions/depositOnContract";
import { formatTokenAmount } from "helpers/format";
import { getToken } from "hooks";
import { reservesBNWithTokens } from "hooks/useReserves";
import { TokenType } from "interfaces";
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "react-feather";
import { Field } from "state/mint/actions";
import { useDerivedMintInfo, useMintActionHandlers, useMintState } from "state/mint/hooks";
import AddModalFooter from "./AddModalFooter";
import AddModalHeader from "./AddModalHeader";


type TokensType = [string, string];

export default function AddLiquidityPage() {

  const theme = useTheme()

  const router = useRouter();
  const { tokens } = router.query as { tokens: TokensType };
  // console.log("pages/add tokens:", tokens)

  const [currencyIdA, currencyIdB] = Array.isArray(tokens) ? tokens : ['', ''];
  console.log("src/components/Add/index: [currencyIdA, currencyIdB]:", [currencyIdA, currencyIdB])

  // console.log("typeof tokens:", typeof tokens)
  // const {
  //   dependentField,
  //   currencies,
  //   pair,
  //   pairState,
  //   currencyBalances,
  //   parsedAmounts,
  //   price,
  //   noLiquidity,
  //   liquidityMinted,
  //   poolTokenPercentage,
  //   error,
  // } = useDerivedMintInfo(currencyA ?? undefined, currencyB ?? undefined)

  const sorobanContext = useSorobanReact()

  const [currencyA, setCurrencyA] = useState<TokenType | undefined>()
  const [currencyB, setCurrencyB] = useState<TokenType | undefined>()

  const [amountOfLpTokensToReceive, setAmountOfLpTokensToReceive] = useState<string>("")
  const [amountOfLpTokensToReceiveBN, setAmountOfLpTokensToReceiveBN] = useState<BigNumber>()
  const [totalShares, setTotalShares] = useState<string>("")

  const navigate = useCallback((destination: any) => { router.push(destination) }, [router]
  )
  // console.log("pages/add, currencyA, currencyB", currencyA, currencyB)

  const derivedMintInfo = useDerivedMintInfo(
    currencyA ? currencyA : undefined,
    currencyB ? currencyB : undefined)
  // const derivedMintInfo = useDerivedMintInfo(tokens[0], tokens[1])
  const { dependentField, currencies, parsedAmounts, noLiquidity, pairAddress } = derivedMintInfo
  console.log("pages/add derivedMintInfo:", derivedMintInfo)
  // const noLiquidity = true
  const isCreate = false

  const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noLiquidity)

  const { independentField, typedValue, otherTypedValue } = useMintState()

  // console.log("src/components/Add/index.tsx: independentField:", independentField)
  const formattedAmounts = useMemo(() => {
    return {
      [independentField]: typedValue,
      // [dependentField]: noLiquidity ? otherTypedValue : parsedAmounts[dependentField]?.value ?? '',
      [dependentField]: noLiquidity ? otherTypedValue : formatTokenAmount(parsedAmounts[dependentField]?.value ?? ''),
      // [dependentField]: otherTypedValue
    }
  }, [dependentField, independentField, noLiquidity, otherTypedValue, parsedAmounts, typedValue])

  // console.log("src/components/Add/index.tsx: formattedAmounts:", formattedAmounts)
  // console.log("src/components/Add/index.tsx: formatTokenAmount(formattedAmounts[dependentField]):", formatTokenAmount(formattedAmounts[dependentField]))
  // console.log("src/components/Add/index.tsx: parsedAmounts:", parsedAmounts)
  // console.log("src/components/Add/index.tsx: noLiquidity:", noLiquidity)

  // Modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    // if there was a tx hash, we want to clear the input
    // if (txHash) {
    //   onFieldAInput('')
    // }
    // setTxHash('')
  }, [])

  const provideLiquidity = useCallback(() => {

    // TODO: check that amount0 corresponds to token0?
    depositOnContract({
      sorobanContext,
      pairAddress: pairAddress,
      amount0: formattedAmounts[independentField],
      amount1: formattedAmounts[dependentField],
    })
  }, [dependentField, pairAddress, formattedAmounts, independentField, sorobanContext])

  const handleCurrencyASelect = useCallback(
    (currencyA: TokenType) => {
      const newCurrencyIdA = currencyA.address
      if (newCurrencyIdA === currencyIdB) {
        navigate(`/liquidity/add/${currencyIdB}/${currencyIdA}`)
      } else {
        navigate(`/liquidity/add/${newCurrencyIdA}/${currencyIdB}`)
      }
    },
    [currencyIdB, navigate, currencyIdA]
  )
  const handleCurrencyBSelect = useCallback(
    (currencyB: TokenType) => {
      const newCurrencyIdB = currencyB.address
      if (currencyIdA === newCurrencyIdB) {
        if (currencyIdB) {
          navigate(`/liquidity/add/${currencyIdB}/${newCurrencyIdB}`)
        } else {
          navigate(`/liquidity/add/${newCurrencyIdB}`)
        }
      } else {
        navigate(`/liquidity/add/${currencyIdA ? currencyIdA : 'ETH'}/${newCurrencyIdB}`)
      }
    },
    [currencyIdA, navigate, currencyIdB]
  )

  // update currencies
  useEffect(() => {
    if (currencyIdA || currencyIdA !== '') {
      getToken(sorobanContext, currencyIdA).then((token) => {
        // console.log("src/components/Add/index: get Token A called: ", token)
        setCurrencyA(token)
      })
    }
    if (currencyIdB || currencyIdB !== '') {
      getToken(sorobanContext, currencyIdB).then((token) => {
        // console.log("src/components/Add/index: get Token B called: ", token)
        setCurrencyB(token)
      })
    }

  }, [currencyIdA, currencyIdB, sorobanContext])

  // Get the LP token amount to receive
  useEffect(() => {
    if (!pairAddress || !currencyA || !currencyB) return
    // LP tokens
    // We need to get which one is amount0 
    reservesBNWithTokens(pairAddress, sorobanContext).then((reserves) => {
      if (!reserves.reserve0 || !reserves.reserve1 || !formattedAmounts.CURRENCY_A || !formattedAmounts.CURRENCY_B) return

      let amount0, amount1
      // Check if currencyA corresponds to token0 or token1
      if (currencyA.address === reserves.token0) {
        amount0 = new BigNumber(formattedAmounts.CURRENCY_A)
        amount1 = new BigNumber(formattedAmounts.CURRENCY_B)
      } else if (currencyA.address === reserves.token1) {
        amount0 = new BigNumber(formattedAmounts.CURRENCY_B)
        amount1 = new BigNumber(formattedAmounts.CURRENCY_A)
      } else {
        console.log("currencyA does not correspond to either token0 or token1");
        return
      }
      getLpTokensAmount(
        amount0,
        reserves.reserve0,
        amount1,
        reserves.reserve1,
        pairAddress,
        sorobanContext
      ).then((lpTokens) => {
        if (lpTokens === undefined) console.log("src/components/Add/index.tsx: lpTokens are undefined")
        else {
          setAmountOfLpTokensToReceive(lpTokens.toString())
          setAmountOfLpTokensToReceiveBN(lpTokens)
        }
      })
    })
  }, [currencyA, currencyB, formattedAmounts, pairAddress, sorobanContext])

  // Get share of Pool
  useEffect(() => {
    if (!pairAddress || !amountOfLpTokensToReceiveBN) return
    getTotalShares(pairAddress, sorobanContext).then((totalSharesResult) => {
      if (typeof totalSharesResult === 'number' || typeof totalSharesResult === 'string') {
        const totalSharesBN = new BigNumber(totalSharesResult)
        const share = amountOfLpTokensToReceiveBN.multipliedBy(100).dividedBy(amountOfLpTokensToReceiveBN.plus(totalSharesBN.shiftedBy(-7)))
        setTotalShares(share.toString())
      } else {
        console.error("Invalid type for totalSharesResult", totalSharesResult);
      }
    })
  }, [amountOfLpTokensToReceiveBN, pairAddress, sorobanContext])
  return (
    <>
      <AppBody>
        <AddRemoveTabs creating={false} adding={true} autoSlippage={"DEFAULT_ADD_V2_SLIPPAGE_TOLERANCE"} />
        <Wrapper>
          <TransactionConfirmationModal
            isOpen={showConfirm}
            onDismiss={handleDismissConfirmation}
            attemptingTxn={attemptingTxn}
            reviewContent={() => (
              <ConfirmationModalContent
                title={noLiquidity ? <>You are creating a pool</> : <>You will receive</>}
                onDismiss={handleDismissConfirmation}
                topContent={() => AddModalHeader({ currencies, amountOfLpTokensToReceive })}
                bottomContent={() => AddModalFooter({ currencies, formattedAmounts, totalShares, onConfirm: provideLiquidity })}
              />
            )}

          />
          <AutoColumn gap="20px">
            {noLiquidity ||
              (isCreate ? (
                <ColumnCenter>
                  <BlueCard>
                    <AutoColumn gap="10px">
                      <SubHeader fontWeight={600} color="accentAction">
                        <>You are the first liquidity provider.</>
                      </SubHeader>
                      <SubHeader fontWeight={400} color="accentAction">
                        <>The ratio of tokens you add will set the price of this pool.</>
                      </SubHeader>
                      <SubHeader fontWeight={400} color="accentAction">
                        <>Once you are happy with the rate click supply to review.</>
                      </SubHeader>
                    </AutoColumn>
                  </BlueCard>
                </ColumnCenter>
              ) : (
                <ColumnCenter>
                  <BlueCard>
                    <AutoColumn gap="10px">
                      <SubHeader fontWeight={400} color="accentAction">
                        <>
                          <b>
                            <>Tip:</>
                          </b>{' '}
                          When you add liquidity, you will receive pool tokens representing your position. These tokens
                          automatically earn fees proportional to your share of the pool, and can be redeemed at any
                          time.
                        </>
                      </SubHeader>
                    </AutoColumn>
                  </BlueCard>
                </ColumnCenter>
              ))}
            <CurrencyInputPanel
              value={formattedAmounts[Field.CURRENCY_A]}
              onUserInput={onFieldAInput}
              // onMax={() => {
              //   onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
              // }}
              onCurrencySelect={handleCurrencyASelect}
              showMaxButton={false}
              currency={currencies[Field.CURRENCY_A] ?? null}
              // currency={null}
              id="add-liquidity-input-tokena"
            // showCommonBases
            />
            <ColumnCenter>
              <Plus size="16" color={theme.palette.secondary.main} />
            </ColumnCenter>
            <CurrencyInputPanel
              value={formattedAmounts[Field.CURRENCY_B]}
              onUserInput={onFieldBInput}
              onCurrencySelect={handleCurrencyBSelect}
              // onMax={() => {
              //   onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '')
              // }}
              showMaxButton={false}
              currency={currencies[Field.CURRENCY_B] ?? null}
              // currency={currencies[Field.CURRENCY_A] ?? null}
              // currency={null}
              id="add-liquidity-input-tokenb"
            // showCommonBases
            />
            {/* {currencies[Field.CURRENCY_A] && currencies[Field.CURRENCY_B] && pairState !== PairState.INVALID && (
              <>
                <LightCard padding="0px" $borderRadius="20px">
                  <RowBetween padding="1rem">
                    <DeprecatedSubHeader fontWeight={500} fontSize={14}>
                      {noLiquidity ? (
                        <>Initial prices and pool share</>
                      ) : (
                        <>Prices and pool share</>
                      )}
                    </DeprecatedSubHeader>
                  </RowBetween>{' '}
                  <LightCard padding="1rem" $borderRadius="20px">
                    <PoolPriceBar
                      currencies={currencies}
                      poolTokenPercentage={poolTokenPercentage}
                      noLiquidity={noLiquidity}
                      price={price}
                    />
                  </LightCard>
                </LightCard>
              </>
            )} */}

            {/* {addIsUnsupported ? (
              <ButtonPrimary disabled={true}>
                <DeprecatedMain mb="4px">
                  <>Unsupported Asset</>
                </DeprecatedMain>
              </ButtonPrimary>
            ) : !account ? (
              <TraceEvent
                events={[BrowserEvent.onClick]}
                name={InterfaceEventName.CONNECT_WALLET_BUTTON_CLICKED}
                properties={{ received_swap_quote: false }}
                element={InterfaceElementName.CONNECT_WALLET_BUTTON}
              >
                <ButtonLight onClick={toggleWalletDrawer}>
                  <>Connect Wallet</>
                </ButtonLight>
              </TraceEvent>
            ) : (
              <AutoColumn gap="md">
                {(approvalA === ApprovalState.NOT_APPROVED ||
                  approvalA === ApprovalState.PENDING ||
                  approvalB === ApprovalState.NOT_APPROVED ||
                  approvalB === ApprovalState.PENDING) &&
                  isValid && (
                    <RowBetween>
                      {approvalA !== ApprovalState.APPROVED && (
                        <ButtonPrimary
                          onClick={approveACallback}
                          disabled={approvalA === ApprovalState.PENDING}
                          width={approvalB !== ApprovalState.APPROVED ? '48%' : '100%'}
                        >
                          {approvalA === ApprovalState.PENDING ? (
                            <Dots>
                              <>Approving {currencies[Field.CURRENCY_A]?.symbol}</>
                            </Dots>
                          ) : (
                            <>Approve {currencies[Field.CURRENCY_A]?.symbol}</>
                          )}
                        </ButtonPrimary>
                      )}
                      {approvalB !== ApprovalState.APPROVED && (
                        <ButtonPrimary
                          onClick={approveBCallback}
                          disabled={approvalB === ApprovalState.PENDING}
                          width={approvalA !== ApprovalState.APPROVED ? '48%' : '100%'}
                        >
                          {approvalB === ApprovalState.PENDING ? (
                            <Dots>
                              <>Approving {currencies[Field.CURRENCY_B]?.symbol}</>
                            </Dots>
                          ) : (
                            <>Approve {currencies[Field.CURRENCY_B]?.symbol}</>
                          )}
                        </ButtonPrimary>
                      )}
                    </RowBetween>
                  )}
                <ButtonError
                  onClick={() => {
                    setShowConfirm(true)
                  }}
                  disabled={!isValid || approvalA !== ApprovalState.APPROVED || approvalB !== ApprovalState.APPROVED}
                  error={!isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]}
                >
                  <Text fontSize={20} fontWeight={500}>
                    {error ?? <>Supply</>}
                  </Text>
                </ButtonError>
              </AutoColumn>
            )} */}

            {!sorobanContext.address ? (

              <ButtonLight onClick={() => { }}>
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
                  <Typography >
                    {<>Supply</>}
                  </Typography>
                </ButtonError>
              </AutoColumn>
            )}
          </AutoColumn>
        </Wrapper>
      </AppBody>
    </>
  );
}
