import { Typography, styled, useTheme } from '@mui/material';
import Column from '../Column';
import Row, { RowBetween } from '../Row';
import { SubHeader } from 'components/Text';
import { isAddress } from 'helpers/address';
import { useDefaultActiveTokens, useToken } from 'hooks';
import useDebounce from 'hooks/useDebounce';
import { TokenType } from 'interfaces';
import { getTokenFilter } from 'lib/hooks/useTokenList/filtering';
import { useSortTokensByQuery } from 'lib/hooks/useTokenList/sorting';
import {
  ChangeEvent,
  KeyboardEvent,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';
import { CloseButton } from '../../components/Buttons/CloseButton';
import CurrencyList, { CurrencyRow, formatAnalyticsEventProperties } from './CurrencyList';
import { PaddedColumn, SearchInput, Separator } from './styleds';
import useGetMyBalances from 'hooks/useGetMyBalances';

const ContentWrapper = styled(Column)<{ modalheight?: number }>`
  overflow: hidden;
  border-radius: 20px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(100% - 40px);
  max-width: 420px;
  height: ${({ modalheight }) => modalheight + 'vh' ?? '90px'};
  min-height: 90px;
  background: ${({ theme }) => `linear-gradient(${theme.palette.customBackground.module}, ${
    theme.palette.customBackground.module
  }) padding-box,
              linear-gradient(150deg, rgba(136,102,221,1) 0%, rgba(${
                theme.palette.mode == 'dark' ? '33,29,50,1' : '255,255,255,1'
              }) 35%, rgba(${
                theme.palette.mode == 'dark' ? '33,29,50,1' : '255,255,255,1'
              }) 65%, rgba(136,102,221,1) 100%) border-box`};
  border: 1px solid transparent;
`;

interface CurrencySearchProps {
  isOpen: boolean;
  onDismiss: () => void;
  selectedCurrency?: TokenType | null;
  onCurrencySelect: (currency: TokenType, hasWarning?: boolean) => void;
  otherSelectedCurrency?: TokenType | null;
  showCommonBases?: boolean;
  showCurrencyAmount?: boolean;
  disableNonToken?: boolean;
  onlyShowCurrenciesWithBalance?: boolean;
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
  const theme = useTheme();

  const [tokenLoaderTimerElapsed, setTokenLoaderTimerElapsed] = useState(false);

  // refs for fixed size lists
  const fixedList = useRef<FixedSizeList>();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedQuery = useDebounce(searchQuery, 200);
  const isAddressSearch = isAddress(debouncedQuery);
  const searchToken = useToken(debouncedQuery);
  const searchTokenIsAdded = false; //useIsUserAddedToken(searchToken)

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

  const { tokenBalancesResponse, isLoading } = useGetMyBalances();

  const defaultTokens = useDefaultActiveTokens();

  const filteredTokens: TokenType[] = useMemo(() => {
    const getTokensSortedByBalance = () => {
      if (!tokenBalancesResponse) return Object.values(defaultTokens);

      return Object.values(defaultTokens).sort((a, b) => {
        const aBalance = tokenBalancesResponse?.balances.find((tokenBalance) => {
          return tokenBalance.address === a.address;
        });
        const bBalance = tokenBalancesResponse?.balances.find((tokenBalance) => {
          return tokenBalance.address === b.address;
        });
        if (aBalance && bBalance) {
          return Number(bBalance.balance) - Number(aBalance.balance);
        }
        return 0;
      });
    };
    return getTokensSortedByBalance().filter(getTokenFilter(debouncedQuery));
  }, [defaultTokens, tokenBalancesResponse, debouncedQuery]);

  const searchCurrencies = useSortTokensByQuery(debouncedQuery, filteredTokens);

  const handleCurrencySelect = useCallback(
    (currency: TokenType, hasWarning?: boolean) => {
      onCurrencySelect(currency, hasWarning);
      if (!hasWarning) onDismiss();
    },
    [onDismiss, onCurrencySelect],
  );

  // clear the input on open
  useEffect(() => {
    if (isOpen) setSearchQuery('');
  }, [isOpen]);

  // // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>();
  const handleInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    console.log('🚀 « input:', input);
    setSearchQuery(input);
    fixedList.current?.scrollTo(0);
  }, []);

  const handleEnter = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        if (searchCurrencies.length > 0) {
          if (
            searchCurrencies[0].symbol?.toLowerCase() === debouncedQuery.trim().toLowerCase() ||
            searchCurrencies.length === 1
          ) {
            handleCurrencySelect(searchCurrencies[0]);
          }
        }
      }
    },
    [debouncedQuery, searchCurrencies, handleCurrencySelect],
  );

  // Timeout token loader after 3 seconds to avoid hanging in a loading state.
  useEffect(() => {
    const tokenLoaderTimer = setTimeout(() => {
      setTokenLoaderTimerElapsed(true);
    }, 3000);
    return () => clearTimeout(tokenLoaderTimer);
  }, []);

  return (
    <ContentWrapper modalheight={80}>
      <PaddedColumn gap="16px">
        <RowBetween>
          <SubHeader fontWeight={500}>Select a token</SubHeader>
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
            onSelect={(hasWarning: boolean) =>
              searchToken && handleCurrencySelect(searchToken, hasWarning)
            }
            otherSelected={Boolean(
              searchToken && otherSelectedCurrency && otherSelectedCurrency == searchToken,
            )}
            showCurrencyAmount={showCurrencyAmount}
            eventProperties={formatAnalyticsEventProperties(
              searchToken,
              0,
              [searchToken],
              searchQuery,
              isAddressSearch,
            )}
          />
        </Column>
      ) : searchCurrencies?.length > 0 ? (
        <div style={{ flex: '1' }}>
          <AutoSizer disableWidth>
            {({ height }: { height: number }) => (
              <CurrencyList
                height={height}
                currencies={searchCurrencies}
                onCurrencySelect={handleCurrencySelect}
                otherCurrency={otherSelectedCurrency}
                selectedCurrency={selectedCurrency}
                fixedListRef={fixedList}
                showCurrencyAmount={showCurrencyAmount}
                searchQuery={searchQuery}
                isAddressSearch={isAddressSearch}
                isLoading={isLoading}
              />
            )}
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
  );
}
