import { SorobanContextType, useSorobanReact } from '@soroban-react/core';
import BigNumber from 'bignumber.js';
import { CSSProperties, MutableRefObject, useCallback, useEffect, useMemo, useState } from 'react';
import { Check } from 'react-feather';
import { FixedSizeList } from 'react-window';
import { AccountResponse } from '@stellar/stellar-sdk/lib/horizon';

import { CircularProgress, Typography, styled } from 'soroswap-ui';
import Column, { AutoColumn } from 'components/Column';
import Loader from 'components/Icons/LoadingSpinner';
import CurrencyLogo from 'components/Logo/CurrencyLogo';
import Row, { RowFixed } from 'components/Row';
import { TokenType } from '../../../interfaces';
import StyledRow from '../../Row';
import { LoadingRows, MenuItem } from '../styleds';

import { tokenBalance, tokenBalancesType } from 'hooks';
import useGetMyBalances from 'hooks/useGetMyBalances';
import useHorizonLoadAccount from 'hooks/useHorizonLoadAccount';

import { isAddress, shortenAddress } from 'helpers/address';
import { formatTokenAmount } from 'helpers/format';
import useSWRImmutable from 'swr/immutable';

function currencyKey(currency: TokenType): string {
  return currency.contract ? currency.contract : 'ETHER';
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
    if (!balance) return 0;

    const [numbers, decimals] = balance.split('.');

    if (numbers.length > 7) return numbers;
    if (numbers.length > 1 && decimals?.length > 3) return `${numbers}.${decimals.slice(0, 3)}`;

    return Number(balance);
  };

  return <StyledBalanceText title={String(balance)}>{formatBalance()}</StyledBalanceText>;
}

export const getCurrencyBalance = async (
  tokenBalancesResponse: tokenBalancesType | null | undefined,
  currency: TokenType,
  sorobanContext: SorobanContextType,
  account: AccountResponse,
) => {
  if (!sorobanContext.address) return '0';

  const findInBalances = tokenBalancesResponse?.balances.find(
    (token) => token.contract === currency.contract,
  );

  //First find if balance is already in the "my balances" list
  if (findInBalances) {
    return findInBalances.balance as string;
  }

  const shouldUseHorizon = isAddress(currency?.issuer!);

  //If it's a classic stellar asset and it's not in the tokens list, then we need to fetch the balance from the horizon server
  if (shouldUseHorizon) {
    const currencyBalance = account?.balances?.find(
      (b: any) => b?.asset_issuer === currency.issuer && b?.asset_code === currency.code,
    )?.balance;

    return currencyBalance;
  } else {
    //Otherwise, we can fetch the balance with contract call
    tokenBalance(currency.contract, sorobanContext.address, sorobanContext).then((resp) => {
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
  balance,
}: {
  currency: TokenType;
  onSelect: (hasWarning: boolean) => void;
  isSelected: boolean;
  otherSelected: boolean;
  showCurrencyAmount?: boolean;
  balance?: number;
  eventProperties: Record<string, unknown>;
  style?: CSSProperties;
}) {
  const shortenSorobanClassicAsset = (currency: TokenType) => {
    if (!currency) return '';
    if (currency?.name && currency.name.toString().length > 56) {
      const addressAsArray = currency.name.toString().split(':');
      if (addressAsArray.length > 1 && isAddress(addressAsArray[1])) {
        const shortAddr: string = shortenAddress(addressAsArray[1]);
        return `${currency.code}:${shortAddr}`;
      }
      return currency.code;
    } else return `${currency.code}`;
  };

  const formattedCurrencyName = (currency: TokenType) => {
    if (!currency.name) return '';

    if (currency.name.length > 12) {
      const formattedName = shortenSorobanClassicAsset(currency);
      return formattedName;
    }
    return currency?.name;
  };
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
      data-testid={`currency__list__${currency.code}`}
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
          <CurrencyName title={currency.name}>{currency.code}</CurrencyName>
        </Row>
        <Typography ml="0px" fontSize="12px" fontWeight={300}>
          {currency.domain ? currency.domain : formattedCurrencyName(currency as TokenType)}
        </Typography>
      </AutoColumn>
      {showCurrencyAmount && balance ? (
        <RowFixed style={{ justifySelf: 'flex-end' }}>
          {<Balance balance={balance.toString() || '0'} />}
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
  symbol: token?.code,
  address: token?.contract,
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
  const sorobanContext = useSorobanReact();
  const { tokenBalancesResponse } = useGetMyBalances();
  const { account } = useHorizonLoadAccount();

  const itemData = useMemo(() => {
    return otherListTokens && otherListTokens.length > 0
      ? [...currencies, ...otherListTokens]
      : currencies;
  }, [currencies, otherListTokens]);

  const fetchBalances = async () => {
    if (
      !account ||
      !sorobanContext.activeChain ||
      !sorobanContext.address ||
      itemData.length === 0
    ) {
      return {};
    }

    const newBalances: Record<string, number> = {};
    for (const currency of itemData) {
      const balance = await getCurrencyBalance(
        tokenBalancesResponse,
        currency,
        sorobanContext,
        account,
      );
      newBalances[currencyKey(currency)] = Number(balance ?? 0);
    }
    return newBalances;
  };

  const { data: balances = {}, error } = useSWRImmutable(
    account ? ['balances', account, tokenBalancesResponse, itemData] : null,
    fetchBalances,
  );

  if (error) {
    console.error('Error loading balances:', error);
  }

  const sortedItemData = useMemo(() => {
    if (!itemData || !Array.isArray(itemData)) {
      return [];
    }
    return [...itemData]
      .map((currency) => ({
        ...currency,
        balance: balances[currencyKey(currency)] || 0,
      }))
      .sort((a, b) => b.balance - a.balance);
  }, [itemData, balances]);

  const Row = useCallback(
    function TokenRow({ data, index, style }: TokenRowProps) {
      const row = data[index];
      const currency = row;

      const isSelected = Boolean(
        currency && selectedCurrency && selectedCurrency.contract === currency.contract,
      );
      const otherSelected = Boolean(
        currency && otherCurrency && otherCurrency.contract === currency.contract,
      );
      const handleSelect = (hasWarning: boolean) =>
        currency && onCurrencySelect(currency, hasWarning);

      if (currency) {
        return (
          <CurrencyRow
            style={style}
            balance={row.balance}
            currency={currency}
            isSelected={isSelected}
            onSelect={handleSelect}
            otherSelected={otherSelected}
            showCurrencyAmount={showCurrencyAmount}
            eventProperties={formatAnalyticsEventProperties(
              currency,
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

  const itemKey = useCallback((index: number, data: typeof sortedItemData) => {
    const currency = data[index];
    return currencyKey(currency);
  }, []);

  return (
    <ListWrapper>
      {isLoading ? (
        <StyledRow justify="center" padding="12px">
          <CircularProgress size="16px" />
        </StyledRow>
      ) : (
        <FixedSizeList
          height={height}
          ref={fixedListRef as any}
          width="100%"
          itemData={sortedItemData}
          itemCount={sortedItemData.length}
          itemSize={56}
          itemKey={itemKey}
        >
          {Row}
        </FixedSizeList>
      )}
    </ListWrapper>
  );
}
