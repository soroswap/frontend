import { AutoColumn, ColumnCenter } from "components/Column";
import SEO from "../src/components/SEO";
import CurrencyInputPanel from "components/CurrencyInputPanel";
import { Plus } from "react-feather";
import { useTheme } from "@mui/material";
import AppBody from "components/AppBody";
import { AddRemoveTabs } from "components/NavigationTabs";
import { Wrapper } from "components/Pool/styleds";
import { BlueCard } from "components/Card";
import { SubHeader } from "components/Text";

export default function AddLiquidityPage() {

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
  const noLiquidity = false
  const isCreate = false

  const theme = useTheme()
  return (
    <>
      <SEO title="Liquidity - Soroswap" description="Soroswap Liquidity Pool" />
      <AppBody>
        <AddRemoveTabs creating={false} adding={true} autoSlippage={"DEFAULT_ADD_V2_SLIPPAGE_TOLERANCE"} />
        <Wrapper>
          {/* <TransactionConfirmationModal
            isOpen={showConfirm}
            onDismiss={handleDismissConfirmation}
            attemptingTxn={attemptingTxn}
            hash={txHash}
            // reviewContent={() => (
            //   <ConfirmationModalContent
            //     title={noLiquidity ? <>You are creating a pool</> : <>You will receive</>}
            //     onDismiss={handleDismissConfirmation}
            //     topContent={modalHeader}
            //     bottomContent={modalBottom}
            //   />
            // )}
            pendingText={pendingText}
            currencyToAdd={pair?.liquidityToken}
          /> */}
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
              value={"1"}
              onUserInput={() => console.log("ss")}
              // onMax={() => {
              //   onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
              // }}
              // onCurrencySelect={handleCurrencyASelect}
              showMaxButton={false}
              // currency={currencies[Field.CURRENCY_A] ?? null}
              currency={null}
              id="add-liquidity-input-tokena"
            // showCommonBases
            />
            <ColumnCenter>
              <Plus size="16" color={theme.palette.secondary.main} />
            </ColumnCenter>
            <CurrencyInputPanel
              value={"1"}
              onUserInput={() => console.log("dd")}
              // onCurrencySelect={handleCurrencyBSelect}
              // onMax={() => {
              //   onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '')
              // }}
              showMaxButton={false}
              // currency={currencies[Field.CURRENCY_B] ?? null}
              // currency={currencies[Field.CURRENCY_A] ?? null}
              currency={null}
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
          </AutoColumn>
        </Wrapper>
      </AppBody>
    </>
  );
}
