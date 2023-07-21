// // eslint-disable-next-line no-restricted-imports
// import { t, Trans } from '@lingui/macro'
// import { Trace } from '@uniswap/analytics'
// import { InterfaceEventName, InterfaceModalName } from '@uniswap/analytics-events'
// import { TokenType, Token } from '@uniswap/sdk-core'
// import { useWeb3React } from '@web3-react/core'
// import { useCachedPortfolioBalancesQuery } from 'components/AccountDrawer/PrefetchBalancesWrapper'
// import { sendEvent } from 'components/analytics'
// import { supportedChainIdFromGQLChain } from 'graphql/data/util'
// import useDebounce from 'hooks/useDebounce'
// import { useOnClickOutside } from 'hooks/useOnClickOutside'
// import useToggle from 'hooks/useToggle'
// import useNativeCurrency from 'lib/hooks/useNativeCurrency'
// import { getTokenFilter } from 'lib/hooks/useTokenList/filtering'
// import { TokenBalances, tokenComparator, useSortTokensByQuery } from 'lib/hooks/useTokenList/sorting'
// import { ChangeEvent, KeyboardEvent, RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'
// import AutoSizer from 'react-virtualized-auto-sizer'
// import { FixedSizeList } from 'react-window'
// import { Text } from 'rebass'
// import styled, { useTheme } from 'styled-components/macro'
// import { UserAddedToken } from 'types/tokens'

// import { useDefaultActiveTokens, useIsUserAddedToken, useSearchInactiveTokenLists, useToken } from '../../hooks/Tokens'
// import { CloseIcon, ThemedText } from '../../theme'
// import { isAddress } from '../../utils'
import { Typography, styled, useTheme } from '@mui/material'
import Column from '../Column'
import Row, { RowBetween } from '../Row'
// import CommonBases from './CommonBases'
import { CurrencyRow, formatAnalyticsEventProperties } from './CurrencyList'
import CurrencyList from './CurrencyList'
import { PaddedColumn, SearchInput, Separator } from './styleds'
import { TokenBalancesMap, TokenType } from 'interfaces'
import { useSorobanReact } from '@soroban-react/core'
import { ChangeEvent, RefObject, useCallback, useRef, useState, KeyboardEvent, useMemo, useEffect } from 'react'
import { X } from 'react-feather'
import { CloseButton } from 'components/Buttons/CloseButton'
import { useDefaultActiveTokens, useToken, useTokenBalances, useTokens } from 'hooks'
import { useWindowSize } from 'hooks/useWindowSize'
import { FixedSizeList } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import useDebounce from 'hooks/useDebounce'
import { isAddress } from 'helpers/address'
import { getTokenFilter } from 'lib/hooks/useTokenList/filtering'
import { tokenComparator, useSortTokensByQuery } from 'lib/hooks/useTokenList/sorting'

const ContentWrapper = styled(Column)<{ modalHeight?: number }>`
  overflow: hidden;
  border-radius: 20px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 420px;
  height: ${({ modalHeight }) => modalHeight+'vh' ?? '90px'};
  min-height: 90px;
  background-color: ${({ theme }) => theme.palette.customBackground.surface};
  border: 1px solid #98A1C03d;
`

interface CurrencySearchProps {
  isOpen: boolean
  onDismiss: () => void
  selectedCurrency?: TokenType | null
  onCurrencySelect: (currency: TokenType, hasWarning?: boolean) => void
  otherSelectedCurrency?: TokenType | null
  showCommonBases?: boolean
  showCurrencyAmount?: boolean
  disableNonToken?: boolean
  onlyShowCurrenciesWithBalance?: boolean
}

export function CurrencySearch({
  selectedCurrency,
  onCurrencySelect,
  otherSelectedCurrency,
  showCommonBases,
  showCurrencyAmount,
  disableNonToken,
  onDismiss,
  isOpen,
  onlyShowCurrenciesWithBalance,
}: CurrencySearchProps) {
  const { address, activeChain } = useSorobanReact()
  const sorobanContext = useSorobanReact();
  const theme = useTheme()

  const [tokenLoaderTimerElapsed, setTokenLoaderTimerElapsed] = useState(false)

  // refs for fixed size lists
  const fixedList = useRef<FixedSizeList>()

  const [searchQuery, setSearchQuery] = useState<string>('')
  const debouncedQuery = useDebounce(searchQuery, 200)
  const isAddressSearch = isAddress(debouncedQuery)
  const searchToken = useToken(debouncedQuery)
  const searchTokenIsAdded = false //useIsUserAddedToken(searchToken)

  //This sends and event when a token is searched to google analytics
  // useEffect(() => {
  //   if (isAddressSearch) {
  //     sendEvent({
  //       category: 'Currency Select',
  //       action: 'Search by address',
  //       label: isAddressSearch,
  //     })
  //   }
  // }, [isAddressSearch])

  const defaultTokens = useDefaultActiveTokens()
  const filteredTokens: TokenType[] = useMemo(() => {
    return Object.values(defaultTokens).filter(getTokenFilter(debouncedQuery))
  }, [defaultTokens, debouncedQuery])

  // const { data, loading: balancesAreLoading } = useCachedPortfolioBalancesQuery({ address })
  const { balances: data, loading: balancesAreLoading } = useTokenBalances(address??"", defaultTokens);
  const balances: TokenBalancesMap = useMemo(() => {
    return (
      data.reduce((balanceMap, tokenBalance) => {
        const address = tokenBalance.address
        const usdValue = tokenBalance.usdValue
        const balance = tokenBalance.balance
        balanceMap[address] = { usdValue, balance: balance ?? 0 }
        return balanceMap
      }, {} as TokenBalancesMap) ?? {}
    )
  }, [data])

  const sortedTokens: TokenType[] = useMemo(
    () =>
      !balancesAreLoading
        ? filteredTokens
            .filter((token) => {
              if (onlyShowCurrenciesWithBalance) {
                return Number(balances[token.token_address]?.balance) > 0
              }
              return true
            })
            .sort(tokenComparator.bind(null, balances))
        : filteredTokens,
    [
      balancesAreLoading,
      filteredTokens,
      balances,
      onlyShowCurrenciesWithBalance,
    ]
  )
  const isLoading = Boolean(balancesAreLoading && !tokenLoaderTimerElapsed)

  const searchCurrencies = useSortTokensByQuery(debouncedQuery, sortedTokens)

  const handleCurrencySelect = useCallback(
    (currency: TokenType, hasWarning?: boolean) => {
      onCurrencySelect(currency, hasWarning)
      if (!hasWarning) onDismiss()
    },
    [onDismiss, onCurrencySelect]
  )

  // clear the input on open
  useEffect(() => {
    if (isOpen) setSearchQuery('')
  }, [isOpen])

  // // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>()
  const handleInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value
    console.log("🚀 « input:", input)
    setSearchQuery(input)
    fixedList.current?.scrollTo(0)
  }, [])

  const handleEnter = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        if (searchCurrencies.length > 0) {
          if (
            searchCurrencies[0].token_symbol?.toLowerCase() === debouncedQuery.trim().toLowerCase() ||
            searchCurrencies.length === 1
          ) {
            handleCurrencySelect(searchCurrencies[0])
          }
        }
      }
    },
    [debouncedQuery, searchCurrencies, handleCurrencySelect]
  )

  // Timeout token loader after 3 seconds to avoid hanging in a loading state.
  useEffect(() => {
    const tokenLoaderTimer = setTimeout(() => {
      setTokenLoaderTimerElapsed(true)
    }, 3000)
    return () => clearTimeout(tokenLoaderTimer)
  }, [])

  const { height: windowHeight } = useWindowSize()
  let modalHeight
  if (windowHeight) {
    // Converts pixel units to vh for Modal component
    modalHeight = Math.min(Math.round((680 / windowHeight) * 100), 80)
  }

  return (
    <ContentWrapper modalHeight={modalHeight}>
      <PaddedColumn gap="16px">
        <RowBetween>
          <Typography fontWeight={500} fontSize={16}>
            Select a token
          </Typography>
          <CloseButton onClick={onDismiss} />
        </RowBetween>
        <Row>
          <SearchInput
            type="text"
            id="token-search-input"
            data-testid="token-search-input"
            placeholder={`Search name or paste address`}
            autoComplete="off"
            value={searchQuery}
            ref={inputRef as RefObject<HTMLInputElement>}
            onChange={handleInput}
            onKeyDown={handleEnter}
          />
        </Row>
        {/* {showCommonBases && (
          <CommonBases
            chainId={chainId}
            onSelect={handleCurrencySelect}
            selectedCurrency={selectedCurrency}
            searchQuery={searchQuery}
            isAddressSearch={isAddressSearch}
          />
        )} */}
      </PaddedColumn>
      <Separator />
      {searchToken && !searchTokenIsAdded ? (
        <Column style={{ padding: '20px 0', height: '100%' }}>
          <CurrencyRow
            currency={searchToken}
            isSelected={Boolean(searchToken && selectedCurrency && selectedCurrency == searchToken)}
            onSelect={(hasWarning: boolean) => searchToken && handleCurrencySelect(searchToken, hasWarning)}
            otherSelected={Boolean(searchToken && otherSelectedCurrency && otherSelectedCurrency == searchToken)}
            showCurrencyAmount={showCurrencyAmount}
            eventProperties={formatAnalyticsEventProperties(
              searchToken,
              0,
              [searchToken],
              searchQuery,
              isAddressSearch
            )}
          />
        </Column>
      ) : searchCurrencies?.length > 0 || isLoading ? (
        <div style={{ flex: '1' }}>
          <AutoSizer disableWidth>
              {({ height }: {height: number})  => (
                <CurrencyList
                  height={height}
                  currencies={searchCurrencies}
                  onCurrencySelect={handleCurrencySelect}
                  otherCurrency={otherSelectedCurrency}
                  selectedCurrency={selectedCurrency}
                  fixedListRef={fixedList}
                  showCurrencyAmount={showCurrencyAmount}
                  isLoading={isLoading}
                  searchQuery={searchQuery}
                  isAddressSearch={isAddressSearch}
                  balances={balances}
                />
              )
            }
          </AutoSizer>
        </div>
      ) : (
        <Column style={{ padding: '20px', height: '100%' }}>
          <Typography color={theme.palette.secondary.main} textAlign="center" mb="20px">
            No results found.
          </Typography>
        </Column>
      )}
    </ContentWrapper>
  )
}
