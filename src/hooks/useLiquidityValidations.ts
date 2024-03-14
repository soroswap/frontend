import { useSorobanReact } from '@soroban-react/core';
import { TokenType } from 'interfaces';
import { Field } from 'state/mint/actions';
import useGetLpTokens from './useGetLpTokens';
import useGetNativeTokenBalance from './useGetNativeTokenBalance';
import useGetMyBalances from './useGetMyBalances';
import { useSWRConfig } from 'swr';
import useHorizonLoadAccount from './useHorizonLoadAccount';
import { useEffect } from 'react';
import { useUserAddedTokens } from './tokens/useUserAddedTokens';

interface useLiquidityValidationsProps {
  currencies: {
    CURRENCY_A?: TokenType | undefined;
    CURRENCY_B?: TokenType | undefined;
  };
  formattedAmounts: {
    [x: string]: string;
  };
  currencyIdA?: string;
  currencyIdB?: string;
  pairAddress?: string;
  needsWrappingA?: boolean;
  needsWrappingB?: boolean;
}

const useLiquidityValidations = ({
  currencies,
  formattedAmounts,
  currencyIdA,
  currencyIdB,
  pairAddress,
  needsWrappingA,
  needsWrappingB,
}: useLiquidityValidationsProps) => {
  const sorobanContext = useSorobanReact();
  const { address } = sorobanContext;
  const { lpTokens } = useGetLpTokens();

  const { data } = useGetNativeTokenBalance();

  const { tokenBalancesResponse } = useGetMyBalances();

  const myCurrencyABalance =
    tokenBalancesResponse?.balances.find((token) => token.contract === currencyIdA)?.balance ?? '0';

  const myCurrencyBBalance =
    tokenBalancesResponse?.balances.find((token) => token.contract === currencyIdB)?.balance ?? '0';

  const hasEnoughBalance = () => {
    const currentCurrencyAValue = formattedAmounts[Field.CURRENCY_A];
    const currentCurrencyBValue = formattedAmounts[Field.CURRENCY_B];

    if (Number(currentCurrencyAValue) > Number(myCurrencyABalance)) {
      return [false, currencies[Field.CURRENCY_A]];
    }

    if (Number(currentCurrencyBValue) > Number(myCurrencyBBalance)) {
      return [false, currencies[Field.CURRENCY_B]];
    }

    return [true, null];
  };

  const hasSelectedTokens = () => {
    const isCurrencyASelected = currencies[Field.CURRENCY_A];
    const isCurrencyBSelected = currencies[Field.CURRENCY_B];

    return isCurrencyASelected && isCurrencyBSelected;
  };

  const hasValidInputValues = () => {
    const isValidCurrencyAValue = Number(formattedAmounts[Field.CURRENCY_A]) > 0;
    const isValidCurrencyBValue = Number(formattedAmounts[Field.CURRENCY_B]) > 0;

    return isValidCurrencyAValue && isValidCurrencyBValue;
  };

  const getPairInfo = () => {
    const pair = lpTokens?.find((obj) => {
      const pair = [obj.token_0?.contract, obj.token_1?.contract];

      return pair.includes(currencyIdA) && pair.includes(currencyIdB);
    });

    return { exists: !!pairAddress, balance: pair?.balance };
  };

  const needsWrap = needsWrappingA || needsWrappingB;

  const getNeedsWrappingToken = () => {
    if (needsWrappingA) return currencies[Field.CURRENCY_A];
    if (needsWrappingB) return currencies[Field.CURRENCY_B];
  };

  const getSupplyButtonText = () => {
    const [enoughBalance, token] = hasEnoughBalance();

    if (!data?.validAccount) return 'Fund account';
    if (!hasSelectedTokens()) return 'Select tokens';
    if (!hasValidInputValues()) return 'Enter an amount';
    if (needsWrap) return `Wrap ${getNeedsWrappingToken()?.code}` || 'Wrap token';
    if (!enoughBalance) return `Insufficient ${(token as TokenType)?.code} balance`;
    if (!getPairInfo().exists) return 'Create';
    return 'Supply';
  };

  const isButtonDisabled = () => {
    const [enoughBalance, token] = hasEnoughBalance();

    return !hasValidInputValues() || !enoughBalance || !hasSelectedTokens() || !data?.validAccount;
  };

  const getModalTitleText = () => {
    const pairInfo = getPairInfo();

    if (pairInfo.exists) {
      if (Number(pairInfo.balance) === 0) return 'You are the first to add liquidity';
      return 'Add liquidity';
    }
    return 'You are creating a pool';
  };

  return {
    hasEnoughBalance,
    hasSelectedTokens,
    hasValidInputValues,
    getSupplyButtonText,
    getPairInfo,
    getModalTitleText,
    isButtonDisabled,
    getNeedsWrappingToken,
    needsWrap,
  };
};

export default useLiquidityValidations;
