import { FixedSizeList } from 'react-window'
import { Typography, styled } from "@mui/material"
import { TokenBalancesMap, TokenType } from "../../../interfaces"
import { Check } from "react-feather"
import { useSorobanReact } from "@soroban-react/core"
import Column, { AutoColumn } from "components/Column"
import CurrencyLogo from "components/Logo/CurrencyLogo"
import Row, { RowFixed } from "components/Row"
import { CSSProperties, MutableRefObject, useCallback, useMemo } from "react"
import { LoadingRows, MenuItem } from "../styleds"
import Loader from 'components/Icons/LoadingSpinner'
import { useTokenBalance } from 'hooks'

function currencyKey(currency: TokenType): string {
  return currency.token_id ? currency.token_address : 'ETHER'
}

const CheckIcon = styled(Check)`
  height: 20px;
  width: 20px;
  margin-left: 4px;
  color: ${({ theme }) => "#4C82FB"};
`

const StyledBalanceText = styled(Typography)`
  white-space: nowrap;
  overflow: hidden;
  max-width: 5rem;
  text-overflow: ellipsis;
`

const CurrencyName = styled(Typography)`
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ListWrapper = styled('div')`
  padding-right: 0.25rem;
`

function Balance({ balance }: { balance: number }) {
  const balanceToShow = balance == 0 ? 0 : balance.toFixed(4)

  return <StyledBalanceText title={String(balance)}>{balanceToShow}</StyledBalanceText>
}

export function CurrencyRow({
  currency,
  onSelect,
  isSelected,
  otherSelected,
  style,
  showCurrencyAmount,
  eventProperties,
}: {
  currency: TokenType
  onSelect: (hasWarning: boolean) => void
  isSelected: boolean
  otherSelected: boolean
  style?: CSSProperties
  showCurrencyAmount?: boolean
  eventProperties: Record<string, unknown>
}) {
  const { address } = useSorobanReact()
  const key = currencyKey(currency)
  const { balance, loading } = useTokenBalance(address!, currency)
  
  const warning = false
  const isBlockedToken = false
  const blockedTokenOpacity = '0.6'

  // only show add or remove buttons if not on selected list
  return (
  <MenuItem
    tabIndex={0}
    style={style}
    onKeyPress={(e) => (!isSelected && e.key === 'Enter' ? onSelect(!!warning) : null)}
    onClick={() => (isSelected ? null : onSelect(!!warning))}
    disabled={isSelected}
    selected={otherSelected}
    dim={isBlockedToken}
  >
    <Column>
      <CurrencyLogo
        currency={currency}
        size="36px"
        style={{ opacity: isBlockedToken ? blockedTokenOpacity : '1' }}
      />
    </Column>
    <AutoColumn style={{ opacity: isBlockedToken ? blockedTokenOpacity : '1' }}>
      <Row>
        <CurrencyName title={currency.token_name}>{currency.token_name}</CurrencyName>
      </Row>
      <Typography ml="0px" fontSize="12px" fontWeight={300}>
        {currency.token_symbol}
      </Typography>
    </AutoColumn>
    {showCurrencyAmount ? (
      <RowFixed style={{ justifySelf: 'flex-end' }}>
        {address ? balance ? <Balance balance={Number(balance.balance)} /> : <Loader /> : null}
        {isSelected && <CheckIcon />}
      </RowFixed>
    ) : (
      isSelected && (
        <RowFixed style={{ justifySelf: 'flex-end' }}>
          <CheckIcon />
        </RowFixed>
      )
    )}
  </MenuItem>
  )
}

interface TokenRowProps {
  data: Array<TokenType>
  index: number
  style: CSSProperties
}

export const formatAnalyticsEventProperties = (
  token: TokenType,
  index: number,
  data: any[],
  searchQuery: string,
  isAddressSearch: string | false
) => ({
  token_symbol: token?.token_symbol,
  token_address: token?.token_address,
  is_suggested_token: false,
  is_selected_from_list: true,
  scroll_position: '',
  token_list_index: index,
  token_list_length: data.length,
  ...(isAddressSearch === false
    ? { search_token_symbol_input: searchQuery }
    : { search_token_address_input: isAddressSearch }),
})

const LoadingRow = () => (
  <LoadingRows data-testid="loading-rows">
    <div />
    <div />
    <div />
  </LoadingRows>
)

export default function CurrencyList({
  height,
  currencies,
  otherListTokens,
  selectedCurrency,
  onCurrencySelect,
  otherCurrency,
  fixedListRef,
  showCurrencyAmount,
  //isLoading,
  searchQuery,
  isAddressSearch,
  //balances,
}: {
  height: number
  currencies: TokenType[]
  otherListTokens?: TokenType[]
  selectedCurrency?: TokenType | null
  onCurrencySelect: (currency: TokenType, hasWarning?: boolean) => void
  otherCurrency?: TokenType | null
  fixedListRef?: MutableRefObject<FixedSizeList | undefined>
  showCurrencyAmount?: boolean
  //isLoading: boolean
  searchQuery: string
  isAddressSearch: string | false
  //balances: TokenBalancesMap
}) {
  const itemData: TokenType[] = useMemo(() => {
    if (otherListTokens && otherListTokens?.length > 0) {
      return [...currencies, ...otherListTokens]
    }
    return currencies
  }, [currencies, otherListTokens])

  const Row = useCallback(
    function TokenRow({ data, index, style }: TokenRowProps) {
      const row: TokenType = data[index]

      const currency = row

      const isSelected = Boolean(currency && selectedCurrency && selectedCurrency == (currency))
      const otherSelected = Boolean(currency && otherCurrency && otherCurrency == (currency))
      const handleSelect = (hasWarning: boolean) => currency && onCurrencySelect(currency, hasWarning)

      const token = currency

      if (currency) {
        return (
          <CurrencyRow
            style={style}
            currency={currency}
            isSelected={isSelected}
            onSelect={handleSelect}
            otherSelected={otherSelected}
            showCurrencyAmount={showCurrencyAmount}
            eventProperties={formatAnalyticsEventProperties(token, index, data, searchQuery, isAddressSearch)}
            //balance={balance}
          />
        )
      } else {
        return null
      }
    },
    [selectedCurrency, otherCurrency, onCurrencySelect, showCurrencyAmount, searchQuery, isAddressSearch]
  )

  const itemKey = useCallback((index: number, data: typeof itemData) => {
    const currency = data[index]
    return currencyKey(currency)
  }, [])

  return (
    <ListWrapper data-testid="currency-list-wrapper">
      {(
        <FixedSizeList
          height={height}
          ref={fixedListRef as any}
          width="100%"
          itemData={itemData}
          itemCount={itemData.length}
          itemSize={56}
          itemKey={itemKey}
        >
          {Row}
        </FixedSizeList>
      )}
    </ListWrapper>
  )
}
