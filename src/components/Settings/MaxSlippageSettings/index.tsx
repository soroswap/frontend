import Expand from 'components/Expand';
import QuestionHelper from 'components/QuestionHelper';
import Row, { RowBetween } from 'components/Row';
import React, { useState } from 'react';
import { styled, Typography, useTheme } from '@mui/material';
import { Alert } from '@mui/material';
import { Input, InputContainer } from '../Input';
import { useUserSlippageTolerance } from 'state/user/hooks';

enum SlippageError {
  InvalidInput = 'InvalidInput',
}

const Option = styled(Row, {
  shouldForwardProp: (prop) => prop !== 'isActive',
})<{ isActive: boolean }>`
  width: auto;
  cursor: pointer;
  padding: 6px 12px;
  text-align: center;
  gap: 4px;
  border-radius: 12px;
  background: ${({ isActive, theme }) =>
    isActive ? theme.palette.customBackground.module : 'transparent'};
  pointer-events: ${({ isActive }) => isActive && 'none'};
`;

const Switch = styled(Row)`
  width: auto;
  padding: 4px;
  border: 1px solid ${({ theme }) => theme.palette.customBackground.outline};
  border-radius: 16px;
`;

const NUMBER_WITH_MAX_TWO_DECIMAL_PLACES = /^(?:\d+(?:\.\d{0,2})?|\.\d{0,2})?$/;

const MINIMUM_RECOMMENDED_SLIPPAGE = 0.05;
const MAXIMUM_RECOMMENDED_SLIPPAGE = 1;

export const DEFAULT_SLIPPAGE_INPUT_VALUE = 0.5;

export default function MaxSlippageSettings({ autoSlippage }: { autoSlippage: number }) {
  const theme = useTheme();
  const [userSlippageTolerance, setUserSlippageTolerance] = useUserSlippageTolerance();

  // If user has previously entered a custom slippage, we want to show that value in the input field
  // instead of a placeholder.
  const [slippageInput, setSlippageInput] = useState<number | string>(userSlippageTolerance);
  const [slippageError, setSlippageError] = useState<SlippageError | false>(false);

  // If user has previously entered a custom slippage, we want to show the settings expanded by default.
  const [isOpen, setIsOpen] = useState(DEFAULT_SLIPPAGE_INPUT_VALUE !== userSlippageTolerance);

  const parseSlippageInput = (value: string) => {
    // Do not allow non-numerical characters in the input field or more than two decimals
    if (value.length >= 0 && !NUMBER_WITH_MAX_TWO_DECIMAL_PLACES.test(value)) {
      return;
    }
    setSlippageInput(value);
    setSlippageError(false);

    // If the input is empty, set the slippage to the default
    if (value.length === 0) {
      setUserSlippageTolerance(DEFAULT_SLIPPAGE_INPUT_VALUE);
      return;
    }

    if (value === '.') {
      return;
    }

    // Parse user input and set the slippage if valid, error otherwise
    try {
      const parsed = Math.floor(Number.parseFloat(value) * 100);
      if (parsed > 5000) {
        setSlippageError(SlippageError.InvalidInput);
      } else {
        setUserSlippageTolerance(Number.parseFloat(value));
      }
    } catch (e) {
      setSlippageError(SlippageError.InvalidInput);
    }
  };

  const tooLow =
    typeof userSlippageTolerance === 'number'
      ? userSlippageTolerance < MINIMUM_RECOMMENDED_SLIPPAGE
      : false;
  const tooHigh =
    typeof userSlippageTolerance === 'number'
      ? userSlippageTolerance > MAXIMUM_RECOMMENDED_SLIPPAGE
      : false;

  return (
    <Expand
      testId="max-slippage-settings"
      isOpen={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
      header={
        <Row width="auto">
          <Typography color={theme.palette.secondary.main}>Max slippage</Typography>
          <QuestionHelper
            text={
              <div>
                Your transaction will revert if the price changes unfavorably by more than this
                percentage.
              </div>
            }
          />
        </Row>
      }
      button={
        <Typography color={theme.palette.primary.main}>
          {userSlippageTolerance === DEFAULT_SLIPPAGE_INPUT_VALUE ? (
            <>Auto</>
          ) : (
            `${typeof userSlippageTolerance === 'number' ? userSlippageTolerance.toFixed(2) : 0.5}%`
          )}
        </Typography>
      }
    >
      <RowBetween gap="md">
        <Switch>
          <Option
            onClick={() => {
              // Reset the input field when switching to auto
              setSlippageInput(DEFAULT_SLIPPAGE_INPUT_VALUE);
              setUserSlippageTolerance(DEFAULT_SLIPPAGE_INPUT_VALUE);
            }}
            isActive={userSlippageTolerance === DEFAULT_SLIPPAGE_INPUT_VALUE}
          >
            <Typography color={theme.palette.primary.main} component="div">
              Auto
            </Typography>
          </Option>
          <Option
            onClick={() => {
              // When switching to custom slippage, use `auto` value as a default.
              setUserSlippageTolerance(autoSlippage);
            }}
            isActive={userSlippageTolerance !== DEFAULT_SLIPPAGE_INPUT_VALUE}
          >
            <Typography color={theme.palette.primary.main} component="div">
              Custom
            </Typography>
          </Option>
        </Switch>
        <InputContainer gap="md" error={!!slippageError}>
          <Input
            data-testid="slippage-input"
            placeholder={autoSlippage.toFixed(2)}
            value={slippageInput}
            onChange={(e) => parseSlippageInput(e.target.value)}
            onBlur={() => {
              // When the input field is blurred, reset the input field to the default value
              setSlippageInput(DEFAULT_SLIPPAGE_INPUT_VALUE);
              setSlippageError(false);
            }}
          />
          <Typography color={theme.palette.primary.main}>%</Typography>
        </InputContainer>
      </RowBetween>
      {tooLow || tooHigh ? (
        <RowBetween gap="md">
          <Alert severity="warning">
            {tooLow ? (
              <div>
                Slippage below {MINIMUM_RECOMMENDED_SLIPPAGE.toFixed(2)}% may result in a failed
                transaction
              </div>
            ) : (
              <div>Your transaction may be frontrun and result in an unfavorable trade.</div>
            )}
          </Alert>
        </RowBetween>
      ) : null}
    </Expand>
  );
}
