// import { Trans } from '@lingui/macro'
import { ButtonBase, styled, useMediaQuery, useTheme } from '@mui/material';
import { opacify } from '../../themes/utils';


export const StyledSelect = styled(ButtonBase, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{
    visible: boolean | string;
  selected?: boolean;
  hideInput?: boolean;
  disabled?: boolean;
}>`
  align-items: center;
  background-color: ${({ selected, theme }) =>
    selected ? theme.palette.customBackground.interactive : theme.palette.custom.borderColor};
  opacity: ${({ disabled }) => (!disabled ? 1 : 0.4)};
  box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
  color: ${({ selected, theme }) => (selected ? theme.palette.primary.main : '#FFFFFF')};
  height: unset;
  border-radius: 16px;
  outline: none;
  user-select: none;
  border: none;
  font-size: 24px;
  font-weight: 400;
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  padding: ${({ selected }) => (selected ? '4px 4px 4px 4px' : '6px 6px 6px 8px')};
  gap: 8px;
  justify-content: space-between;

  &:hover,
  &:active {
    background-color: ${({ theme, selected }) =>
      selected ? theme.palette.customBackground.interactive : theme.palette.custom.borderColor};
  }

  &:before {
    background-size: 100%;
    border-radius: inherit;

    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;
    content: '';
  }

  &:hover:before {
    background-color: ${({ theme }) => opacify(8, theme.palette.secondary.main)};
  }

  &:active:before {
    background-color: ${({ theme }) => opacify(24, theme.palette.secondary.light)};
  }

  visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};
`;