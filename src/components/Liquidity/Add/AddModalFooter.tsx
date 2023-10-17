import { styled, useTheme } from "@mui/material"
import BigNumber from "bignumber.js"
import { ButtonError } from "components/Buttons/Button"
import Column from "components/Column"
import Row, { AutoRow } from "components/Row"
import { SwapCallbackError } from "components/Swap/styleds"
import { BodySmall, HeadlineSmall } from "components/Text"
import { MouseoverTooltip } from "components/Tooltip"
import { TokenType } from "interfaces"
import { useMemo, useState } from "react"
import { AlertTriangle } from "react-feather"
import { Field } from "state/mint/actions"
import { Label } from "./AddModalHeader"

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

export default function AddModalFooter({
  currencies,
  formattedAmounts,
  totalShares,
  onConfirm,
}: {
  currencies: { [field in Field]?: TokenType },
  formattedAmounts: { [field in Field]?: string },
  totalShares: string
  onConfirm: () => void,
  }) {
  

  const theme = useTheme()

  const [disabledConfirm, setDisabledConfirm] = useState<boolean>(false)
  // const [shareOfPool, setShareOfPool] = useState<string>("")

  const currencyA = useMemo(() => {
      return currencies.CURRENCY_A;
  }, [currencies])

  const currencyB = useMemo(() => {
      return currencies.CURRENCY_B;
  }, [currencies])

  const swapErrorMessage = useMemo(() => {
      return ""
  }, [])

  const allowedSlippage = useMemo(() => {
      return "0.5"
  }, [])

  const rate = useMemo(() => {
      if (!formattedAmounts.CURRENCY_A || !formattedAmounts.CURRENCY_B) return
      const amountA = new BigNumber(formattedAmounts.CURRENCY_A)
      const amountB = new BigNumber(formattedAmounts.CURRENCY_B)

      return `1 ${currencyA?.symbol} = ${amountB.dividedBy(amountA)} ${currencyB?.symbol}`
  }, [currencyA, currencyB, formattedAmounts])

  const shareOfPool = useMemo(() => {
      return `${totalShares} %`
  }, [totalShares])
  return (
    <>
      <BodySmall> If prices change more than {allowedSlippage}, the transaction will revert</BodySmall>
      <DetailsContainer gap="md">
        <BodySmall>
          <Row align="flex-start" justify="space-between" gap="sm">
            <Label>
              {currencyA?.name} to deposit
            </Label>
            <DetailRowValue>{`${formattedAmounts.CURRENCY_A} ${currencyA?.symbol}`}</DetailRowValue>
          </Row>
        </BodySmall>
        <BodySmall>
          <Row align="flex-start" justify="space-between" gap="sm">
            <Label>
              {currencyB?.name} to deposit
            </Label>
            <DetailRowValue>{`${formattedAmounts.CURRENCY_B} ${currencyB?.symbol}`}</DetailRowValue>
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
              )}
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