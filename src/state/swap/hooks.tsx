import { useSorobanReact } from '@soroban-react/core';
import BigNumber from 'bignumber.js';
import { isAddress } from 'helpers/address';
import { relevantTokensType, tokenBalances } from 'hooks';
import { useToken } from 'hooks/tokens/useToken';
import { useBestTrade } from 'hooks/useBestTrade';
import { TokenType } from 'interfaces';
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount';
import { ParsedQs } from 'qs';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { AnyAction } from 'redux';
import { TradeType } from 'state/routing/types';
import { useUserSlippageToleranceWithDefault } from 'state/user/hooks';
import { Field, selectCurrency, setRecipient, switchCurrencies, typeInput } from './actions';
import { SwapState } from './reducer';
import useHorizonLoadAccount from 'hooks/useHorizonLoadAccount';

export function useSwapActionHandlers(dispatch: React.Dispatch<AnyAction>): {
  onCurrencySelection: (field: Field, currency: TokenType) => void;
  onSwitchTokens: () => void;
  onUserInput: (field: Field, typedValue: string) => void;
  onChangeRecipient: (recipient: string | null) => void;
} {
  const onCurrencySelection = useCallback(
    (field: Field, currency: TokenType) => {
      dispatch(
        selectCurrency({
          field,
          currencyId: currency.contract ? currency.contract : '',
        }),
      );
    },
    [dispatch],
  );

  const onSwitchTokens = useCallback(() => {
    dispatch(switchCurrencies());
  }, [dispatch]);

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }));
    },
    [dispatch],
  );

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      dispatch(setRecipient({ recipient }));
    },
    [dispatch],
  );

  return {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
    onChangeRecipient,
  };
}

export type SwapInfo = {
  currencies: { [field in Field]?: TokenType | null };
  currencyBalances: any; //{ [field in Field]?: CurrencyAmount<Currency> }
  parsedAmount?: any; //CurrencyAmount<Currency>
  inputError?: ReactNode;
  trade: {
    trade?: any; //InterfaceTrade
    state: any; //TradeState
    uniswapXGasUseEstimateUSD?: number;
    error?: any;
  };
  allowedSlippage: any; //Percent
  autoSlippage: any; //Percent
};

// from the current swap inputs, compute the best trade and return it.

export function useDerivedSwapInfo(state: SwapState) {
  const sorobanContext = useSorobanReact();
  const { address: account } = sorobanContext;

  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    recipient,
  } = state;

  const { token: inputCurrency } = useToken(inputCurrencyId!);
  //
  const { token: outputCurrency } = useToken(outputCurrencyId!);
  const recipientLookup = { address: '' }; //TODO: Use ENS useENS(recipient ?? undefined)
  //
  const to: string | null | undefined = account; //recipient === null ? account : recipientLookup.contract) ?? null

  const tokensArray = useMemo(() => {
    return inputCurrency && outputCurrency ? [inputCurrency, outputCurrency] : undefined;
  }, [inputCurrency, outputCurrency]);

  const [relevantTokenBalances, setRelevantTokenBalances] = useState<
    relevantTokensType[] | undefined
  >();

  const { account: horizonAccount } = useHorizonLoadAccount();
  useEffect(() => {
    if (account) {
      tokenBalances(account, tokensArray, sorobanContext, horizonAccount).then((balances) => {
        if (balances != undefined) {
          setRelevantTokenBalances(balances.balances);
        }
      });
    }
  }, [account, tokensArray, sorobanContext, horizonAccount]);

  const isExactIn: boolean = independentField === Field.INPUT;
  //

  const parsedAmount = useMemo(
    () =>
      tryParseCurrencyAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined),
    [inputCurrency, isExactIn, outputCurrency, typedValue],
  );

  const trade = useBestTrade(
    isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT,
    parsedAmount,
    (isExactIn ? outputCurrency : inputCurrency) ?? undefined,
    account,
  );

  const currencyBalances = useMemo(
    () => ({
      [Field.INPUT]: relevantTokenBalances ? relevantTokenBalances[0] : '',
      [Field.OUTPUT]: relevantTokenBalances ? relevantTokenBalances[1] : '',
    }),
    [relevantTokenBalances],
  );

  const currencies: { [field in Field]?: TokenType | null } = useMemo(
    () => ({
      [Field.INPUT]: inputCurrency,
      [Field.OUTPUT]: outputCurrency,
    }),
    [inputCurrency, outputCurrency],
  );

  // // allowed slippage for classic trades is either auto slippage, or custom user defined slippage if auto slippage disabled
  // const classicAutoSlippage = useAutoSlippageTolerance(isClassicTrade(trade.trade) ? trade.trade : undefined)

  // // slippage for uniswapx trades is defined by the quote response
  // const uniswapXAutoSlippage = isUniswapXTrade(trade.trade) ? trade.trade.slippageTolerance : undefined

  // // Uniswap interface recommended slippage amount
  // const autoSlippage = uniswapXAutoSlippage ?? classicAutoSlippage
  // const classicAllowedSlippage = useUserSlippageToleranceWithDefault(autoSlippage)
  const classicAllowedSlippage = useUserSlippageToleranceWithDefault(0.5);

  // // slippage amount used to submit the trade
  // const allowedSlippage = uniswapXAutoSlippage ?? classicAllowedSlippage
  const allowedSlippage = classicAllowedSlippage;

  const inputError = useMemo(() => {
    let inputError: ReactNode | undefined;

    if (!account) {
      inputError = 'Connect Wallet';
    }

    if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
      inputError = inputError ?? 'Select a token';
    }

    if (!parsedAmount) {
      inputError = inputError ?? 'Enter an amount';
    }

    const formattedTo = isAddress(to!);
    if (!to || !formattedTo) {
      inputError = inputError ?? 'Enter a recipient';
    }

    //if amountin is more than reserves | expectedoutput is infinity
    if (
      trade.trade?.outputAmount?.value.includes('Infinity') ||
      trade.trade?.outputAmount?.value.includes('-')
    ) {
      inputError = 'Insufficient liquidity for this trade.';
    }

    const [balanceIn, maxAmountIn]: [string | relevantTokensType, string | number] = [
      currencyBalances[Field.INPUT],
      trade.trade?.inputAmount?.value ?? 0,
    ];
    if (
      typeof balanceIn !== 'string' &&
      BigNumber(balanceIn.balance).isLessThanOrEqualTo(BigNumber(maxAmountIn))
    ) {
      inputError = `Insufficient ${balanceIn.code} balance`;
    }

    return inputError;
  }, [account, currencies, currencyBalances, parsedAmount, to, trade]);

  return useMemo(
    () => ({
      currencies,
      currencyBalances,
      parsedAmount,
      inputError,
      trade,
      allowedSlippage,
    }),
    [currencies, currencyBalances, parsedAmount, inputError, trade, allowedSlippage],
  );
}

function parseCurrencyFromURLParameter(urlParam: ParsedQs[string]): string {
  if (typeof urlParam === 'string') {
    const valid = isAddress(urlParam);
    if (valid) return valid;
    const upper = urlParam.toUpperCase();
    if (upper === 'ETH') return 'ETH';
    // if (upper in TOKEN_SHORTHANDS) return upper
  }
  return '';
}

function parseTokenAmountURLParameter(urlParam: any): string {
  return typeof urlParam === 'string' && !isNaN(parseFloat(urlParam)) ? urlParam : '';
}

function parseIndependentFieldURLParameter(urlParam: any): Field {
  return typeof urlParam === 'string' && urlParam.toLowerCase() === 'output'
    ? Field.OUTPUT
    : Field.INPUT;
}

const ENS_NAME_REGEX =
  /^[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)?$/;
const ADDRESS_REGEX = /^[A-Z0-9]{56}$/;

//Validates and addres or domain recipient
function validatedRecipient(recipient: any): string | null {
  if (typeof recipient !== 'string') return null;
  const address = isAddress(recipient);
  if (address) return address;
  if (ENS_NAME_REGEX.test(recipient)) return recipient;
  if (ADDRESS_REGEX.test(recipient)) return recipient;
  return null;
}

export function queryParametersToSwapState(parsedQs: ParsedQs): SwapState {
  let inputCurrency = parseCurrencyFromURLParameter(parsedQs.inputCurrency);
  let outputCurrency = parseCurrencyFromURLParameter(parsedQs.outputCurrency);
  const typedValue = parseTokenAmountURLParameter(parsedQs.exactAmount);
  const independentField = parseIndependentFieldURLParameter(parsedQs.exactField);

  if (
    inputCurrency === '' &&
    outputCurrency === '' &&
    typedValue === '' &&
    independentField === Field.INPUT
  ) {
    // Defaults to having the native currency selected
    inputCurrency = 'ETH';
  } else if (inputCurrency === outputCurrency) {
    // clear output if identical
    outputCurrency = '';
  }

  const recipient = validatedRecipient(parsedQs.recipient);

  return {
    [Field.INPUT]: {
      currencyId: inputCurrency === '' ? null : inputCurrency ?? null,
    },
    [Field.OUTPUT]: {
      currencyId: outputCurrency === '' ? null : outputCurrency ?? null,
    },
    typedValue,
    independentField,
    recipient,
  };
}

// updates the swap state to use the defaults for a given network
// export function useDefaultsFromURLSearch(): SwapState {
//   const { chainId } = useWeb3React()
//   const dispatch = useAppDispatch()
//   const parsedQs = useParsedQueryString()

//   const parsedSwapState = useMemo(() => {
//     return queryParametersToSwapState(parsedQs)
//   }, [parsedQs])

//   useEffect(() => {
//     if (!chainId) return
//     const inputCurrencyId = parsedSwapState[Field.INPUT].currencyId ?? undefined
//     const outputCurrencyId = parsedSwapState[Field.OUTPUT].currencyId ?? undefined

//     dispatch(
//       replaceSwapState({
//         typedValue: parsedSwapState.typedValue,
//         field: parsedSwapState.independentField,
//         inputCurrencyId,
//         outputCurrencyId,
//         recipient: parsedSwapState.recipient,
//       })
//     )
//   }, [dispatch, chainId, parsedSwapState])

//   return parsedSwapState
// }
