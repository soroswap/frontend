import { Button, CircularProgress, Slider, styled, useTheme } from 'soroswap-ui';
import { TxResponse } from '@soroban-react/contracts';
import { useSorobanReact } from '@soroban-react/core';
import BigNumber from 'bignumber.js';
import { ButtonError, ButtonLight, ButtonPrimary } from 'components/Buttons/Button';
import Column, { AutoColumn } from 'components/Column';
import CurrencyLogo from 'components/Logo/CurrencyLogo';
import DoubleCurrencyLogo from 'components/Logo/DoubleLogo';
import { RowBetween, RowFixed } from 'components/Row';
import { DEFAULT_SLIPPAGE_INPUT_VALUE } from 'components/Settings/MaxSlippageSettings';
import { BodySmall, ButtonText, SubHeaderSmall } from 'components/Text';
import TransactionConfirmationModal, {
  ConfirmationModalContent,
} from 'components/TransactionConfirmationModal';
import { AppContext } from 'contexts';
import { getCurrentTimePlusOneHour } from 'functions/getCurrentTimePlusOneHour';
import { getExpectedAmount } from 'functions/getExpectedAmount';
import { calculateLiquidityFees } from 'functions/getNetworkFees';
import { formatTokenAmount } from 'helpers/format';
import { bigNumberToI128, bigNumberToU64 } from 'helpers/utils';
import { useToken } from 'hooks/tokens/useToken';
import { RouterMethod, useRouterCallback } from 'hooks/useRouterCallback';
import { useRouter } from 'next/router';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Plus } from 'react-feather';
import { Field } from 'state/burn/actions';
import { useBurnActionHandlers, useBurnState, useDerivedBurnInfo } from 'state/burn/hooks';
import { useUserSlippageToleranceWithDefault } from 'state/user/hooks';
import * as StellarSdk from '@stellar/stellar-sdk';
import { opacify } from 'themes/utils';
import { AddRemoveTabs } from '../AddRemoveHeader';

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

const StyledTokenName = styled('span')<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.25rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  color: ${({ theme }) => theme.palette.custom.textPrimary};
  font-size: 20px;
`;

const Container = styled('div')<{ transparent?: boolean }>`
  border-radius: 16px;
  padding: 1.25rem;
  border: 1px solid ${({ theme }) => theme.palette.custom.textSecondary};
  background-color: ${({ theme, transparent }) =>
    transparent ? 'transparent' : theme.palette.customBackground.bg1};
  width: 100%;
`;

const CustomSlider = styled(Slider)({
  width: '100%',
  color: 'primary', // Change color as needed
  '& .MuiSlider-rail': {
    backgroundColor: '#E0E0E0', // Customize the track color
  },
  '& .MuiSlider-track': {
    backgroundColor: 'primary', // Customize the track color
  },
});

const CustomButton = styled(Button)({
  padding: '8px 16px', // Customize the padding
  backgroundColor: 'primary', // Customize the button background color
  color: 'white', // Customize the button text color
  '&:hover': {
    backgroundColor: 'primary', // Customize the hover background color
  },
});

type TokensType = [string, string];

export default function RemoveLiquidityComponent() {
  const theme = useTheme();
  const sorobanContext = useSorobanReact();
  const allowedSlippage = useUserSlippageToleranceWithDefault(DEFAULT_SLIPPAGE_INPUT_VALUE);

  // Connect wallet modal
  const { ConnectWalletModal } = useContext(AppContext);
  const { isConnectWalletModalOpen, setConnectWalletModalOpen } = ConnectWalletModal;

  // Getting tokens from pathname
  const router = useRouter();
  const { tokens } = router.query as { tokens: TokensType };
  const [currencyIdA, currencyIdB] = Array.isArray(tokens) ? tokens : ['', ''];

  const { token: currencyA } = useToken(currencyIdA);
  const { token: currencyB } = useToken(currencyIdB);

  // Burn State
  const { independentField, typedValue } = useBurnState();

  const { pair, parsedAmounts, error, isLoadingPairInfo } = useDerivedBurnInfo(
    currencyA ?? undefined,
    currencyB ?? undefined,
  );

  const { onUserInput: _onUserInput } = useBurnActionHandlers();
  const isValid = !error;

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      return _onUserInput(field, typedValue);
    },
    [_onUserInput],
  );

  const liquidityPercentChange = useCallback(
    (event: Event | string, newValue: number | number[]) => {
      onUserInput(Field.LIQUIDITY_PERCENT, newValue.toString());
    },
    [onUserInput],
  );

  // // Modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false); // clicked confirm
  const [txHash, setTxHash] = useState<string | undefined>(undefined); // clicked confirm

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false);
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.LIQUIDITY_PERCENT, '');
      router.push('/liquidity');
    }
    setTxHash(undefined);
  }, [onUserInput, router, txHash]);

  const handleButtonClick = (newValue: number) => {
    liquidityPercentChange('', newValue);
  };

  const [currencyAtoB, setCurrencyAtoB] = useState<string>();
  const [currencyBtoA, setCurrencyBtoA] = useState<string>();
  const [txError, setTxError] = useState<boolean>(false);

  const [networkFees, setNetworkFees] = useState<number>(0);
  useEffect(() => {
    const amountA =
      pair?.tokenAmounts.find((token) => token.currency?.contract === currencyA?.contract)
        ?.balance ?? BigNumber(0);
    const amountB =
      pair?.tokenAmounts.find((token) => token.currency?.contract === currencyB?.contract)
        ?.balance ?? BigNumber(0);

    const aToB = amountA.dividedBy(amountB).toFixed(7);
    const bToA = amountB.dividedBy(amountA).toFixed(7);

    setCurrencyAtoB(aToB);
    setCurrencyBtoA(bToA);
  }, [currencyA, currencyB, pair]);

  const pendingText = (
    <BodySmall>
      Removing {formatTokenAmount(parsedAmounts[Field.CURRENCY_A]?.value ?? '')} {currencyA?.code}{' '}
      and {formatTokenAmount(parsedAmounts[Field.CURRENCY_B]?.value ?? '')} {currencyB?.code}
    </BodySmall>
  );

  const routerCallback = useRouterCallback();

  const getArgs = useCallback(() => {
    const factor = BigNumber(100).minus(allowedSlippage).dividedBy(100);

    const desiredA = new BigNumber(parsedAmounts.CURRENCY_A?.value as string);
    const desiredB = new BigNumber(parsedAmounts.CURRENCY_B?.value as string);

    const minABN = desiredA.multipliedBy(factor).decimalPlaces(0);
    const minBBN = desiredB.multipliedBy(factor).decimalPlaces(0);
    const minAScVal = bigNumberToI128(minABN);
    const minBScVal = bigNumberToI128(minBBN);

    return [
      new StellarSdk.Address(currencyA?.contract as string).toScVal(),
      new StellarSdk.Address(currencyB?.contract as string).toScVal(),
      bigNumberToI128(parsedAmounts.LIQUIDITY as BigNumber),
      minAScVal,
      minBScVal,
      new StellarSdk.Address(sorobanContext.address as string).toScVal(),
      bigNumberToU64(BigNumber(getCurrentTimePlusOneHour())),
    ];
  }, [
    currencyA?.contract,
    currencyB?.contract,
    parsedAmounts.CURRENCY_A?.value,
    parsedAmounts.CURRENCY_B?.value,
    parsedAmounts.LIQUIDITY,
    sorobanContext.address,
    allowedSlippage,
  ]);

  const removeLiquidity = useCallback(() => {
    setAttemptingTxn(true);

    const args = getArgs();

    routerCallback(RouterMethod.REMOVE_LIQUIDITY, args, true)
      .then((result: TxResponse) => {
        setAttemptingTxn(false);
        setTxHash(result?.txHash);
      })
      .catch((error) => {
        setTxError(true);
        setAttemptingTxn(false);
      });
  }, [getArgs, routerCallback]);

  const getNetworkFees = async () => {
    let fees;
    try {
      const args = getArgs();
      fees = await calculateLiquidityFees(sorobanContext, args, RouterMethod.REMOVE_LIQUIDITY);

      if (!fees) return 0;

      fees = Number(fees) / 10 ** 7;
    } catch (error) {
      console.error('Error fetching network fees:', error);
      fees = 0;
    }
    return fees;
  };

  const handleClickMainButton = async () => {
    setTxError(false);
    const fee = await getNetworkFees();
    setNetworkFees(fee);
    setShowConfirm(true);
  };

  const modalHeader = () => {
    return (
      <AutoColumn gap="12px" style={{ marginTop: '20px' }}>
        <RowBetween align="flex-end">
          <BodySmall fontSize={18} fontWeight={535}>
            {formatTokenAmount(parsedAmounts[Field.CURRENCY_A]?.value ?? '')}
          </BodySmall>
          <RowFixed gap="4px">
            <CurrencyLogo currency={currencyA} size="24px" />
            <BodySmall fontSize={24} fontWeight={535} style={{ marginLeft: '10px' }}>
              {currencyA?.code}
            </BodySmall>
          </RowFixed>
        </RowBetween>
        <RowFixed>
          <Plus size="16" color={theme.palette.secondary.main} />
        </RowFixed>
        <RowBetween align="flex-end">
          <BodySmall fontSize={18} fontWeight={535}>
            {formatTokenAmount(parsedAmounts[Field.CURRENCY_B]?.value ?? '')}
          </BodySmall>
          <RowFixed gap="4px">
            <CurrencyLogo currency={currencyB} size="24px" />
            <BodySmall fontSize={24} fontWeight={535} style={{ marginLeft: '10px' }}>
              {currencyB?.code}
            </BodySmall>
          </RowFixed>
        </RowBetween>

        <BodySmall fontSize={12} textAlign="left" padding="12px 0 0 0">
          {/* TODO: AllowedSlippage*10??? how should we handle this? */}
          Output is estimated. If the price changes by more than {allowedSlippage}% your transaction
          will revert.
        </BodySmall>
      </AutoColumn>
    );
  };

  const modalBottom = () => {
    return (
      <>
        <RowBetween>
          <BodySmall fontWeight={535} fontSize={16} color={theme.palette.secondary.main}>
            {currencyA?.code}/{currencyB?.code} Burned
          </BodySmall>
          <RowFixed>
            <DoubleCurrencyLogo currency0={currencyA} currency1={currencyB} margin={true} />
            <BodySmall fontWeight={535} fontSize={16}>
              {formatTokenAmount(parsedAmounts[Field.LIQUIDITY] ?? '')}
            </BodySmall>
          </RowFixed>
        </RowBetween>
        <RowBetween>
          <BodySmall fontWeight={535} fontSize={16} color={theme.palette.secondary.main}>
            Network fees
          </BodySmall>
          <RowFixed>
            <BodySmall fontWeight={535} fontSize={16}>
              ~{networkFees} XLM
            </BodySmall>
          </RowFixed>
        </RowBetween>
        {pair && (
          <>
            <RowBetween>
              <BodySmall fontWeight={535} fontSize={16} color={theme.palette.secondary.main}>
                Price
              </BodySmall>
              <BodySmall fontWeight={535} fontSize={14}>
                1 {currencyA?.code} = {currencyAtoB ?? '-'} {currencyB?.code}
              </BodySmall>
            </RowBetween>
            <RowBetween>
              <div />
              <BodySmall fontWeight={535} fontSize={14}>
                1 {currencyB?.code} = {currencyBtoA ?? '-'} {currencyA?.code}
              </BodySmall>
            </RowBetween>
          </>
        )}
        <ButtonPrimary onClick={removeLiquidity}>Confirm</ButtonPrimary>
      </>
    );
  };

  return (
    <>
      <PageWrapper>
        <AddRemoveTabs
          creating={false}
          adding={false}
          autoSlippage={'DEFAULT_REMOVE_V2_SLIPPAGE_TOLERANCE'}
        />
        <TransactionConfirmationModal
          isOpen={showConfirm}
          onDismiss={handleDismissConfirmation}
          attemptingTxn={attemptingTxn}
          reviewContent={() => (
            <ConfirmationModalContent
              title="You will receive"
              onDismiss={handleDismissConfirmation}
              topContent={modalHeader}
              bottomContent={modalBottom}
            />
          )}
          pendingText={pendingText}
          hash={txHash}
          txError={txError}
        />
        <AutoColumn gap="8px">
          <Container transparent>
            {typedValue}%
            <CustomSlider
              aria-label="Percentage"
              value={Number(typedValue)}
              onChange={liquidityPercentChange}
            />
            <CustomButton onClick={() => handleButtonClick(25)}>25%</CustomButton>
            <CustomButton onClick={() => handleButtonClick(50)}>50%</CustomButton>
            <CustomButton onClick={() => handleButtonClick(75)}>75%</CustomButton>
            <CustomButton onClick={() => handleButtonClick(100)}>100%</CustomButton>
          </Container>
          <SubHeaderSmall>Receive</SubHeaderSmall>
          <Container>
            <RowFixed>
              <CurrencyLogo
                style={{ marginRight: '0.5rem' }}
                currency={currencyA ?? null}
                size="24px"
              />
              <StyledTokenName
                className="token-symbol-container"
                active={Boolean(currencyA && currencyA.code)}
              >
                {currencyA && currencyA.code && currencyA.code.length > 20
                  ? currencyA.code.slice(0, 4) +
                    '...' +
                    currencyA.code.slice(currencyA.code.length - 5, currencyA.code.length)
                  : currencyA?.code}
              </StyledTokenName>
              {isLoadingPairInfo ? (
                <CircularProgress size="12px" />
              ) : (
                formatTokenAmount(parsedAmounts[Field.CURRENCY_A]?.value ?? '')
              )}
            </RowFixed>
            <RowFixed>
              <CurrencyLogo
                style={{ marginRight: '0.5rem' }}
                currency={currencyB ?? null}
                size="24px"
              />
              <StyledTokenName
                className="token-symbol-container"
                active={Boolean(currencyB && currencyB.code)}
              >
                {currencyB && currencyB.code && currencyB.code.length > 20
                  ? currencyB.code.slice(0, 4) +
                    '...' +
                    currencyB.code.slice(currencyB.code.length - 5, currencyB.code.length)
                  : currencyB?.code}
              </StyledTokenName>
              {isLoadingPairInfo ? (
                <CircularProgress size="12px" />
              ) : (
                formatTokenAmount(parsedAmounts[Field.CURRENCY_B]?.value ?? '')
              )}
            </RowFixed>
          </Container>
          <SubHeaderSmall>Prices</SubHeaderSmall>
          <Container>
            <Column>
              <div>
                1 {currencyA?.code} ={' '}
                {isLoadingPairInfo ? <CircularProgress size="12px" /> : currencyAtoB}{' '}
                {currencyB?.code}
              </div>
              <div>
                1 {currencyB?.code} ={' '}
                {isLoadingPairInfo ? <CircularProgress size="12px" /> : currencyBtoA}{' '}
                {currencyA?.code}
              </div>
            </Column>
          </Container>
          Slippage Tolerance 0.5%
          {!sorobanContext.address ? (
            <ButtonLight onClick={() => setConnectWalletModalOpen(true)}>{error}</ButtonLight>
          ) : (
            <AutoColumn gap="md">
              <ButtonError
                onClick={handleClickMainButton}
                disabled={Number(typedValue) === 0 || isLoadingPairInfo}
                error={false}
              >
                <ButtonText fontSize={20} fontWeight={600}>
                  Remove
                </ButtonText>
              </ButtonError>
            </AutoColumn>
          )}
        </AutoColumn>
      </PageWrapper>
    </>
  );
}
