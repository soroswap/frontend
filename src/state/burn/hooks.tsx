// import { Trans } from '@lingui/macro'
// import { Currency, CurrencyAmount, Percent, Token } from '@uniswap/sdk-core'
// import { Pair } from '@uniswap/v2-sdk'
// import { useWeb3React } from '@web3-react/core'
// import JSBI from 'jsbi'
// import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
// import { ReactNode, useCallback } from 'react'
// import { useAppDispatch, useAppSelector } from 'state/hooks'

import { useSorobanReact } from "@soroban-react/core";
import BigNumber from "bignumber.js";
import { getPairInfo } from "functions/getPairs";
import { formatTokenAmount } from "helpers/format";
import { CurrencyAmount, TokenType } from "interfaces";
import { PairInfo } from "interfaces/pairs";
import tryParseCurrencyAmount from "lib/utils/tryParseCurrencyAmount";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "state/hooks";
import { AppState } from "state/reducer";
import { Field, typeInput } from "./actions";

// import { useTotalSupply } from '../../hooks/useTotalSupply'
// import { useV2Pair } from '../../hooks/useV2Pairs'
// import { useTokenBalances } from '../connection/hooks'
// import { Field, typeInput } from './actions'

export function useBurnState(): AppState['burn'] {
  return useAppSelector((state) => state.burn)
}

export function useDerivedBurnInfo(
  currencyA: TokenType | undefined,
  currencyB: TokenType | undefined
): {
  pair?: any | null
  parsedAmounts: {
    [Field.LIQUIDITY_PERCENT]: any
    [Field.LIQUIDITY]?: any
    [Field.CURRENCY_A]?: CurrencyAmount | undefined
    [Field.CURRENCY_B]?: CurrencyAmount | undefined
  }
  error?: ReactNode
} {
  const sorobanContext = useSorobanReact()
  const { address } = sorobanContext

  const { independentField, typedValue } = useBurnState()

  // pair + totalsupply
  const [pair, setPair] = useState<PairInfo | undefined>()
  useEffect(() => {
    if (address) {
      getPairInfo(currencyA, currencyB, sorobanContext).then((resp) => {
        setPair(resp)
      })
    }
  }, [sorobanContext, address, currencyA, currencyB]);
  
  // const userLiquidity: undefined | CurrencyAmount<Token> = relevantTokenBalances?.[pair?.liquidityToken?.address ?? '']

  const tokens = {
    [Field.CURRENCY_A]: currencyA,
    [Field.CURRENCY_B]: currencyB,
    [Field.LIQUIDITY]: pair?.liquidityToken.token,
  }

  //TODO: For now we will be doing a simpler version of remove liquidity, 
  // we will have to implement a detailed version where the user can input an 
  // specific amount of tokens to remove instead of a percentage, that whats "independantField" is for*
  let percentToRemove = "0"
  // user specified a %
  if (independentField === Field.LIQUIDITY_PERCENT) {
    percentToRemove = typedValue
  }
  // user specified a specific amount of liquidity tokens
  else if (independentField === Field.LIQUIDITY) {
    if (pair?.liquidityToken) {
      const independentAmount = tryParseCurrencyAmount(typedValue, pair.liquidityToken.token)
      if (independentAmount && pair && !BigNumber(independentAmount?.value).isGreaterThan(pair.liquidityToken.userBalance)) {
        percentToRemove = independentAmount.value
      }
    }
  }
  // user specified a specific amount of token a or b
  else {
    if (tokens[independentField]) {
      const independentAmount = tryParseCurrencyAmount(typedValue, tokens[independentField])
      console.log("🚀 « independentAmount:", independentAmount)
      // const liquidityValue = liquidityValues[independentField]
      // if (independentAmount && liquidityValue && !independentAmount.greaterThan(liquidityValue)) {
      //   percentToRemove = new Percent(independentAmount.quotient, liquidityValue.quotient)
      // }
    }
  }

  const getNewCurrencyValue = (currency: TokenType | undefined) => {
    const percent = parseInt(percentToRemove)
    
    if (isNaN(percent)) {
      console.error('Invalid percentToRemove:', percentToRemove);
      return ""; 
    }

    if (pair) {
      if (pair.liquidityToken.userBalance !== undefined) {
        const userBalance = new BigNumber(pair.liquidityToken.userBalance)
        
        // Calculate newUserBalance
        const newUserBalance = userBalance.times(percent / 100);

        if (newUserBalance.isNaN()) {
          // Handle cases where the calculation results in NaN
          return "";
        }

        // Calculate newTokenAmount
        const tokenAmount = currency?.address === pair?.tokenAmounts[0].currency?.address ? pair?.tokenAmounts[0] : pair?.tokenAmounts[1]

        const newTokenAmount = tokenAmount.balance.times(newUserBalance).div(userBalance).dp(tokenAmount.currency?.decimals ?? 7)
        
        return newTokenAmount.toString()
      } else {
        console.error('tokenAmount or pair.liquidityToken.userBalance is undefined.');
        return ""
      }
    } else {
      // console.error('pair is undefined')
      return ""
    }
  }


   const currencyAEndValue = getNewCurrencyValue(currencyA)
   const currencyBEndValue = getNewCurrencyValue(currencyB)


  const parsedAmounts: {
    [Field.LIQUIDITY_PERCENT]: any
    [Field.LIQUIDITY]?: any
    [Field.CURRENCY_A]?: CurrencyAmount | undefined
    [Field.CURRENCY_B]?: CurrencyAmount
  } = {
    [Field.LIQUIDITY_PERCENT]: percentToRemove,
    [Field.LIQUIDITY]: 0,
    [Field.CURRENCY_A]: currencyA ? {currency: currencyA, value: formatTokenAmount(currencyAEndValue)}: undefined,
    [Field.CURRENCY_B]: currencyB ? {currency: currencyB, value: formatTokenAmount(currencyBEndValue)}: undefined,
  }

  let error: ReactNode | undefined
  if (!address) {
    error = "Connect wallet"
  }

  // if (!parsedAmounts[Field.LIQUIDITY] || !parsedAmounts[Field.CURRENCY_A] || !parsedAmounts[Field.CURRENCY_B]) {
  //   error = error ?? <Trans>Enter an amount</Trans>
  // }

  return { pair, parsedAmounts, error }
}

export function useBurnActionHandlers(): {
  onUserInput: (field: Field, typedValue: string) => void
} {
  const dispatch = useAppDispatch()

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }))
    },
    [dispatch]
  )

  return {
    onUserInput,
  }
}
