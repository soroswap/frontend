import { styled } from '@mui/material/styles';
import { opacify } from 'themes/utils';

export const SwapWrapper = styled('main')`
  position: relative;
  background: ${({ theme }) => theme.palette.customBackground.surface};
  border-radius: 16px;
  border: 1px solid ${({ theme }) => opacify(24, theme.palette.secondary.main)};
  padding: 8px;
  padding-top: 12px;
  box-shadow: 0px 40px 120px 0px #f00bdd29;
  transition: transform 250ms ease;
  max-width: 480px;
  width: 100%;
  &:hover: {
    border: 1px solid ${({ theme }) => opacify(24, theme.palette.secondary.main,)},
  }
`