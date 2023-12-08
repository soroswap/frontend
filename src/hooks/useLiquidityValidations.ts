import { useSorobanReact } from '@soroban-react/core';
import BigNumber from 'bignumber.js';
import { formatTokenAmount } from 'helpers/format';
import { TokenType } from 'interfaces';
import { useEffect, useState } from 'react';
import { Field } from 'state/mint/actions';
import { tokenBalance } from './useBalances';
import useGetLpTokens from './useGetLpTokens';
import useGetNativeTokenBalance from './useGetNativeTokenBalance';

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
}

const useLiquidityValidations = ({
  currencies,
  formattedAmounts,
  currencyIdA,
  currencyIdB,
  pairAddress,
}: useLiquidityValidationsProps) => {
  const sorobanContext = useSorobanReact();
  const { address } = sorobanContext;
  const { lpTokens } = useGetLpTokens();

  const { data } = useGetNativeTokenBalance();
  const [myCurrencyABalance, setMyCurrencyABalance] = useState<string>();
  const [myCurrencyBBalance, setMyCurrencyBBalance] = useState<string>();

  useEffect(() => {
    if (!sorobanContext.address) return;
    tokenBalance(currencyIdA as string, address as string, sorobanContext).then((resp) => {
      setMyCurrencyABalance(formatTokenAmount(resp as BigNumber));
    });
    tokenBalance(currencyIdB as string, address as string, sorobanContext).then((resp) => {
      setMyCurrencyBBalance(formatTokenAmount(resp as BigNumber));
    });
  }, [address, currencyIdA, currencyIdB, sorobanContext]);

  const hasEnoughBalance = () => {
    const currentCurrencyAValue = formattedAmounts[Field.CURRENCY_A];
    const currentCurrencyBValue = formattedAmounts[Field.CURRENCY_B];

    if (Number(currentCurrencyAValue) > Number(myCurrencyABalance)) {
      return false;
    }

    if (Number(currentCurrencyBValue) > Number(myCurrencyBBalance)) {
      return false;
    }

    return true;
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
      const pair = [obj.token_0?.address, obj.token_1?.address];

      return pair.includes(currencyIdA) && pair.includes(currencyIdB);
    });

    return { exists: !!pairAddress, balance: pair?.balance };
  };

  const getSupplyButtonText = () => {
    if (!data?.validAccount) return 'Fund account';
    if (!hasSelectedTokens()) return 'Select tokens';
    if (!hasValidInputValues()) return 'Enter an amount';
    if (!hasEnoughBalance()) return 'Insufficient balance';
    if (!getPairInfo().exists) return 'Create';
    return 'Supply';
  };

  const isButtonDisabled = () => {
    return (
      !hasValidInputValues() || !hasEnoughBalance() || !hasSelectedTokens() || !data?.validAccount
    );
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
  };
};

export default useLiquidityValidations;
