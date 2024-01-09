import { styled, useTheme } from '@mui/material';
import { TxResponse } from '@soroban-react/contracts';
import { useSorobanReact } from '@soroban-react/core';
import BigNumber from 'bignumber.js';
import { ButtonError, ButtonLight } from 'components/Buttons/Button';
import { DarkGrayCard } from 'components/Card';
import { AutoColumn, ColumnCenter } from 'components/Column';
import CurrencyInputPanel from 'components/CurrencyInputPanel';
import { DEFAULT_SLIPPAGE_INPUT_VALUE } from 'components/Settings/MaxSlippageSettings';
import { BodySmall, ButtonText } from 'components/Text';
import TransactionConfirmationModal, {
  ConfirmationModalContent,
} from 'components/TransactionConfirmationModal';
import { AppContext } from 'contexts';
import { getCurrentTimePlusOneHour } from 'functions/getCurrentTimePlusOneHour';
import { formatTokenAmount } from 'helpers/format';
import { bigNumberToI128, bigNumberToU64 } from 'helpers/utils';
import useCalculateLpToReceive from 'hooks/useCalculateLp';
import useLiquidityValidations from 'hooks/useLiquidityValidations';
import { RouterMethod, useRouterCallback } from 'hooks/useRouterCallback';
import { TokenType } from 'interfaces';
import { useRouter } from 'next/router';
import { useCallback, useContext, useMemo, useState } from 'react';
import { Plus } from 'react-feather';
import * as StellarSdk from 'stellar-sdk';
import { Field } from 'state/mint/actions';
import { useDerivedMintInfo, useMintActionHandlers, useMintState } from 'state/mint/hooks';
import { useUserSlippageToleranceWithDefault } from 'state/user/hooks';
import { opacify } from 'themes/utils';
import { AddRemoveTabs } from '../AddRemoveHeader';
import AddModalFooter from './AddModalFooter';
import AddModalHeader from './AddModalHeader';
import { useToken } from 'hooks/tokens/useToken';

export const PageWrapper = styled('main')`
  position: relative;
  background: ${({ theme }) => `linear-gradient(${theme.palette.customBackground.bg2}, ${
    theme.palette.customBackground.bg2
  }) padding-box,
              linear-gradient(150deg, rgba(136,102,221,1) 0%, rgba(${
                theme.palette.mode == 'dark' ? '33,29,50,1' : '255,255,255,1'
              }) 35%, rgba(${
                theme.palette.mode == 'dark' ? '33,29,50,1' : '255,255,255,1'
              }) 65%, rgba(136,102,221,1) 100%) border-box`};
  border: 1px solid transparent;
  border-radius: 16px;
  padding: 32px;
  padding-top: 12px;
  box-shadow: 0px 40px 120px 0px #f00bdd29;
  transition: transform 250ms ease;
  max-width: 480px;
  width: 100%;
  &:hover: {
    border: 1px solid ${({ theme }) => opacify(24, theme.palette.secondary.main)};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.values.md}px) {
    padding: 16px;
  }
`;

type TokensType = [string, string];

interface AddLiquidityComponentProps {
  currencyIdA?: string;
  currencyIdB?: string;
}

export default function AddLiquidityComponent({
  currencyIdA,
  currencyIdB,
}: AddLiquidityComponentProps) {
  const theme = useTheme();
  const userSlippage = useUserSlippageToleranceWithDefault(DEFAULT_SLIPPAGE_INPUT_VALUE);
  const { ConnectWalletModal } = useContext(AppContext);
  const { isConnectWalletModalOpen, setConnectWalletModalOpen } = ConnectWalletModal;

  const router = useRouter();

  // const { tokens } = useTokens();

  // const [currencyIdA, setCurrencyIdA] = useState<string | undefined>(undefined);
  // const [currencyIdB, setCurrencyIdB] = useState<string | undefined>(undefined);
  // const [baseCurrency, setBaseCurrency] = useState<TokenType | undefined>(undefined);
  // const [currencyB, setCurrencyB] = useState<TokenType | undefined>(undefined);

  // useEffect(() => {
  //   if (currencyIdA) {
  //     const tokenA = tokens.find((item) => item.symbol === currencyIdA);
  //     if (tokenA) {
  //       setBaseCurrency(tokenA);
  //       setCurrencyIdA(tokenA.address);
  //     } else {
  //       setBaseCurrency(undefined);
  //       setCurrencyIdA(undefined);
  //     }
  //   }
  //   if (currencyIdB) {
  //     const tokenB = tokens.find((item) => item.symbol === currencyIdB);
  //     if (tokenB) {
  //       setCurrencyB(tokenB);
  //       setCurrencyIdB(tokenB.address);
  //     } else {
  //       setCurrencyB(undefined);
  //       setCurrencyIdB(undefined);
  //     }
  //   }
  // }, [currencyIdA, currencyIdB, tokens]);

  const sorobanContext = useSorobanReact();

  const [amountOfLpTokensToReceive, setAmountOfLpTokensToReceive] = useState<string>('');
  const [lpPercentage, setLpPercentage] = useState<string>('');
  const [totalShares, setTotalShares] = useState<string>('');

  const { token: baseCurrency } = useToken(currencyIdA);
  const { token: currencyB } = useToken(currencyIdB);

  const derivedMintInfo = useDerivedMintInfo(baseCurrency ?? undefined, currencyB ?? undefined);
  const { dependentField, currencies, parsedAmounts, noLiquidity, pairAddress } = derivedMintInfo;

  const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noLiquidity);

  const { independentField, typedValue, otherTypedValue } = useMintState();

  const formattedAmounts = useMemo(() => {
    return {
      [independentField]: typedValue,
      [dependentField]: noLiquidity
        ? otherTypedValue
        : formatTokenAmount(parsedAmounts[dependentField]?.value ?? ''),
    };
  }, [dependentField, independentField, noLiquidity, otherTypedValue, parsedAmounts, typedValue]);

  // // Modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false); // clicked confirm
  const [txHash, setTxHash] = useState<string | undefined>(undefined); // clicked confirm
  const [txError, setTxError] = useState<boolean>(false);

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false);
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onFieldAInput('');
    }
    setTxHash('');
    setTxError(false);
  }, [onFieldAInput, txHash]);

  const routerCallback = useRouterCallback();

  const provideLiquidity = useCallback(() => {
    setAttemptingTxn(true);
    // TODO: check that amount0 corresponds to token0?
    //TODO: Check all of this, is working weird but using the router, withdraw is not working

    //   fn add_liquidity(
    //     e: Env,
    //     token_a: Address,
    //     token_b: Address,
    //     amount_a_desired: i128,
    //     amount_b_desired: i128,
    //     amount_a_min: i128,
    //     amount_b_min: i128,
    //     to: Address,
    //     deadline: u64,
    // ) -> (i128, i128, i128);

    // When providing liquidity for the first time, the independentField is the last the user type.
    let desired0BN: BigNumber;
    let desired1BN: BigNumber;

    /**
     * baseCurrency is allways the currency at the top
     * currencyB is allways the currency at bottom
     *
     * independentField
     *  is the currency that the user is typing
     *  can have CURRENCY_A or CURRENCY_B
     *
     * dependentField
     *  is the currency that the user is NOT typing (depend on the ohter)
     *  can have CURRENCY_A or CURRENCY_B
     */

    // If ind == A means that the user is typing the currency on top
    if (independentField === Field.CURRENCY_A) {
      desired0BN = new BigNumber(formattedAmounts[independentField]).shiftedBy(7);
      desired1BN = new BigNumber(formattedAmounts[dependentField]).shiftedBy(7);
    } else {
      // if (independentField === Field.CURRENCY_B)
      // menas that the user is typing the currency on bottom
      desired0BN = new BigNumber(formattedAmounts[dependentField]).shiftedBy(7);
      desired1BN = new BigNumber(formattedAmounts[independentField]).shiftedBy(7);
    }

    const desiredAScVal = bigNumberToI128(desired0BN);
    const desiredBScVal = bigNumberToI128(desired1BN);

    // Here we are implementint the slippage: which will be in the "0.5" format when is 0.5%
    const factor = BigNumber(100).minus(userSlippage).dividedBy(100);
    const min0BN = desired0BN.multipliedBy(factor).decimalPlaces(0); // we dont want to have decimals after applying the factor
    console.log(
      '🚀 ~ file: AddLiquidityComponent.tsx:180 ~ provideLiquidity ~ min0BN.toString():',
      min0BN.toString(),
    );
    const min1BN = desired1BN.multipliedBy(factor).decimalPlaces(0);
    console.log(
      '🚀 ~ file: AddLiquidityComponent.tsx:182 ~ provideLiquidity ~ min1BN.toString():',
      min1BN.toString(),
    );

    const minAScVal = bigNumberToI128(min0BN);
    const minBScVal = bigNumberToI128(min1BN);

    const args = [
      new StellarSdk.Address(baseCurrency?.address ?? '').toScVal(),
      new StellarSdk.Address(currencyB?.address ?? '').toScVal(),
      desiredAScVal,
      desiredBScVal,
      minAScVal,
      minBScVal,
      new StellarSdk.Address(sorobanContext.address ?? '').toScVal(),
      bigNumberToU64(BigNumber(getCurrentTimePlusOneHour())),
    ];

    routerCallback(RouterMethod.ADD_LIQUIDITY, args, true)
      .then((result: TxResponse) => {
        setAttemptingTxn(false);
        setTxHash(result?.txHash);
      })
      .catch((error) => {
        console.log({ error });
        setAttemptingTxn(false);
        setTxError(true);
      });
  }, [
    independentField,
    baseCurrency,
    currencyB,
    sorobanContext.address,
    routerCallback,
    formattedAmounts,
    dependentField,
    userSlippage,
  ]);

  const handleCurrencyASelect = useCallback(
    (currencyA: TokenType) => {
      const newCurrencyIdA = currencyA.address;
      if (currencyIdB === undefined) {
        router.push(`/liquidity/add/${newCurrencyIdA}`);
      } else {
        router.push(`/liquidity/add/${newCurrencyIdA}/${currencyIdB}`);
      }
    },
    [currencyIdB, router],
  );

  const handleCurrencyBSelect = useCallback(
    (currencyB: TokenType) => {
      const newCurrencyIdB = currencyB.address;
      if (currencyIdA === undefined) {
        router.push(`/liquidity/add/${newCurrencyIdB}`);
      } else {
        router.push(`/liquidity/add/${currencyIdA}/${newCurrencyIdB}`);
      }
    },
    [currencyIdA, router],
  );

  const pendingText = (
    <BodySmall>
      Adding {formatTokenAmount(parsedAmounts[Field.CURRENCY_A]?.value ?? '')}{' '}
      {baseCurrency?.symbol} and {formatTokenAmount(parsedAmounts[Field.CURRENCY_B]?.value ?? '')}{' '}
      {currencyB?.symbol}
    </BodySmall>
  );

  const { getLpAmountAndPercentage } = useCalculateLpToReceive({
    pairAddress,
    formattedAmounts,
    baseCurrency,
  });

  const handleClickMainButton = async () => {
    const { amount, percentage } = await getLpAmountAndPercentage();

    setAmountOfLpTokensToReceive(`${amount}`);

    if (percentage < 0.001) {
      setLpPercentage('<0.001%');
    } else {
      setLpPercentage(`${percentage.toFixed(3)}%`);
    }

    setShowConfirm(true);
  };

  const { isButtonDisabled, getSupplyButtonText, getModalTitleText } = useLiquidityValidations({
    currencies,
    currencyIdA,
    currencyIdB,
    formattedAmounts,
    pairAddress,
  });

  return (
    <>
      <PageWrapper>
        <AddRemoveTabs
          creating={false}
          adding={true}
          autoSlippage={'DEFAULT_ADD_V2_SLIPPAGE_TOLERANCE'}
        />
        <TransactionConfirmationModal
          isOpen={showConfirm}
          onDismiss={handleDismissConfirmation}
          attemptingTxn={attemptingTxn}
          reviewContent={() => (
            <ConfirmationModalContent
              title={getModalTitleText()}
              onDismiss={handleDismissConfirmation}
              topContent={() => AddModalHeader({ currencies, amountOfLpTokensToReceive })}
              bottomContent={() =>
                AddModalFooter({
                  currencies,
                  formattedAmounts,
                  totalShares,
                  onConfirm: provideLiquidity,
                  shareOfPool: lpPercentage,
                })
              }
            />
          )}
          pendingText={pendingText}
          hash={txHash}
          txError={txError}
        />
        <AutoColumn gap="20px">
          <DarkGrayCard>
            <BodySmall color={theme.palette.custom.textTertiary}>
              <b>Tip: </b>When you add liquidity, you will receive LP tokens representing your
              position.
              <span style={{ marginTop: 15 }}>
                These tokens automatically earn fees proportional to your share of the pool.Can be
                redeemed at any time
              </span>
            </BodySmall>
          </DarkGrayCard>
          {/* //Input Token */}
          <CurrencyInputPanel
            id="add-liquidity-input-tokena"
            value={formattedAmounts[Field.CURRENCY_A]}
            onUserInput={onFieldAInput}
            onMax={(maxBalance) => onFieldAInput(maxBalance.toString())}
            onCurrencySelect={handleCurrencyASelect}
            showMaxButton
            currency={currencies[Field.CURRENCY_A] ?? null}
            transparent
            otherCurrency={currencies[Field.CURRENCY_B] ?? null}

            // showCommonBases
          />
          <ColumnCenter>
            <Plus size="16" color={theme.palette.secondary.main} />
          </ColumnCenter>
          {/* //Output Token */}
          <CurrencyInputPanel
            id="add-liquidity-input-tokenb"
            value={formattedAmounts[Field.CURRENCY_B]}
            onUserInput={onFieldBInput}
            onMax={(maxBalance) => onFieldBInput(maxBalance.toString())}
            onCurrencySelect={handleCurrencyBSelect}
            showMaxButton
            currency={currencies[Field.CURRENCY_B] ?? null}
            otherCurrency={currencies[Field.CURRENCY_A] ?? null}
            // showCommonBases
          />
          {!sorobanContext.address ? (
            <ButtonLight onClick={() => setConnectWalletModalOpen(true)}>
              <>Connect Wallet</>
            </ButtonLight>
          ) : (
            <AutoColumn gap="md">
              <ButtonError
                onClick={handleClickMainButton}
                disabled={isButtonDisabled()}
                error={false}
              >
                <ButtonText fontSize={20} fontWeight={600}>
                  {getSupplyButtonText()}
                </ButtonText>
              </ButtonError>
            </AutoColumn>
          )}
        </AutoColumn>
      </PageWrapper>
    </>
  );
}
