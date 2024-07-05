// import styled from 'styled-components/macro'
import { styled } from 'soroswap-ui';

import Row from '../../Row';

export const Input = styled('input')`
  width: 100%;
  display: flex;
  flex: 1;
  font-size: 16px;
  border: 0;
  outline: none;
  background: transparent;
  text-align: right;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
  ::placeholder {
    color: ${({ theme }) => theme.palette.custom.textTertiary};
  }
`;

export const InputContainer = styled(Row, {
  shouldForwardProp: (prop) => prop !== 'error',
})<{ error?: boolean }>`
  padding: 8px 16px;
  border-radius: 12px;
  width: auto;
  flex: 1;
  input {
    color: ${({ theme, error }) =>
      error ? theme.palette.custom.accentFailure : theme.palette.primary.main};
  }
  border: 1px solid
    ${({ theme, error }) =>
      error ? theme.palette.custom.accentFailure : theme.palette.customBackground.bg3};
  ${({ theme, error }) =>
    error
      ? `
        border: 1px solid ${theme.palette.custom.accentFailure};
        :focus-within {
          border-color: ${theme.palette.customBackground.accentFailureSoft};
        }
      `
      : `
        border: 1px solid ${theme.palette.customBackground.outline};
        :focus-within {
          border-color: ${theme.palette.customBackground.accentActionSoft};
        }
      `}
`;
