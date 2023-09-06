import { styled, useTheme } from "@mui/material"
import Column from "components/Column"
import CurrencyLogo from "components/Logo/CurrencyLogo"
import Row from "components/Row"
import { BodySecondary, BodySmall, ResponsiveMediumText } from "components/Text"
import { MouseoverTooltip } from "components/Tooltip"
import { useRouter } from "next/router"
import { TokenType } from "interfaces";
import { useToken } from "hooks"
import { useEffect, useMemo } from "react"
import { Field } from "state/mint/actions"
import { getTotalShares } from "functions/LiquidityPools"
import { SorobanContext, SorobanContextType } from "@soroban-react/core"

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

function print(...args: any) {
    console.log("src/components/Add/AddModalHeader.tsx:", ...args)
}
export default function AddModalHeader({
    currencies,
    formattedAmounts,
    pairAddress,
    sorobanContext
}: {
    currencies: { [field in Field]?: TokenType },
    formattedAmounts: { [field in Field]?: string },
    pairAddress: string | undefined,
    sorobanContext: SorobanContextType
}) {
    const currencyA = useMemo(() => {
        return currencies.CURRENCY_A;
    }, [currencies])

    const currencyB = useMemo(() => {
        return currencies.CURRENCY_B;
    }, [currencies])
    // console.log("src/components/Add/AddModalHeader.tsx:", "formattedAmounts:", formattedAmounts)

    const amountOfLpTokensToReceive = useMemo(() => {
        if (!pairAddress) return
        const totalShares = getTotalShares(pairAddress, sorobanContext)
        // print("totalShares", totalShares)
        return "2.3456"
    }, [pairAddress, sorobanContext])

    useEffect(() => {
        if (!pairAddress) return
        getTotalShares(pairAddress, sorobanContext).then((totalShares) => {
            print("totalShares:", totalShares)
        })
    }, [pairAddress, sorobanContext])

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