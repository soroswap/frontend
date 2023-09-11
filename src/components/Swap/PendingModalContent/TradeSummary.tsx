import { styled, useTheme } from '@mui/material'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import Row from 'components/Row'
import { LabelSmall } from 'components/Text'
import { formatTokenAmount } from 'helpers/format'
import { ArrowDown } from 'react-feather'
import { InterfaceTrade } from 'state/routing/types'
import Column from 'components/Column'
import { ArrowWrapper } from '../styleds'
import { ArrowContainer } from '../../../../pages/swap'

const CustomRowTop = styled(Row)`
  border-radius: var(--arrendodamento, 16px);
  border: 1px solid var(--fora-do-brading-desativado, #4E4E4E);
  padding: 15px;
  margin-bottom: -4px;
`
const CustomRowBottom = styled(Row)`
  border-radius: var(--arrendodamento, 16px);
  border: 1px solid var(--fora-do-brading-desativado, #4E4E4E);
  padding: 15px;
  margin-top: -4px;
`

export function TradeSummary({ trade }: { trade: Pick<InterfaceTrade, 'inputAmount' | 'outputAmount'> }) {
  const theme = useTheme()
  return (
    <Column>
      <CustomRowTop>
        <CurrencyLogo currency={trade?.inputAmount?.currency} size="16px" />
        <LabelSmall color="textPrimary">
          {`${formatTokenAmount(trade?.inputAmount?.value ?? "0")} ${trade?.inputAmount?.currency.symbol}`}{/* {formatCurrencyAmount(trade.inputAmount, NumberType.SwapTradeAmount)} {trade.inputAmount.currency.symbol} */}
        </LabelSmall>
      </CustomRowTop>
      <ArrowWrapper clickable={false}>
        <ArrowContainer
          data-testid="swap-currency-button"
        >
          <ArrowDown
            size="16"
            color={"#000000"}
          />
        </ArrowContainer>
      </ArrowWrapper>
      <CustomRowBottom>  
        <CurrencyLogo currency={trade?.outputAmount?.currency} size="16px" />
        <LabelSmall color="textPrimary">
        {`${formatTokenAmount(trade?.outputAmount?.value ?? "0")} ${trade?.outputAmount?.currency.symbol}`} {/* {formatCurrencyAmount(trade.outputAmount, NumberType.SwapTradeAmount)} {trade.outputAmount.currency.symbol} */}
        </LabelSmall>
      </CustomRowBottom>
    </Column>
  )
}
