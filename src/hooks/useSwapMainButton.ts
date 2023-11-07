import { useSorobanReact } from '@soroban-react/core';
import { ButtonLight, ButtonPrimary } from 'components/Buttons/Button';
import { AppContext } from 'contexts';
import { formatTokenAmount } from 'helpers/format';
import { useContext } from 'react';
import { Field } from 'state/swap/actions';

interface Props {
  currencies: any;
  currencyBalances: {
    [x: string]: {
      balance: string;
    };
  };
  formattedAmounts: {
    [x: string]: string;
  };
  routeNotFound: boolean;
  onSubmit: () => void;
}

const useSwapMainButton = ({
  currencies,
  currencyBalances,
  formattedAmounts,
  routeNotFound,
  onSubmit,
}: Props) => {
  const sorobanContext = useSorobanReact();
  const { ConnectWalletModal } = useContext(AppContext);
  const { isConnectWalletModalOpen, setConnectWalletModalOpen } = ConnectWalletModal;

  const { address } = sorobanContext;

  const getSwapValues = () => {
    const currencyA = currencies[Field.INPUT];
    const currencyB = currencies[Field.OUTPUT];

    const balanceA = formatTokenAmount(currencyBalances[Field.INPUT]?.balance) ?? 0;
    const balanceB = formatTokenAmount(currencyBalances[Field.OUTPUT]?.balance) ?? 0;

    const inputA = formattedAmounts[Field.INPUT] ?? 0;
    const inputB = formattedAmounts[Field.OUTPUT] ?? 0;

    const noCurrencySelected = !currencyA || !currencyB;
    const noAmountTyped = !inputA || !inputB;
    const insufficientBalance =
      Number(inputA) > Number(balanceA) || Number(inputB) > Number(balanceB);
    const invalidAmount = Number(inputA) < 0 || Number(inputB) < 0;

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
    };
  };

  const getMainButtonText = () => {
    const { invalidAmount, insufficientBalance, noAmountTyped, noCurrencySelected } =
      getSwapValues();

    if (routeNotFound) return 'Route not found';
    if (!address) return 'Connect Wallet';
    if (noCurrencySelected) return 'Select a token';
    if (noAmountTyped) return 'Enter an amount';
    if (insufficientBalance) return 'Insufficient balance';
    if (invalidAmount) return 'Invalid amount';

    return 'Swap';
  };

  const isMainButtonDisabled = () => {
    const { noCurrencySelected, noAmountTyped, insufficientBalance, invalidAmount } =
      getSwapValues();

    return (
      !!address &&
      (noCurrencySelected || noAmountTyped || routeNotFound || insufficientBalance || invalidAmount)
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
