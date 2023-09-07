import { styled, useTheme } from "@mui/material"
import Column from "components/Column"
import CurrencyLogo from "components/Logo/CurrencyLogo"
import Row from "components/Row"
import { BodySecondary, BodySmall, ResponsiveMediumText } from "components/Text"
import { MouseoverTooltip } from "components/Tooltip"
import { useRouter } from "next/router"
import { TokenType } from "interfaces";
import { useToken } from "hooks"
import { useEffect, useMemo, useState } from "react"
import { Field } from "state/mint/actions"
import { getLpTokensAmount, getTotalShares } from "functions/LiquidityPools"
import { SorobanContext, SorobanContextType } from "@soroban-react/core"
import { reservesBNWithTokens } from "hooks/useReserves"
import BigNumber from "bignumber.js"

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

    const [amountOfLpTokensToReceive, setAmountOfLpTokensToReceive] = useState<string>("")

    // const amountOfLpTokensToReceive = useMemo(() => {
    //     if (!pairAddress) return
    //     const totalShares = getTotalShares(pairAddress, sorobanContext)
    //     // print("totalShares", totalShares)
    //     return "2.3456"
    // }, [pairAddress, sorobanContext])

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
                setAmountOfLpTokensToReceive(lpTokens.toString())

            })
        })
    }, [currencyA, currencyB, formattedAmounts, pairAddress, sorobanContext])

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