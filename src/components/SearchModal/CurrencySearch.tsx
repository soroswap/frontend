import { Box, CircularProgress, Modal, Typography, styled, useTheme } from 'soroswap-ui';
import { useSorobanReact } from 'soroban-react-stellar-wallets-kit';
import WrapStellarAssetModal from 'components/Modals/WrapStellarAssetModal';
import { SubHeader } from 'components/Text';
import UserAddedTokenModalContent from 'components/UserAddedTokenModal/UserAddedTokenModalContent';
import { isAddress } from 'helpers/address';
import { useAllTokens } from 'hooks/tokens/useAllTokens';
import { useToken } from 'hooks/tokens/useToken';
import { addUserToken } from 'hooks/tokens/utils';
import useDebounce from 'hooks/useDebounce';
import useGetMyBalances from 'hooks/useGetMyBalances';
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
import Column from '../Column';
import Row, { RowBetween } from '../Row';
import CurrencyList, { CurrencyRow, formatAnalyticsEventProperties } from './CurrencyList';
import { PaddedColumn, SearchInput, Separator } from './styleds';
import UnsafeTokenModalContent from 'components/UnsafeTokenModal/UnsafeTokenModal';

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
  const sorobanContext = useSorobanReact();
  const theme = useTheme();

  const [tokenLoaderTimerElapsed, setTokenLoaderTimerElapsed] = useState(false);

  // refs for fixed size lists
  const fixedList = useRef<FixedSizeList>();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedQuery = useDebounce(searchQuery, 200);
  const isAddressSearch = isAddress(debouncedQuery);
  const { token: searchToken, needsWrapping, isLoading: isLoadingToken, tokenIsSafe } = useToken(debouncedQuery);
  const { tokensAsMap: allTokens } = useAllTokens();

  const [showUserAddedTokenModal, setShowUserAddedTokenModal] = useState<boolean>(false);
  const [showUnsafeTokenModal, setShowUnsafeTokenModal] = useState<boolean>(false);
  const [showWrapStellarAssetModal, setShowWrapStellarAssetModal] = useState<boolean>(false);

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

  const { tokensAsMap: defaultTokens } = useAllTokens();

  const filteredTokens: TokenType[] = useMemo(() => {
    const getTokensSortedByBalance = () => {
      if (!tokenBalancesResponse) return Object.values(defaultTokens);

      return Object.values(defaultTokens).sort((a, b) => {
        const aBalance = tokenBalancesResponse?.balances.find((tokenBalance) => {
          return tokenBalance.contract === a.contract;
        });
        const bBalance = tokenBalancesResponse?.balances.find((tokenBalance) => {
          return tokenBalance.contract === b.contract;
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

  const handleConfirmUnsafeToken = () => {
    setShowUnsafeTokenModal(false);
    setShowUserAddedTokenModal(true);
  }

  const handleConfirmAddUserToken = () => {
    if (!searchToken) return;
    addUserToken(searchToken, sorobanContext);
    onCurrencySelect(searchToken);
  };

  const handleSuccessStellarAssetWrap = () => {
    setShowWrapStellarAssetModal(false);
    setShowUserAddedTokenModal(true);
  };

  const handleCurrencySelect = useCallback(
    (currency: TokenType, hasWarning?: boolean) => {
      if (needsWrapping) {
        setShowWrapStellarAssetModal(true);
      } else if (!allTokens[currency.contract] && !tokenIsSafe) {
        setShowUnsafeTokenModal(true);
      } else if (!allTokens[currency.contract]) {
        setShowUserAddedTokenModal(true);
      }
      else {
        onCurrencySelect(currency, hasWarning);
        if (!hasWarning) onDismiss();
      }
    },
    [needsWrapping, allTokens, onCurrencySelect, onDismiss],
  );

  // clear the input on open
  useEffect(() => {
    if (isOpen) setSearchQuery('');
  }, [isOpen]);

  // // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>();
  const handleInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    setSearchQuery(input);
    fixedList.current?.scrollTo(0);
  }, []);

  const handleEnter = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        if (searchCurrencies.length > 0) {
          if (
            searchCurrencies[0].code?.toLowerCase() === debouncedQuery.trim().toLowerCase() ||
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
    <>
      <Modal open={showUnsafeTokenModal} onClose={() => setShowUnsafeTokenModal(false)}>
        <div>
          <UnsafeTokenModalContent
            onConfirm={handleConfirmUnsafeToken}
            onDismiss={() => setShowUnsafeTokenModal(false)}
            isSafe={tokenIsSafe} />
        </div>
      </Modal>
      <Modal open={showUserAddedTokenModal} onClose={() => setShowUserAddedTokenModal(false)}>
        <div>
          <UserAddedTokenModalContent
            onDismiss={() => setShowUserAddedTokenModal(false)}
            onConfirm={handleConfirmAddUserToken}
          />
        </div>
      </Modal>
      <WrapStellarAssetModal
        isOpen={showWrapStellarAssetModal}
        asset={searchToken}
        onDismiss={() => setShowWrapStellarAssetModal(false)}
        onSuccess={handleSuccessStellarAssetWrap}
      />
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
        {searchToken && !isLoading  && !isLoadingToken ? (
          <Column style={{ padding: '20px 0', height: '100%' }}>
            <CurrencyRow
              currency={searchToken}
              isSelected={Boolean(
                searchToken && selectedCurrency && selectedCurrency == searchToken,
              )}
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
        ) : searchCurrencies?.length > 0 && !isLoading ? (
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
        ) : isLoading ? (
          <Box justifyContent="center" display="flex" padding="20px">
            <CircularProgress size="16px" />
          </Box>
        ) : (
          <Column style={{ padding: '20px', height: '100%' }}>
            <Typography color={theme.palette.secondary.main} textAlign="center" mb="20px">
              No results found.
            </Typography>
          </Column>
        )}
      </ContentWrapper>
    </>
  );
}
