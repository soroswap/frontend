import { useSorobanReact } from '@soroban-react/core';
import { AppContext } from 'contexts';
import { formatTokenAmount } from 'helpers/format';
import { useContext } from 'react';
import { InterfaceTrade } from 'state/routing/types';
import { Field } from 'state/swap/actions';
import { relevantTokensType } from './useBalances';
import useGetNativeTokenBalance from './useGetNativeTokenBalance';

interface Props {
  currencies: any;
  currencyBalances: { INPUT: string | relevantTokensType; OUTPUT: string | relevantTokensType };
  formattedAmounts: {
    [x: string]: string;
  };
  routeNotFound: boolean;
  onSubmit: () => void;
  trade: InterfaceTrade | undefined;
}

const useSwapMainButton = ({
  currencies,
  currencyBalances,
  formattedAmounts,
  routeNotFound,
  onSubmit,
  trade,
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
      Number(inputA) > Number(balanceA) ? currencyA?.code : undefined;

    const invalidAmount = Number(inputA) < 0 || Number(inputB) < 0;

    const insufficientLiquidity = !noAmountTyped && !trade;

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
      insufficientBalanceToken,
    } = getSwapValues();
    if (!address) return 'Connect Wallet';
    if (noCurrencySelected) return 'Select a token';
    if (insufficientLiquidity) return 'Insufficient liquidity';
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
    } = getSwapValues();

    return (
      !!address &&
      (noCurrencySelected ||
        noAmountTyped ||
        routeNotFound ||
        insufficientBalance ||
        invalidAmount ||
        insufficientLiquidity ||
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
