import { Trans } from '@lingui/macro'
// import { Currency, CurrencyAmount, Percent, Price, Token } from '@uniswap/sdk-core'
import { TokenType } from 'interfaces'
// import { Pair } from '@uniswap/v2-sdk'
// import { useWeb3React } from '@web3-react/core'
import { SorobanContextType, useSorobanReact } from '@soroban-react/core'
// import JSBI from 'jsbi'
import { CurrencyAmount } from "interfaces";
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'state/hooks'

import { AppState } from '../types'
import { Field, typeInput } from './actions'
import { Token } from 'typescript'
import { reservesBNWithTokens, useReservesBigNumber } from 'hooks/useReserves'
import calculatePoolTokenOptimalAmount from 'functions/calculatePoolTokenOptimalAmount'
import BigNumber from 'bignumber.js'
import { contractInvoke } from '@soroban-react/contracts';
import { scValStrToJs } from 'helpers/convert';
import { FactoryResponseType, FactoryType } from 'interfaces/factory';
import { accountToScVal } from 'helpers/utils';
import { formatTokenAmount } from 'helpers/format';

// const ZERO = JSBI.BigInt(0)

export function useMintState(): AppState['mint'] {
  return useAppSelector((state) => state.mint)
}

export const getFactoryData = async (sorobanContext: SorobanContextType) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/factory`);
    const data = await response.json();

    let factory: FactoryType = {
      factory_address: "",
      factory_id: "",
    };

    const filtered = data?.filter(
      (item: FactoryResponseType) =>
        item.network === sorobanContext?.activeChain?.name?.toLowerCase(),
    );

    if (filtered?.length > 0) {
      factory = {
        factory_address: filtered[0].factory_address,
        factory_id: filtered[0].factory_id,
      };
    }

    return factory;
  } catch (error) {
    // Handle error
    console.error('Error fetching factory data:', error);
    return {
      factory_address: "",
      factory_id: "",
    };
  }
};

export async function getPairContractAddressFromFactory(
  factoryAddress: string,
  sorobanContext: SorobanContextType,
  currencyA: TokenType,
  currencyB: TokenType
) {
  const args = [accountToScVal(currencyA.address), accountToScVal(currencyB.address)]

  try {
    // const factoryAddress = ""
    const pairAddressScval = await contractInvoke({
      contractAddress: factoryAddress,
      method: "get_pair",
      args,
      sorobanContext,
    });
    const pairAddress = scValStrToJs(pairAddressScval?.xdr ?? "") as number ?? 7;

    return pairAddress;
  } catch (error) {
    console.error("Error fetching token balance:", error);
    return 7; // or throw error;
  }
}
// export function useMintActionHandlers(noLiquidity: boolean | undefined): {
export function useMintActionHandlers(noLiquidity: boolean | undefined): {
  onFieldAInput: (typedValue: string) => void
  onFieldBInput: (typedValue: string) => void
} {
  const dispatch = useAppDispatch()

  const onFieldAInput = useCallback(
    (typedValue: string) => {
      dispatch(typeInput({ field: Field.CURRENCY_A, typedValue, noLiquidity: noLiquidity === true }))
    },
    [dispatch, noLiquidity]
  )

  const onFieldBInput = useCallback(
    (typedValue: string) => {
      dispatch(typeInput({ field: Field.CURRENCY_B, typedValue, noLiquidity: noLiquidity === true }))
    },
    [dispatch, noLiquidity]
  )

  return {
    onFieldAInput,
    onFieldBInput,
  }
}

export function useDerivedMintInfo(
  currencyA: TokenType | undefined,
  currencyB: TokenType | undefined
): {
  dependentField: Field
  currencies: { [field in Field]?: TokenType }
  pairAddress: string | undefined
  // pair?: Pair | null
  // pairState: PairState
  // currencyBalances: { [field in Field]?: CurrencyAmount<TokenType> }
  parsedAmounts: { [field in Field]?: CurrencyAmount }
  // price?: Price<TokenType, TokenType>
  noLiquidity?: boolean
  // liquidityMinted?: CurrencyAmount<Token>
  // poolTokenPercentage?: Percent
  error?: ReactNode
} {
  const sorobanContext = useSorobanReact();
  const { address: account } = sorobanContext
  const [factoryAddress, setFactoryAddress] = useState({
    factory_address: "",
    factory_id: "",
  })
  const [pairAddress, setPairAddress] = useState<any>(undefined)
  const [reservesBNToken, setReservesBNToken] = useState<any>(undefined)

  const { independentField, typedValue, otherTypedValue } = useMintState()
  // console.log("state/mint/hooks: independentField, typedValue, otherTypedValue", independentField, typedValue, otherTypedValue)

  const dependentField = independentField === Field.CURRENCY_A ? Field.CURRENCY_B : Field.CURRENCY_A

  // tokens
  const currencies: { [field in Field]?: TokenType } = useMemo(
    () => ({
      [Field.CURRENCY_A]: currencyA ?? undefined,
      [Field.CURRENCY_B]: currencyB ?? undefined,
    }),
    [currencyA, currencyB]
  )
  console.log("state/mint/hooks: currencies:", currencies)

  console.log("state/mint/hooks: currencyA:", currencyA)
  console.log("state/mint/hooks: currencyB:", currencyB)
  // const pairAddress = usePairContractAddress(
  //   !currencyA ? null : currencyA.address,
  //   !currencyB ? null : currencyB.address,
  //   sorobanContext)

  useEffect(() => {
    getFactoryData(sorobanContext).then(response => {

      console.log("state/mint/hooks: factoryAddress response:", response)
      setFactoryAddress(response)
    })

  }, [sorobanContext])

  useEffect(() => {
    if (factoryAddress.factory_address !== "" && currencyA && currencyB) {
      getPairContractAddressFromFactory(factoryAddress.factory_address, sorobanContext, currencyA, currencyB)
        .then((response) => {
          setPairAddress(response)
        })
    }
  }, [currencyA, currencyB, factoryAddress.factory_address, sorobanContext])


  console.log("state/mint/hooks: pairAddress:", pairAddress)
  const reservesBN = useReservesBigNumber(pairAddress ?? "", sorobanContext)
  console.log("state/mint/hooks: reservesBN:", reservesBN, reservesBN.reserve0.toString(), reservesBN.reserve1.toString())

  useEffect(() => {
    if (!pairAddress) return
    reservesBNWithTokens(pairAddress, sorobanContext).then((response) => {
      setReservesBNToken(response)
      console.log("reservesBNWithTokens response:", response)
    })
  }, [pairAddress, sorobanContext])

  console.log("state/mint/hooks: reservesBNToken:", reservesBNToken)

  const noLiquidity: boolean = useMemo(() => {
    return pairAddress === undefined ||
      (reservesBN.reserve0.isZero() && reservesBN.reserve1.isZero())
  }, [pairAddress, reservesBN])
  console.log("state/mint/hooks: noLiquidity:", noLiquidity)

  // // balances
  // const balances = useCurrencyBalances(
  //   account ?? undefined,
  //   useMemo(() => [currencies[Field.CURRENCY_A], currencies[Field.CURRENCY_B]], [currencies])
  // )
  // const currencyBalances: { [field in Field]?: CurrencyAmount<Currency> } = {
  //   [Field.CURRENCY_A]: balances[0],
  //   [Field.CURRENCY_B]: balances[1],
  // }

  // // amounts
  const independentAmount: CurrencyAmount | undefined = tryParseCurrencyAmount(
    typedValue,
    currencies[independentField]
  )
  const dependentAmount: CurrencyAmount | undefined = useMemo(() => {
    if (noLiquidity) {
      if (otherTypedValue && currencies[dependentField]) {
        return tryParseCurrencyAmount(otherTypedValue, currencies[dependentField])
      }
      return undefined
    } else if (independentAmount) {
      // We need the reserves. which are in reservesBN but how to know which corresponds to.
      console.log("state/mint/hooks: here", independentAmount)
      // this is supposing that pair exists
      let reserve0, reserve1;

      if (independentAmount.currency.address == reservesBNToken.token0) {
        reserve0 = reservesBNToken.reserve0
        reserve1 = reservesBNToken.reserve1
      } else {
        reserve0 = reservesBNToken.reserve1
        reserve1 = reservesBNToken.reserve0
      }
      console.log("state/mint/hooks: reserve0: ", reserve0.toString())
      console.log("state/mint/hooks: reserve1: ", reserve1.toString())

      const calculatedPoolTokenOptimalAmount = calculatePoolTokenOptimalAmount(
        BigNumber(independentAmount.value),
        reserve0, // it should be reserve0 if idependentAmount.currency.address == 
        reserve1,
      )
      console.log("state/mint/hooks: calculatedPoolTokenOptimalAmount:", calculatedPoolTokenOptimalAmount.toString())
      const parsedCurrencyAmount = tryParseCurrencyAmount(formatTokenAmount(calculatedPoolTokenOptimalAmount.toString()), currencies[dependentField])
      return parsedCurrencyAmount
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
      return undefined
    }
  }, [noLiquidity, independentAmount, otherTypedValue, currencies, dependentField, reservesBNToken])
  console.log("state/mint/hooks: independentAmount:", independentAmount)
  console.log("state/mint/hooks: dependentAmount:", dependentAmount)

  // const dependentAmount: CurrencyAmount<Currency> | undefined = useMemo(() => {
  //   if (noLiquidity) {
  //     if (otherTypedValue && currencies[dependentField]) {
  //       return tryParseCurrencyAmount(otherTypedValue, currencies[dependentField])
  //     }
  //     return undefined
  //   } else if (independentAmount) {
  //     // we wrap the currencies just to get the price in terms of the other token
  //     const wrappedIndependentAmount = independentAmount?.wrapped
  //     const [tokenA, tokenB] = [currencyA?.wrapped, currencyB?.wrapped]
  //     if (tokenA && tokenB && wrappedIndependentAmount && pair) {
  //       const dependentCurrency = dependentField === Field.CURRENCY_B ? currencyB : currencyA
  //       const dependentTokenAmount =
  //         dependentField === Field.CURRENCY_B
  //           ? pair.priceOf(tokenA).quote(wrappedIndependentAmount)
  //           : pair.priceOf(tokenB).quote(wrappedIndependentAmount)
  //       return dependentCurrency?.isNative
  //         ? CurrencyAmount.fromRawAmount(dependentCurrency, dependentTokenAmount.quotient)
  //         : dependentTokenAmount
  //     }
  //     return undefined
  //   } else {
  //     return undefined
  //   }
  // }, [noLiquidity, otherTypedValue, currencies, dependentField, independentAmount, currencyA, currencyB, pair])

  // const parsedAmounts: { [field in Field]: CurrencyAmount<Currency> | undefined } = useMemo(() => {
  //   return {
  //     [Field.CURRENCY_A]: independentField === Field.CURRENCY_A ? independentAmount : dependentAmount,
  //     [Field.CURRENCY_B]: independentField === Field.CURRENCY_A ? dependentAmount : independentAmount,
  //   }
  // }, [dependentAmount, independentAmount, independentField])
  const parsedAmounts: { [field in Field]: CurrencyAmount | undefined } = useMemo(() => {
    return {
      [Field.CURRENCY_A]: independentField === Field.CURRENCY_A ? independentAmount : dependentAmount,
      [Field.CURRENCY_B]: independentField === Field.CURRENCY_A ? dependentAmount : independentAmount,
    }
  }, [dependentAmount, independentAmount, independentField])

  // const price = useMemo(() => {
  //   if (noLiquidity) {
  //     const { [Field.CURRENCY_A]: currencyAAmount, [Field.CURRENCY_B]: currencyBAmount } = parsedAmounts
  //     if (currencyAAmount?.greaterThan(0) && currencyBAmount?.greaterThan(0)) {
  //       const value = currencyBAmount.divide(currencyAAmount)
  //       return new Price(currencyAAmount.currency, currencyBAmount.currency, value.denominator, value.numerator)
  //     }
  //     return undefined
  //   } else {
  //     const wrappedCurrencyA = currencyA?.wrapped
  //     return pair && wrappedCurrencyA ? pair.priceOf(wrappedCurrencyA) : undefined
  //   }
  // }, [currencyA, noLiquidity, pair, parsedAmounts])

  // // liquidity minted
  // const liquidityMinted = useMemo(() => {
  //   const { [Field.CURRENCY_A]: currencyAAmount, [Field.CURRENCY_B]: currencyBAmount } = parsedAmounts
  //   const [tokenAmountA, tokenAmountB] = [currencyAAmount?.wrapped, currencyBAmount?.wrapped]
  //   if (pair && totalSupply && tokenAmountA && tokenAmountB) {
  //     try {
  //       return pair.getLiquidityMinted(totalSupply, tokenAmountA, tokenAmountB)
  //     } catch (error) {
  //       console.error(error)
  //       return undefined
  //     }
  //   } else {
  //     return undefined
  //   }
  // }, [parsedAmounts, pair, totalSupply])

  // const poolTokenPercentage = useMemo(() => {
  //   if (liquidityMinted && totalSupply) {
  //     return new Percent(liquidityMinted.quotient, totalSupply.add(liquidityMinted).quotient)
  //   } else {
  //     return undefined
  //   }
  // }, [liquidityMinted, totalSupply])

  let error: ReactNode | undefined
  // if (!account) {
  //   error = <Trans>Connect Wallet</Trans>
  // }

  // if (pairState === PairState.INVALID) {
  //   error = error ?? <Trans>Invalid pair</Trans>
  // }

  // if (!parsedAmounts[Field.CURRENCY_A] || !parsedAmounts[Field.CURRENCY_B]) {
  //   error = error ?? <Trans>Enter an amount</Trans>
  // }

  // const { [Field.CURRENCY_A]: currencyAAmount, [Field.CURRENCY_B]: currencyBAmount } = parsedAmounts

  // if (currencyAAmount && currencyBalances?.[Field.CURRENCY_A]?.lessThan(currencyAAmount)) {
  //   error = <Trans>Insufficient {currencies[Field.CURRENCY_A]?.symbol} balance</Trans>
  // }

  // if (currencyBAmount && currencyBalances?.[Field.CURRENCY_B]?.lessThan(currencyBAmount)) {
  //   error = <Trans>Insufficient {currencies[Field.CURRENCY_B]?.symbol} balance</Trans>
  // }

  return {
    dependentField,
    currencies,
    pairAddress,
    // pair,
    // pairState,
    // currencyBalances,
    parsedAmounts,
    // price,
    noLiquidity,
    // liquidityMinted,
    // poolTokenPercentage,
    error,
  }
}

/*
10000000
10000000 000 000 0

10000000
10000000 000 000 0

10000000000
10000000000
*/