import { useSorobanReact } from 'stellar-react';
import { AppContext } from 'contexts';
import { TokenType } from 'interfaces';
import { useContext } from 'react';
import { InterfaceTrade } from 'state/routing/types';
import { Field } from 'state/swap/actions';
import { relevantTokensType } from './useBalances';
import useGetMyBalances from './useGetMyBalances';
import useGetNativeTokenBalance from './useGetNativeTokenBalance';
import { useAggregator } from './useAggregator';

interface Props {
  currencies: any;
  currencyBalances: { INPUT: string | relevantTokensType; OUTPUT: string | relevantTokensType };
  formattedAmounts: {
    [x: string]: string;
  };
  routeNotFound: boolean;
  onSubmit: () => void;
  trade: InterfaceTrade | undefined;
  networkFees: number;
}

const useSwapMainButton = ({
  currencies,
  currencyBalances,
  formattedAmounts,
  routeNotFound,
  onSubmit,
  trade,
  networkFees,
}: Props) => {
  const sorobanContext = useSorobanReact();
  const { ConnectWalletModal } = useContext(AppContext);
  const { isConnectWalletModalOpen, setConnectWalletModalOpen } = ConnectWalletModal;
  const { data } = useGetNativeTokenBalance();
  const { availableNativeBalance } = useGetMyBalances();
  const { isEnabled: aggregatorEnabled } = useAggregator();

  const { address } = sorobanContext;
  const userBalances = useGetMyBalances();

  const getSwapValues = () => {
    const currencyA: TokenType = currencies[Field.INPUT];
    const currencyB: TokenType = currencies[Field.OUTPUT];

    const isXLMCurrencyA = currencyA?.code === 'XLM';

    let balanceA = userBalances.tokenBalancesResponse?.balances.find(
      (token) => token.contract == currencyA?.contract,
    )?.balance;

    if (isXLMCurrencyA) {
      balanceA = availableNativeBalance(networkFees)
    }

    const balanceB = userBalances.tokenBalancesResponse?.balances.find(
      (token) => token.contract == currencyB?.contract,
    )?.balance;

    const inputA = formattedAmounts[Field.INPUT] ?? 0;
    const inputB = formattedAmounts[Field.OUTPUT] ?? 0;
    const noCurrencySelected = !currencyA || !currencyB;
    const noAmountTyped = !inputA || !inputB;
    const insufficientBalance = Number(inputA) > Number(balanceA);

    const insufficientBalanceToken =
      Number(inputA) > Number(balanceA) ? currencyA?.code : undefined;

    const invalidAmount = Number(inputA) < 0 || Number(inputB) < 0;
    let insufficientLiquidity = !noAmountTyped && !trade;
    if(aggregatorEnabled){
      const distribution = trade?.distribution;
      if (distribution?.every((d) => d.path.length === 0)) {
        insufficientLiquidity = true;
      }
    }
    
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
    if (noAmountTyped) return 'Enter an amount';
    if (insufficientLiquidity) return 'Insufficient liquidity';
    if (data && !data?.validAccount) return 'Fund wallet to sign Transaction';
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
