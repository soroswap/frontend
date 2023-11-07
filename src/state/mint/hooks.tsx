// import { Currency, CurrencyAmount, Percent, Price, Token } from '@uniswap/sdk-core'
import { TokenType } from 'interfaces';
// import { Pair } from '@uniswap/v2-sdk'
// import { useWeb3React } from '@web3-react/core'
import { useSorobanReact } from '@soroban-react/core';
// import JSBI from 'jsbi'
import { CurrencyAmount } from 'interfaces';
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'state/hooks';

import BigNumber from 'bignumber.js';
import calculatePoolTokenOptimalAmount from 'functions/calculatePoolTokenOptimalAmount';
import { getPairAddress } from 'functions/getPairAddress';
import { formatTokenAmount } from 'helpers/format';
import { useFactory } from 'hooks';
import { reservesBNWithTokens, reservesBigNumber } from 'hooks/useReserves';
import { AppState } from 'state/reducer';
import { Field, typeInput } from './actions';

// const ZERO = JSBI.BigInt(0)

export function useMintState(): AppState['mint'] {
  return useAppSelector((state) => state.mint);
}

// export function useMintActionHandlers(noLiquidity: boolean | undefined): {
export function useMintActionHandlers(noLiquidity: boolean | undefined): {
  onFieldAInput: (typedValue: string) => void;
  onFieldBInput: (typedValue: string) => void;
} {
  const dispatch = useAppDispatch();

  const onFieldAInput = useCallback(
    (typedValue: string) => {
      dispatch(
        typeInput({ field: Field.CURRENCY_A, typedValue, noLiquidity: noLiquidity === true }),
      );
    },
    [dispatch, noLiquidity],
  );

  const onFieldBInput = useCallback(
    (typedValue: string) => {
      dispatch(
        typeInput({ field: Field.CURRENCY_B, typedValue, noLiquidity: noLiquidity === true }),
      );
    },
    [dispatch, noLiquidity],
  );

  return {
    onFieldAInput,
    onFieldBInput,
  };
}

export function useDerivedMintInfo(
  currencyA: TokenType | undefined,
  currencyB: TokenType | undefined,
): {
  dependentField: Field;
  currencies: { [field in Field]?: TokenType };
  pairAddress: string | undefined;
  parsedAmounts: { [field in Field]?: CurrencyAmount };
  noLiquidity?: boolean;
  error?: ReactNode;
} {
  const sorobanContext = useSorobanReact();
  const { address: account } = sorobanContext;

  const factoryAddress = useFactory(sorobanContext);

  const [pairAddress, setPairAddress] = useState<any>(undefined);
  const [reservesBNToken, setReservesBNToken] = useState<any>(undefined);

  const { independentField, typedValue, otherTypedValue } = useMintState();

  const dependentField =
    independentField === Field.CURRENCY_A ? Field.CURRENCY_B : Field.CURRENCY_A;

  const currencies: { [field in Field]?: TokenType } = useMemo(
    () => ({
      [Field.CURRENCY_A]: currencyA ?? undefined,
      [Field.CURRENCY_B]: currencyB ?? undefined,
    }),
    [currencyA, currencyB],
  );

  useEffect(() => {
    if (!currencyA || !currencyB) return;
    if (factoryAddress.factory_address !== '' && currencyA && currencyB) {
      getPairAddress(currencyA.address, currencyB.address, sorobanContext)
        .then((response) => {
          setPairAddress(response);
        })
        .catch(() => setPairAddress(undefined));
    }
  }, [currencyA, currencyB, factoryAddress.factory_address, sorobanContext]);

  const [reservesBN, setReservesBN] = useState<
    { reserve0: BigNumber; reserve1: BigNumber } | undefined
  >();
  useEffect(() => {
    if (sorobanContext.activeChain && sorobanContext.address) {
      reservesBigNumber(pairAddress ?? '', sorobanContext)
        .then((resp) => {
          setReservesBN(resp);
        })
        .catch((err) => {});
    }
  }, [pairAddress, sorobanContext]);

  useEffect(() => {
    if (!pairAddress || !sorobanContext.address) return;
    reservesBNWithTokens(pairAddress, sorobanContext)
      .then((response) => {
        setReservesBNToken(response);
        //
      })
      .catch((err) => {});
  }, [pairAddress, sorobanContext]);

  const noLiquidity: boolean | undefined = useMemo(() => {
    return (
      pairAddress === undefined || (reservesBN?.reserve0.isZero() && reservesBN?.reserve1.isZero())
    );
  }, [pairAddress, reservesBN]);

  const independentAmount: CurrencyAmount | undefined = useMemo(() => {
    return tryParseCurrencyAmount(typedValue, currencies[independentField]);
  }, [currencies, independentField, typedValue]);

  const dependentAmount: CurrencyAmount | undefined = useMemo(() => {
    if (!reservesBNToken) return undefined;
    if (noLiquidity) {
      if (otherTypedValue && currencies[dependentField]) {
        return tryParseCurrencyAmount(otherTypedValue, currencies[dependentField]);
      }
      return undefined;
    } else if (independentAmount) {
      // We need the reserves. which are in reservesBN but how to know which corresponds to.
      //
      // this is supposing that pair exists
      let reserve0, reserve1;

      if (independentAmount.currency.address == reservesBNToken.token0) {
        reserve0 = reservesBNToken.reserve0;
        reserve1 = reservesBNToken.reserve1;
      } else {
        reserve0 = reservesBNToken.reserve1;
        reserve1 = reservesBNToken.reserve0;
      }

      const calculatedPoolTokenOptimalAmount = calculatePoolTokenOptimalAmount(
        BigNumber(independentAmount.value),
        reserve0, // it should be reserve0 if idependentAmount.currency.address ==
        reserve1,
      );
      //
      const parsedCurrencyAmount = tryParseCurrencyAmount(
        formatTokenAmount(calculatedPoolTokenOptimalAmount.toString()),
        currencies[dependentField],
      );
      return parsedCurrencyAmount;
      //   // we wrap the currencies just to get the price in terms of the other token
      //   const wrappedIndependentAmount = independentAmount?.wrapped
      //   const [tokenA, tokenB] = [currencyA?.wrapped, currencyB?.wrapped]
      //   if (tokenA && tokenB && wrappedIndependentAmount && pair) {
      //     const dependentCurrency = dependentField === Field.CURRENCY_B ? currencyB : currencyA
      //     const dependentTokenAmount =
      //       dependentField === Field.CURRENCY_B
      //         ? pair.priceOf(tokenA).quote(wrappedIndependentAmount)
      //         : pair.priceOf(tokenB).quote(wrappedIndependentAmount)
      //     return dependentCurrency?.isNative
      //       ? CurrencyAmount.fromRawAmount(dependentCurrency, dependentTokenAmount.quotient)
      //       : dependentTokenAmount
    } else {
      return undefined;
    }
  }, [
    noLiquidity,
    independentAmount,
    otherTypedValue,
    currencies,
    dependentField,
    reservesBNToken,
  ]);

  const parsedAmounts: { [field in Field]: CurrencyAmount | undefined } = useMemo(() => {
    return {
      [Field.CURRENCY_A]:
        independentField === Field.CURRENCY_A ? independentAmount : dependentAmount,
      [Field.CURRENCY_B]:
        independentField === Field.CURRENCY_A ? dependentAmount : independentAmount,
    };
  }, [dependentAmount, independentAmount, independentField]);

  let error: ReactNode | undefined;

  return {
    dependentField,
    currencies,
    pairAddress,
    parsedAmounts,
    noLiquidity,
    error,
  };
}
