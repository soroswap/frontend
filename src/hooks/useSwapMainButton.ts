import { useSorobanReact } from '@soroban-react/core';
import { ButtonLight, ButtonPrimary } from 'components/Buttons/Button';
import { AppContext } from 'contexts';
import { formatTokenAmount } from 'helpers/format';
import { useContext } from 'react';
import { Field } from 'state/swap/actions';
import { relevantTokensType } from './useBalances';
import { ReservesType } from 'functions/getExpectedAmount';
import BigNumber from 'bignumber.js';

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
    const insufficientBalance =
      Number(inputA) > Number(balanceA) || Number(inputB) > Number(balanceB);
    const invalidAmount = Number(inputA) < 0 || Number(inputB) < 0;

    let reserveA: string, reserveB: string;

    if (reserves?.token0 === currencyA?.address) {
      reserveA = formatTokenAmount(reserves?.reserve0 as BigNumber);
      reserveB = formatTokenAmount(reserves?.reserve1 as BigNumber);
    } else {
      reserveA = formatTokenAmount(reserves?.reserve1 as BigNumber);
      reserveB = formatTokenAmount(reserves?.reserve0 as BigNumber);
    }

    const insufficientLiquidity =
      Number(inputA) > Number(reserveA) || Number(inputB) > Number(reserveB);

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
    };
  };

  const getMainButtonText = () => {
    const {
      invalidAmount,
      insufficientBalance,
      noAmountTyped,
      noCurrencySelected,
      insufficientLiquidity,
    } = getSwapValues();

    if (routeNotFound) return 'Route not found';
    if (!address) return 'Connect Wallet';
    if (noCurrencySelected) return 'Select a token';
    if (noAmountTyped) return 'Enter an amount';
    if (insufficientBalance) return 'Insufficient balance';
    if (invalidAmount) return 'Invalid amount';
    if (insufficientLiquidity) return 'Insufficient liquidity';

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
        insufficientLiquidity)
    );
  };

  const handleMainButtonClick = () => {
    if (!address) {
      setConnectWalletModalOpen(true);
    } else {
      onSubmit();
    }
  };

  const MainButton = address ? ButtonPrimary : ButtonLight;

  return { getMainButtonText, isMainButtonDisabled, handleMainButtonClick, MainButton };
};

export default useSwapMainButton;
