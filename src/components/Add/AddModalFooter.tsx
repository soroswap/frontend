import { styled, useTheme } from "@mui/material"
import { ButtonError } from "components/Buttons/Button"
import Column from "components/Column"
import Row, { AutoRow } from "components/Row"
import { BodySmall, HeadlineSmall } from "components/Text"
import { AlertTriangle } from "react-feather"
import { Label } from "./AddModalHeader"
import { MouseoverTooltip } from "components/Tooltip"
import { useCallback, useMemo, useState } from "react"
import { SwapCallbackError } from "components/Swap/styleds"
import { useRouter } from "next/router"
import { useToken } from "hooks"

const DetailsContainer = styled(Column)`
  padding: 0 8px;
`

const StyledAlertTriangle = styled(AlertTriangle)`
  margin-right: 8px;
  min-width: 24px;
`

const ConfirmButton = styled(ButtonError)`
  height: 56px;
  margin-top: 10px;
`

const DetailRowValue = styled(BodySmall)`
  text-align: right;
  overflow-wrap: break-word;
`
type TokensType = [string, string];

export default function AddModalFooter() {


    const router = useRouter();
    const { tokens } = router.query as { tokens: TokensType };
    const [currencyIdA, currencyIdB] = Array.isArray(tokens) ? tokens : ['', ''];
    const currencyA = useToken(currencyIdA)
    const currencyB = useToken(currencyIdB)

    const theme = useTheme()

    const label = `XLM`
    const labelInverted = `XLM`
    const formattedPrice = 0//formatTransactionAmount(priceToPreciseFloat(trade.executionPrice))
    const txCount = 0//getTransactionCount(trade)

    const [disabledConfirm, setDisabledConfirm] = useState<boolean>(false)

    const onConfirm = useCallback(() => {
        console.log("onConfirm clicked")
    }, [])

    const swapErrorMessage = useMemo(() => {
        return ""
    }, [])

    const allowedSlippage = useMemo(() => {
        return "0.5"
    }, [])

    const currencyAmountA = useMemo(() => {
        return "100"
    }, [])

    const currencyAmountB = useMemo(() => {
        return "100"
    }, [])

    const rate = useMemo(() => {
        return `1 ${currencyA?.symbol} = 3 ${currencyB?.symbol}`
    }, [currencyA, currencyB])

    const shareOfPool = useMemo(() => {
        return `0.023 %`
    }, [])

    return (
        <>
            <BodySmall> If prices change more than {allowedSlippage}, the transaction will revert</BodySmall>
            <DetailsContainer gap="md">
                <BodySmall>
                    <Row align="flex-start" justify="space-between" gap="sm">
                        <Label>
                            {currencyA?.symbol} to deposit
                        </Label>
                        <DetailRowValue>{`${currencyAmountA} ${currencyA?.symbol}`}</DetailRowValue>
                    </Row>
                </BodySmall>
                <BodySmall>
                    <Row align="flex-start" justify="space-between" gap="sm">
                        <Label>
                            {currencyB?.symbol} to deposit
                        </Label>
                        <DetailRowValue>{`${currencyAmountB} ${currencyB?.symbol}`}</DetailRowValue>
                    </Row>
                </BodySmall>
                <BodySmall>
                    <Row align="flex-start" justify="space-between" gap="sm">
                        <MouseoverTooltip
                            title={"The current rate for this pool"}
                        >
                            <Label cursor="help">
                                Rate
                            </Label>
                        </MouseoverTooltip>
                        <MouseoverTooltip placement="right" title={""}>
                            <DetailRowValue>{rate}</DetailRowValue>
                        </MouseoverTooltip>
                    </Row>
                </BodySmall>
                <BodySmall>
                    <Row align="flex-start" justify="space-between" gap="sm">
                        <MouseoverTooltip
                            title={(
                                <>
                                    The percentage of shares you will have.
                                </>
                            )
                            }
                        >
                            <Label cursor="help">
                                Share of Pool
                            </Label>
                        </MouseoverTooltip>
                        <DetailRowValue>
                            {shareOfPool}
                        </DetailRowValue>
                    </Row>
                </BodySmall>
            </DetailsContainer>
            {
                // showAcceptChanges ? (
                //   <SwapShowAcceptChanges data-testid="show-accept-changes">
                //     <RowBetween>
                //       <RowFixed>
                //         <StyledAlertTriangle size={20} />
                //         <SubHeaderSmall color={theme.palette.customBackground.accentAction}>
                //           Price updated
                //         </SubHeaderSmall>
                //       </RowFixed>
                //       <SmallButtonPrimary onClick={onAcceptChanges}>
                //         Accept
                //       </SmallButtonPrimary>
                //     </RowBetween>
                //   </SwapShowAcceptChanges>
                // ) : 
                (
                    <AutoRow>
                        <ConfirmButton
                            data-testid="confirm-swap-button"
                            onClick={onConfirm}
                            disabled={disabledConfirm}
                            $borderRadius="20px"
                            id={"CONFIRM_SWAP_BUTTON"}
                        >
                            <HeadlineSmall color={theme.palette.custom.accentTextLightPrimary}>
                                Confirm swap
                            </HeadlineSmall>
                        </ConfirmButton>
                        {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
                    </AutoRow>
                )}
        </>
    )
}