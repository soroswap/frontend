// import { formatCurrencyAmount, formatNumber, NumberType } from '@uniswap/conedison/format'
// import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
// import Column from 'components/Column'
// import CurrencyLogo from 'components/Logo/CurrencyLogo'
// import Row from 'components/Row'
// import { MouseoverTooltip } from 'components/Tooltip'
// import { useWindowSize } from 'hooks/useWindowSize'
// import { PropsWithChildren, ReactNode } from 'react'
// import { TextProps } from 'rebass'
// import { Field } from 'state/swap/actions'
// import styled from 'styled-components/macro'
// import { BREAKPOINTS, ThemedText } from 'theme'

import { styled } from "@mui/material"
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

const ResponsiveHeadline = ({ children, ...textProps }: PropsWithChildren<Text>) => {
  const { width } = useWindowSize()

  if (width && width < 396) {
    return <HeadlineMedium {...textProps}>{children}</HeadlineMedium>
  }

  return (
    <HeadlineLarge fontWeight={500} {...textProps}>
      {children}
    </HeadlineLarge>
  )
}

interface AmountProps {
  field: Field
  tooltipText?: ReactNode
  label: ReactNode
  amount: string
  usdAmount?: number
  currency: TokenType | undefined
}

export function SwapModalHeaderAmount({ tooltipText, label, amount, usdAmount, field, currency }: AmountProps) {
  let formattedAmount = "0"//formatCurrencyAmount(amount, NumberType.TokenTx)
  if (formattedAmount.length > MAX_AMOUNT_STR_LENGTH) {
    formattedAmount = ""//formatCurrencyAmount(amount, NumberType.SwapTradeAmount)
  }

  return (
    <Row align="center" justify="space-between" gap="12px">
      <Column gap="4px">
        <BodySecondary>
          <MouseoverTooltip text={tooltipText} disabled={!tooltipText}>
            <Label cursor="help">{label}</Label>
          </MouseoverTooltip>
        </BodySecondary>
        <Column gap="4px">
          {/* <ResponsiveHeadline data-testid={`${field}-amount`}>
            {formattedAmount} {currency?.token_symbol}
          </ResponsiveHeadline> */}
          {usdAmount && (
            <BodySmall color="textTertiary">
              usdAmount
            </BodySmall>
          )}
        </Column>
      </Column>
      <CurrencyLogo currency={currency} size="36px" />
    </Row>
  )
}
