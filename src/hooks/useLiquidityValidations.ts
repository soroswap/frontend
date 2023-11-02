import useGetMyBalances from './useGetMyBalances';
import useGetLpTokens from './useGetLpTokens';
import { Field } from 'state/mint/actions';
import { TokenType } from 'interfaces';

interface useLiquidityValidationsProps {
  currencies: {
    CURRENCY_A?: TokenType | undefined;
    CURRENCY_B?: TokenType | undefined;
  };
  formattedAmounts: {
    [x: string]: string;
  };
  currencyIdA: string;
  currencyIdB: string;
}

const useLiquidityValidations = ({
  currencies,
  formattedAmounts,
  currencyIdA,
  currencyIdB,
}: useLiquidityValidationsProps) => {
  const { tokenBalancesResponse } = useGetMyBalances();

  const { lpTokens } = useGetLpTokens();

  const hasEnoughBalance = () => {
    const currentCurrencyAValue = formattedAmounts[Field.CURRENCY_A];
    const currentCurrencyBValue = formattedAmounts[Field.CURRENCY_B];

    const myCurrencyABalance =
      tokenBalancesResponse?.balances.find((balance) => balance.address === currencyIdA)?.balance ??
      0;

    const myCurrencyBBalance =
      tokenBalancesResponse?.balances.find((balance) => balance.address === currencyIdB)?.balance ??
      0;

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

  const isPairAlreadyCreated = () => {
    const pairs = lpTokens?.map((obj) => [obj.token_0?.address, obj.token_1?.address]);

    const pairExists = pairs?.find(
      (pair) => pair.includes(currencyIdA) && pair.includes(currencyIdB),
    );

    return !!pairExists;
  };

  const getSupplyButtonText = () => {
    if (!hasSelectedTokens()) return 'Select tokens';
    if (!hasValidInputValues()) return 'Enter an amount';
    if (!hasEnoughBalance()) return 'Insufficient balance';
    if (!isPairAlreadyCreated()) return 'Create';
    return 'Supply';
  };

  return {
    hasEnoughBalance,
    hasSelectedTokens,
    hasValidInputValues,
    isPairAlreadyCreated,
    getSupplyButtonText,
  };
};

export default useLiquidityValidations;
