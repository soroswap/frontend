import { Box, Button, CircularProgress, Modal, styled } from '@mui/material';
import { setTrustline } from '@soroban-react/contracts';
import { useSorobanReact } from '@soroban-react/core';
import { ButtonPrimary } from 'components/Buttons/Button';
import { AutoColumn } from 'components/Column';
import { AppContext, SnackbarIconType } from 'contexts';
import { sendNotification } from 'functions/sendNotification';
import { formatTokenAmount } from 'helpers/format';
import { requiresTrustline } from 'helpers/stellar';
import { useToken } from 'hooks/tokens/useToken';
import useGetNativeTokenBalance from 'hooks/useGetNativeTokenBalance';
import {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import { InterfaceTrade, TradeState } from 'state/routing/types';
import { Field } from 'state/swap/actions';
import { useDerivedSwapInfo, useSwapActionHandlers } from 'state/swap/hooks';
import swapReducer, { SwapState, initialState as initialSwapState } from 'state/swap/reducer';
import { opacify } from 'themes/utils';
import SwapHeader from 'components/Swap/SwapHeader';
import { SwapWrapper } from 'components/Swap/styleds';

export const SwapSection = styled('div')(({ theme }) => ({
  position: 'relative',
  backgroundColor: theme.palette.customBackground.module,
  borderRadius: 12,
  padding: 16,
  color: theme.palette.secondary.main,
  fontSize: 14,
  lineHeight: '20px',
  fontWeight: 500,
  '&:before': {
    boxSizing: 'border-box',
    backgroundSize: '100%',
    borderRadius: 'inherit',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    border: `1px solid ${theme.palette.customBackground.module}`,
  },
  '&:hover:before': {
    borderColor: opacify(8, theme.palette.secondary.main),
  },
  '&:focus-within:before': {
    borderColor: opacify(24, theme.palette.secondary.light),
  },
}));

export const OutputSwapSection = styled(SwapSection)`
  border-bottom: ${({ theme }) => `1px solid ${theme.palette.customBackground.module}`};
  border-radius: 16px;
  border: 1px solid rgba(180, 239, 175, 0.2);
  background: ${({ theme }) => theme.palette.customBackground.outputBackground};
`;

export const ArrowContainer = styled('div')`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 100%;
`;

function getIsValidSwapQuote(
  trade: InterfaceTrade | undefined,
  tradeState: TradeState,
  swapInputError?: ReactNode,
): boolean {
  return Boolean(!swapInputError && trade && tradeState === TradeState.VALID);
}

interface BuyStateProps {
  showConfirm: boolean;
  tradeToConfirm?: InterfaceTrade;
  swapError?: Error;
  swapResult?: any;
}

const INITIAL_SWAP_STATE = {
  showConfirm: false,
  tradeToConfirm: undefined,
  swapError: undefined,
  swapResult: undefined,
};

export function BuyComponent({
  prefilledState = {},
  disableTokenInputs = false,
}: {
  prefilledState?: Partial<SwapState>;
  disableTokenInputs?: boolean;
}) {
  const sorobanContext = useSorobanReact();
  const { SnackbarContext } = useContext(AppContext);
  const [txError, setTxError] = useState<boolean>(false);

  const [needTrustline, setNeedTrustline] = useState<boolean>(true);

  const { token: prefilledToken } = useToken(prefilledState.INPUT?.currencyId!);

  // modal and loading
  const [{ showConfirm, tradeToConfirm, swapError, swapResult }, setSwapState] =
    useState<BuyStateProps>(INITIAL_SWAP_STATE);

  const [state, dispatch] = useReducer(swapReducer, { ...initialSwapState, ...prefilledState });
  const { typedValue, recipient, independentField } = state;

  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } =
    useSwapActionHandlers(dispatch);
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT;

  useEffect(() => {
    if (prefilledToken) {
      onCurrencySelection(Field.INPUT, prefilledToken);
    }
  }, [onCurrencySelection, prefilledToken]);

  const {
    trade: { state: tradeState, trade, resetRouterSdkCache },
    allowedSlippage,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
  } = useDerivedSwapInfo(state);



  const decimals = useMemo(
    () => ({
      [Field.INPUT]:
        independentField === Field.INPUT
          ? trade?.outputAmount?.currency.decimals ?? 7
          : trade?.inputAmount?.currency.decimals ?? 7,
      [Field.OUTPUT]:
        independentField === Field.OUTPUT
          ? trade?.inputAmount?.currency.decimals ?? 7
          : trade?.outputAmount?.currency.decimals ?? 7,
    }),
    [independentField, trade],
  );


  const formattedAmounts = useMemo(
    () => ({
      [independentField]: typedValue,
      [dependentField]: formatTokenAmount(trade?.expectedAmount, decimals[independentField]),
    }),
    [decimals, dependentField, independentField, trade?.expectedAmount, typedValue],
  );

  const handleTrustline = () => {
    const asset = trade?.outputAmount?.currency;
    if (!asset?.issuer) return;

    setTrustline({ tokenSymbol: asset.code, tokenAdmin: asset.issuer, sorobanContext })
      .then((result) => {
        setNeedTrustline(false);
        sendNotification(
          `for ${asset.code}`,
          'Trustline set',
          SnackbarIconType.MINT,
          SnackbarContext,
        );
      })
      .catch((error) => {
        // console.log(error);
        setTxError(true);
        setSwapState((currentState) => ({
          ...currentState,
          showConfirm: false,
        }));
      });
  };



  const nativeBalance = useGetNativeTokenBalance();

  useEffect(() => {
    const checkTrustline = async () => {
      if (!trade) return;
      if (sorobanContext.address) {
        // Check if we need trustline
        const needTrustline = await requiresTrustline(
          sorobanContext,
          trade?.outputAmount?.currency,
          trade?.outputAmount?.value,
        );

        if (needTrustline) {
          setNeedTrustline(true);
        } else {
          setNeedTrustline(false);
        }
      } else {
        // Until the user does not connects the wallet, we will think that we need trustline
        setNeedTrustline(true);
      }
    };

    checkTrustline();
  }, [sorobanContext, trade, nativeBalance.data?.validAccount]);



  return (
    <>
      <SwapWrapper style={{ minHeight: '500px' }}>
        <SwapHeader />
        <AutoColumn gap="md" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <ButtonPrimary onClick={() => {
            console.log('button clicked!')
            alert('button clicked!')
          }}>Buy USDC</ButtonPrimary>
        </AutoColumn>
      </SwapWrapper>
    </>
  );
}
