import { CircularProgress, Typography, styled } from '@mui/material';
import { SorobanContextType, useSorobanReact } from '@soroban-react/core';
import BigNumber from 'bignumber.js';
import Column, { AutoColumn } from 'components/Column';
import Loader from 'components/Icons/LoadingSpinner';
import CurrencyLogo from 'components/Logo/CurrencyLogo';
import Row, { RowFixed } from 'components/Row';
import { isClassicStellarAssetFormat } from 'helpers/address';
import { formatTokenAmount } from 'helpers/format';
import { tokenBalance, tokenBalancesType } from 'hooks';
import { CSSProperties, MutableRefObject, useCallback, useMemo, useState } from 'react';
import { Check } from 'react-feather';
import { FixedSizeList } from 'react-window';
import { TokenType } from '../../../interfaces';
import StyledRow from '../../Row';
import { LoadingRows, MenuItem } from '../styleds';
import { useAllTokens } from 'hooks/tokens/useAllTokens';
import useGetMyBalances from 'hooks/useGetMyBalances';
import useSWRImmutable from 'swr/immutable';
import useHorizonLoadAccount from 'hooks/useHorizonLoadAccount';
import { AccountResponse } from 'stellar-sdk/lib/horizon';

function currencyKey(currency: TokenType): string {
  return currency.address ? currency.address : 'ETHER';
}

const CheckIcon = styled(Check)`
  height: 20px;
  width: 20px;
  margin-left: 4px;
  color: ${({ theme }) => '#4C82FB'};
`;

const StyledBalanceText = styled(Typography)`
  word-break: break-all;
  max-width: 7rem;
  text-overflow: ellipsis;
`;

const CurrencyName = styled(Typography)`
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ListWrapper = styled('div')`
  padding-right: 0.25rem;
`;

function Balance({ balance }: { balance: string }) {
  const formatBalance = () => {
    if (!balance) return '0';

    const [numbers, decimals] = balance.split('.');

    if (numbers.length > 7) return numbers;
    if (numbers.length > 1 && decimals?.length > 3) return `${numbers}.${decimals.slice(0, 3)}`;

    return balance;
  };

  return <StyledBalanceText title={String(balance)}>{formatBalance()}</StyledBalanceText>;
}

const getCurrencyBalance = async (
  tokenBalancesResponse: tokenBalancesType | null | undefined,
  currency: TokenType,
  sorobanContext: SorobanContextType,
  account: AccountResponse,
) => {
  const findInBalances = tokenBalancesResponse?.balances.find(
    (token) => token.address === currency.address,
  );

  //First find if balance is already in the "my balances" list
  if (findInBalances) {
    return findInBalances.balance as string;
  }

  //If not, then we need to check if its a classic stellar asset and if it's not in the tokens list
  const isClasicStellarAsset = isClassicStellarAssetFormat(currency.name);

  const shouldUseHorizon = isClasicStellarAsset;

  //If it's a classic stellar asset and it's not in the tokens list, then we need to fetch the balance from the horizon server
  if (shouldUseHorizon) {
    const [assetCode, issuer] = currency.name.split(':');

    const currencyBalance = account?.balances?.find(
      (b: any) => b?.asset_issuer === issuer && b?.asset_code === assetCode,
    )?.balance;

    return currencyBalance;
  } else {
    //Otherwise, we can fetch the balance with contract call
    tokenBalance(currency.address, sorobanContext.address!, sorobanContext).then((resp) => {
      return formatTokenAmount(resp as BigNumber);
    });
  }
  return '0';
};

export function CurrencyRow({
  currency,
  onSelect,
  isSelected,
  otherSelected,
  style,
  showCurrencyAmount,
}: {
  currency: TokenType;
  onSelect: (hasWarning: boolean) => void;
  isSelected: boolean;
  otherSelected: boolean;
  showCurrencyAmount?: boolean;
  eventProperties: Record<string, unknown>;
  style?: CSSProperties;
}) {
  const sorobanContext = useSorobanReact();

  const { tokenBalancesResponse } = useGetMyBalances();

  const { account } = useHorizonLoadAccount();

  const { data, isLoading } = useSWRImmutable(
    sorobanContext.activeChain && sorobanContext.address && account
      ? ['currencyBalance', tokenBalancesResponse, currency, sorobanContext, account]
      : null,
    ([_, tokenBalancesResponse, currency, sorobanContext, account]) =>
      getCurrencyBalance(tokenBalancesResponse, currency, sorobanContext, account),
  );

  const warning = false;
  const isBlockedToken = false;
  const blockedTokenOpacity = '0.6';

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
          <CurrencyName title={currency.name}>
            {isClassicStellarAssetFormat(currency.name) ? currency.symbol : currency.name}
          </CurrencyName>
        </Row>
        <Typography ml="0px" fontSize="12px" fontWeight={300}>
          {currency.symbol}
        </Typography>
      </AutoColumn>
      {showCurrencyAmount ? (
        <RowFixed style={{ justifySelf: 'flex-end' }}>
          {isLoading ? <Loader /> : <Balance balance={data || '0'} />}
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
  );
}

interface TokenRowProps {
  data: Array<TokenType>;
  index: number;
  style: CSSProperties;
}

export const formatAnalyticsEventProperties = (
  token: TokenType,
  index: number,
  data: any[],
  searchQuery: string,
  isAddressSearch: string | false,
) => ({
  symbol: token?.symbol,
  address: token?.address,
  is_suggested_token: false,
  is_selected_from_list: true,
  scroll_position: '',
  token_list_index: index,
  token_list_length: data.length,
  ...(isAddressSearch === false
    ? { search_token_symbol_input: searchQuery }
    : { search_token_address_input: isAddressSearch }),
});

const LoadingRow = () => (
  <LoadingRows data-testid="loading-rows">
    <div />
    <div />
    <div />
  </LoadingRows>
);

export default function CurrencyList({
  height,
  currencies,
  otherListTokens,
  selectedCurrency,
  onCurrencySelect,
  otherCurrency,
  fixedListRef,
  showCurrencyAmount,
  searchQuery,
  isAddressSearch,
  isLoading,
}: {
  height: number;
  currencies: TokenType[];
  otherListTokens?: TokenType[];
  selectedCurrency?: TokenType | null;
  onCurrencySelect: (currency: TokenType, hasWarning?: boolean) => void;
  otherCurrency?: TokenType | null;
  fixedListRef?: MutableRefObject<FixedSizeList | undefined>;
  showCurrencyAmount?: boolean;
  searchQuery: string;
  isAddressSearch: string | false;
  isLoading?: boolean;
}) {
  const itemData: TokenType[] = useMemo(() => {
    if (otherListTokens && otherListTokens?.length > 0) {
      return [...currencies, ...otherListTokens];
    }
    return currencies;
  }, [currencies, otherListTokens]);

  const Row = useCallback(
    function TokenRow({ data, index, style }: TokenRowProps) {
      const row: TokenType = data[index];

      const currency = row;

      const isSelected = Boolean(
        currency && selectedCurrency && selectedCurrency.address == currency.address,
      );
      const otherSelected = Boolean(
        currency && otherCurrency && otherCurrency.address == currency.address,
      );
      const handleSelect = (hasWarning: boolean) =>
        currency && onCurrencySelect(currency, hasWarning);

      const token = currency;

      if (currency) {
        return (
          <CurrencyRow
            style={style}
            currency={currency}
            isSelected={isSelected}
            onSelect={handleSelect}
            otherSelected={otherSelected}
            showCurrencyAmount={showCurrencyAmount}
            eventProperties={formatAnalyticsEventProperties(
              token,
              index,
              data,
              searchQuery,
              isAddressSearch,
            )}
          />
        );
      } else {
        return null;
      }
    },
    [
      selectedCurrency,
      otherCurrency,
      onCurrencySelect,
      showCurrencyAmount,
      searchQuery,
      isAddressSearch,
    ],
  );

  const itemKey = useCallback((index: number, data: typeof itemData) => {
    const currency = data[index];
    return currencyKey(currency);
  }, []);

  return (
    <ListWrapper data-testid="currency-list-wrapper">
      {isLoading ? (
        <StyledRow justify="center" padding="12px">
          <CircularProgress size="16px" />
        </StyledRow>
      ) : (
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
  );
}
