import { useSorobanReact } from 'soroban-react-stellar-wallets-kit';
import BigNumber from 'bignumber.js';
import { getTotalShares } from 'functions/LiquidityPools';
import getLpTokensAmount from 'functions/getLpTokensAmount';
import { formatTokenAmount } from 'helpers/format';
import { TokenType } from 'interfaces';
import { Field } from 'state/mint/actions';
import { reservesBNWithTokens } from './useReserves';

interface UseCalculateLpToReceiveProps {
  pairAddress?: string;
  formattedAmounts: { [key: string]: string };
  baseCurrency: TokenType | null | undefined;
}

const useCalculateLpToReceive = ({
  pairAddress,
  formattedAmounts,
  baseCurrency,
}: UseCalculateLpToReceiveProps) => {
  const sorobanContext = useSorobanReact();

  const getLpToBeReceived = async () => {
    let pairReserves = null;
    let reserve0 = BigNumber(0);
    let reserve1 = BigNumber(0);

    if (pairAddress) {
      pairReserves = await reservesBNWithTokens(pairAddress, sorobanContext);

      if (pairReserves.token0 === baseCurrency?.contract) {
        reserve0 = pairReserves.reserve0 ?? BigNumber(0);
        reserve1 = pairReserves.reserve1 ?? BigNumber(0);
      } else {
        reserve0 = pairReserves.reserve1 ?? BigNumber(0);
        reserve1 = pairReserves.reserve0 ?? BigNumber(0);
      }
    }

    const amount = await getLpTokensAmount(
      BigNumber(formattedAmounts[Field.CURRENCY_A]).shiftedBy(7),
      reserve0,
      BigNumber(formattedAmounts[Field.CURRENCY_B]).shiftedBy(7),
      reserve1,
      pairAddress ?? '',
      sorobanContext,
    );

    return amount ?? BigNumber(0);
  };

  const getLpAmountAndPercentage = async () => {
    const amountToReceive = await getLpToBeReceived();
    const amount = formatTokenAmount(amountToReceive);
    let percentage = 100;

    if (pairAddress) {
      const totalShares = await getTotalShares(pairAddress, sorobanContext);

      const total = formatTokenAmount(totalShares as BigNumber);

      const futureTotal = Number(total) + Number(amount);

      percentage = (Number(amount) / Number(futureTotal)) * 100;
    }
    return { amount, percentage };
  };

  return { getLpAmountAndPercentage, getLpToBeReceived };
};

export default useCalculateLpToReceive;
