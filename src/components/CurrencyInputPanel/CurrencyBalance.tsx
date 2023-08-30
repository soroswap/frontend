import { styled, useTheme } from "@mui/material"
import { RowFixed } from "components/Row"
import { BodySmall } from "components/Text"
import { useFormattedTokenBalance } from "hooks"
import { TokenType } from "interfaces/tokens"

const StyledBalanceMax = styled('button')<{ disabled?: boolean }>`
  background-color: transparent;
  border: none;
  color: ${({ theme }) => theme.palette.custom.borderColor};
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  opacity: ${({ disabled }) => (!disabled ? 1 : 0.4)};
  padding: 4px 6px;
  pointer-events: ${({ disabled }) => (!disabled ? 'initial' : 'none')};

  :hover {
    opacity: ${({ disabled }) => (!disabled ? 0.8 : 0.4)};
  }

  :focus {
    outline: none;
  }
`

interface CurrencyBalanceProps {
    address: string,
    currency: TokenType
    onMax: (maxValue: number) => void
    hideBalance: any
    showMaxButton: any
  }

export default function CurrencyBalance({
    currency,
    address,
    onMax,
    hideBalance,
    showMaxButton,

  }: CurrencyBalanceProps) {
    const selectedCurrencyBalance = useFormattedTokenBalance(currency.address, address)
    const theme = useTheme()
    
    return (
        <RowFixed style={{ height: '17px' }}>
                  <BodySmall
                    color={theme.palette.secondary.main}
                  >
                    {!hideBalance && currency && selectedCurrencyBalance ? (
                      `Balance: ${selectedCurrencyBalance}`
                    ) : null}
                  </BodySmall>
                  {showMaxButton && Number(selectedCurrencyBalance) > 0 ? (
                    <StyledBalanceMax onClick={() => onMax(parseInt(selectedCurrencyBalance))}>
                      Max
                    </StyledBalanceMax>
                  ) : null}
                </RowFixed>
    )

  }