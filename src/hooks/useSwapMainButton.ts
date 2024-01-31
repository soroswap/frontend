import { useSorobanReact } from '@soroban-react/core';
import { ButtonLight, ButtonPrimary } from 'components/Buttons/Button';
import { AppContext } from 'contexts';
import { formatTokenAmount } from 'helpers/format';
import { useContext } from 'react';
import { Field } from 'state/swap/actions';
import { relevantTokensType } from './useBalances';
import { ReservesType } from 'functions/getExpectedAmount';
import BigNumber from 'bignumber.js';
import useGetNativeTokenBalance from './useGetNativeTokenBalance';

interface Props {
  currencies: any;
  currencyBalances: { INPUT: string | relevantTokensType; OUTPUT: string | relevantTokensType };
  formattedAmounts: {
    [x: string]: string;
  };
  routeNotFound: boolean;
  onSubmit: () => void;
  reserves?: ReservesType | null;
}

const useSwapMainButton = ({
  currencies,
  currencyBalances,
  formattedAmounts,
  routeNotFound,
  onSubmit,
  reserves,
}: Props) => {
  const sorobanContext = useSorobanReact();
  const { ConnectWalletModal } = useContext(AppContext);
  const { isConnectWalletModalOpen, setConnectWalletModalOpen } = ConnectWalletModal;
  const { data } = useGetNativeTokenBalance();

  const { address } = sorobanContext;

  const getSwapValues = () => {
    const currencyA = currencies[Field.INPUT];
    const currencyB = currencies[Field.OUTPUT];

    const balanceA =
      formatTokenAmount((currencyBalances[Field.INPUT] as relevantTokensType)?.balance) ?? 0;
    const balanceB =
      formatTokenAmount((currencyBalances[Field.OUTPUT] as relevantTokensType)?.balance) ?? 0;

    const inputA = formattedAmounts[Field.INPUT] ?? 0;
    const inputB = formattedAmounts[Field.OUTPUT] ?? 0;
    const noCurrencySelected = !currencyA || !currencyB;
    const noAmountTyped = !inputA || !inputB;
    const insufficientBalance = Number(inputA) > Number(balanceA);

    const insufficientBalanceToken =
      Number(inputA) > Number(balanceA) ? currencyA?.symbol : undefined;

    const invalidAmount = Number(inputA) < 0 || Number(inputB) < 0;

    let reserveB: string;

    if (reserves?.token0 === currencyA?.address) {
      reserveB = formatTokenAmount(reserves?.reserve1 as BigNumber);
    } else {
      reserveB = formatTokenAmount(reserves?.reserve0 as BigNumber);
    }

    const insufficientLiquidity = Number(inputB) >= Number(reserveB);

    const noLiquidity = reserves && Number(reserveB) === 0;

    return {
      currencyA,
      currencyB,
      balanceA,
      balanceB,
      inputA,
      inputB,
      noCurrencySelected,
      noAmountTyped,
      insufficientBalance,
      invalidAmount,
      insufficientLiquidity,
      noLiquidity: !!noLiquidity,
      insufficientBalanceToken,
    };
  };

  const getMainButtonText = () => {
    const {
      invalidAmount,
      insufficientBalance,
      noAmountTyped,
      noCurrencySelected,
      insufficientLiquidity,
      noLiquidity,
      insufficientBalanceToken,
    } = getSwapValues();
    if (!address) return 'Connect Wallet';
    if (noCurrencySelected) return 'Select a token';
    if (insufficientLiquidity || noLiquidity) return 'Insufficient liquidity';
    if (!data?.validAccount) return 'Fund wallet to sign Transaction';
    if (noAmountTyped) return 'Enter an amount';
    if (insufficientBalance) return 'Insufficient ' + insufficientBalanceToken + ' balance';
    if (invalidAmount) return 'Invalid amount';
    if (routeNotFound) return 'Route not found';

    return 'Swap';
  };

  const isMainButtonDisabled = () => {
    const {
      noCurrencySelected,
      noAmountTyped,
      insufficientBalance,
      invalidAmount,
      insufficientLiquidity,
      noLiquidity,
    } = getSwapValues();

    return (
      !!address &&
      (noCurrencySelected ||
        noAmountTyped ||
        routeNotFound ||
        insufficientBalance ||
        invalidAmount ||
        insufficientLiquidity ||
        noLiquidity ||
        !data?.validAccount)
    );
  };

  const handleMainButtonClick = () => {
    if (!address) {
      setConnectWalletModalOpen(true);
    } else {
      onSubmit();
    }
  };

  return {
    getMainButtonText,
    isMainButtonDisabled,
    handleMainButtonClick,
    getSwapValues,
  };
};

export default useSwapMainButton;
