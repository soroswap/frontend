import { styled, useTheme } from "@mui/material"
import Column from "components/Column"
import CurrencyLogo from "components/Logo/CurrencyLogo"
import Row from "components/Row"
import { BodySecondary, BodySmall, ResponsiveMediumText } from "components/Text"
import { MouseoverTooltip } from "components/Tooltip"
import { useRouter } from "next/router"
const MAX_AMOUNT_STR_LENGTH = 9
import { TokenType } from "interfaces";
import { useToken } from "hooks"
import { useMemo } from "react"

export const Label = styled(BodySmall) <{ cursor?: string }>`
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
type TokensType = [string, string];


export default function AddModalHeader() {
    // return (<div>Add Modal Header</div>)
    const theme = useTheme()
    //   let formattedAmount = Number(amount)//formatCurrencyAmount(amount, NumberType.TokenTx)
    //   console.log("🚀 « formattedAmount:", formattedAmount)
    // if (formattedAmount.length > MAX_AMOUNT_STR_LENGTH) {
    //   formattedAmount = ""//formatCurrencyAmount(amount, NumberType.SwapTradeAmount)
    // }
    const router = useRouter();
    const { tokens } = router.query as { tokens: TokensType };
    const [currencyIdA, currencyIdB] = Array.isArray(tokens) ? tokens : ['', ''];
    const currencyA = useToken(currencyIdA)
    const currencyB = useToken(currencyIdB)

    const amountOfLpTokensToReceive = useMemo(() => {
        return "2.3456"
    }, [])

    return (
        <CustomRow align="end" justify="space-between">
            <Column gap="4px" alignItems="flex-start">
                <BodySecondary>
                </BodySecondary>
                <CurrencyWrapper>
                    <CurrencyLogo currency={currencyA} size="24px" />
                    <CurrencyLogo currency={currencyB} size="24px" />
                    {amountOfLpTokensToReceive}
                </CurrencyWrapper>
                {currencyA?.symbol}/{currencyB?.symbol}  Pool Tokens
            </Column>
        </CustomRow>
    )

}