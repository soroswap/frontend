import { TypographyProps, styled, useTheme } from "@mui/material"
import Column from "components/Column"
import CurrencyLogo from "components/Logo/CurrencyLogo"
import Row from "components/Row"
import { BodySecondary, BodySmall, HeadlineLarge, HeadlineMedium, ResponsiveMediumText, SubHeader } from "components/Text"
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

const CurrencyWrapper = styled('div')`
  display: flex;
  flex-direction: row;
  gap: 8px;
  background: #2A2E44;
  border-radius: 79px;
  padding: 8px;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-family: 'Inter';
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
`

const CustomRow = styled(Row)`
  border-radius: var(--arrendodamento, 16px);
  border: 1px solid var(--fora-do-brading-desativado, #4E4E4E);
  padding: 15px;
`

interface AmountProps {
  field: Field
  tooltipText?: ReactNode
  label: ReactNode
  amount: string
  usdAmount?: number
  currency: TokenType | undefined
}
export function SwapModalHeaderAmount({ tooltipText, label, amount, usdAmount, field, currency }: AmountProps) {
  const theme = useTheme()
  let formattedAmount = Number(amount)//formatCurrencyAmount(amount, NumberType.TokenTx)
  console.log("🚀 « formattedAmount:", formattedAmount)
  // if (formattedAmount.length > MAX_AMOUNT_STR_LENGTH) {
  //   formattedAmount = ""//formatCurrencyAmount(amount, NumberType.SwapTradeAmount)
  // }

  return (
    <CustomRow align="end" justify="space-between">
      <Column gap="4px" alignItems="flex-start">
        <BodySecondary>
          <MouseoverTooltip title={tooltipText} disableInteractive={!tooltipText}>
            <Label cursor="help">{label}</Label>
          </MouseoverTooltip>
        </BodySecondary>
        <CurrencyWrapper>
          <CurrencyLogo currency={currency} size="24px" />
          {currency?.symbol}
        </CurrencyWrapper>
      </Column>
      <Column gap="4px" alignItems="flex-end">
          <ResponsiveMediumText>
            {formattedAmount}
          </ResponsiveMediumText>
          {usdAmount !== undefined && (
            <BodySmall color={theme.palette.custom.textTertiary}>
              {usdAmount}
            </BodySmall>
          )}
        </Column>
    </CustomRow>
  )
}
