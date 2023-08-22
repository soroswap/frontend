import { TypographyProps, styled, useTheme } from "@mui/material"
import Column from "components/Column"
import CurrencyLogo from "components/Logo/CurrencyLogo"
import Row from "components/Row"
import { BodySecondary, BodySmall, HeadlineLarge, HeadlineMedium } from "components/Text"
import { MouseoverTooltip } from "components/Tooltip"
import { useWindowSize } from "hooks/useWindowSize"
import { TokenType } from "interfaces"
import { PropsWithChildren, ReactNode } from "react"
import { Field } from "state/swap/actions"

const MAX_AMOUNT_STR_LENGTH = 9

export const Label = styled(BodySmall)<{ cursor?: string }>`
  cursor: ${({ cursor }) => cursor};
  color: ${({ theme }) => theme.palette.secondary.main};
  margin-right: 8px;
`

const ResponsiveHeadline = ({ children }: PropsWithChildren<TypographyProps>) => {
  const { width } = useWindowSize()

  if (width && width < 396) {
    return <HeadlineMedium>{children}</HeadlineMedium>
  }

  return (
    <HeadlineLarge fontWeight={500}>
      {children}
    </HeadlineLarge>
  )
}

interface AmountProps {
  field: Field
  tooltipText?: ReactNode
  label: ReactNode
  amount: number
  usdAmount?: number
  currency: TokenType | undefined
}
export function SwapModalHeaderAmount({ tooltipText, label, amount, usdAmount, field, currency }: AmountProps) {
  const theme = useTheme()
  let formattedAmount = Number(amount).toFixed(2)//formatCurrencyAmount(amount, NumberType.TokenTx)
  console.log("🚀 « formattedAmount:", formattedAmount)
  if (formattedAmount.length > MAX_AMOUNT_STR_LENGTH) {
    formattedAmount = ""//formatCurrencyAmount(amount, NumberType.SwapTradeAmount)
  }

  return (
    <Row align="center" justify="space-between" gap="12px">
      <Column gap="4px" alignItems="flex-start">
        <BodySecondary>
          <MouseoverTooltip title={tooltipText} disableInteractive={!tooltipText}>
            <Label cursor="help">{label}</Label>
          </MouseoverTooltip>
        </BodySecondary>
        <Column gap="4px" alignItems="flex-start">
          <ResponsiveHeadline data-testid={`${field}-amount`}>
            {formattedAmount} {currency?.token_symbol}
          </ResponsiveHeadline>
          {usdAmount !== undefined && (
            <BodySmall color={theme.palette.custom.textTertiary}>
              {usdAmount}
            </BodySmall>
          )}
        </Column>
      </Column>
      <CurrencyLogo currency={currency} size="36px" />
    </Row>
  )
}
