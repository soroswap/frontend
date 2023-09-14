import { styled } from '@mui/material/styles';
import { AutoColumn } from 'components/Column';
import { transparentize } from 'polished';
import { ReactNode } from 'react';
import { AlertTriangle } from 'react-feather';
import { opacify } from 'themes/utils';

export const SwapWrapper = styled('main')`
  position: relative;
  background: ${({ theme }) => `linear-gradient(${theme.palette.customBackground.bg1}, ${theme.palette.customBackground.bg1}) padding-box,
              linear-gradient(150deg, rgba(136,102,221,1) 0%, rgba(${theme.palette.mode == 'dark' ? "33,29,50,1" : "255,255,255,1"}) 35%, rgba(${theme.palette.mode == 'dark' ? "33,29,50,1" : "255,255,255,1"}) 65%, rgba(136,102,221,1) 100%) border-box`};
  border: 1px solid transparent;
  border-radius: 16px;
  padding: 32px;
  padding-top: 12px;
  box-shadow: 0px 40px 120px 0px #f00bdd29;
  transition: transform 250ms ease;
  max-width: 480px;
  width: 100%;
  &:hover: {
    border: 1px solid ${({ theme }) => opacify(24, theme.palette.secondary.main,)},
  }

  @media (max-width: ${({theme}) => theme.breakpoints.values.md}px) {
    padding: 16px;
  }
`

export const ArrowWrapper = styled('div')<{clickable: boolean }>`
  border-radius: 32px;
  height: 32px;
  width: 32px;
  position: relative;
  margin-top: -8px;
  margin-bottom: -8px;
  margin-left: auto;
  margin-right: auto;
  background-color: ${({ theme }) => theme.palette.customBackground.accentSuccess};
  z-index: 2;
  ${({ clickable }) =>
    clickable
      ? `
          :hover {
            cursor: pointer;
            opacity: 0.8;
          }
        `
      : null}
`

const SwapCallbackErrorInner = styled('div')`
  background-color: ${({ theme }) => transparentize(0.9, theme.palette.error.main)};
  border-radius: 1rem;
  display: flex;
  align-items: center;
  font-size: 0.825rem;
  width: 100%;
  padding: 3rem 1.25rem 1rem 1rem;
  margin-top: -2rem;
  color: ${({ theme }) => theme.palette.error.main};
  z-index: -1;
  p {
    padding: 0;
    margin: 0;
    font-weight: 500;
  }
`

const SwapCallbackErrorInnerAlertTriangle = styled('div')`
  background-color: ${({ theme }) => transparentize(0.9, theme.palette.error.main)};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  border-radius: 12px;
  min-width: 48px;
  height: 48px;
`

export function SwapCallbackError({ error }: { error: ReactNode }) {
  return (
    <SwapCallbackErrorInner>
      <SwapCallbackErrorInnerAlertTriangle>
        <AlertTriangle size={24} />
      </SwapCallbackErrorInnerAlertTriangle>
      <p style={{ wordBreak: 'break-word' }}>{error}</p>
    </SwapCallbackErrorInner>
  )
}

export const SwapShowAcceptChanges = styled(AutoColumn)`
  background-color: ${({ theme }) => transparentize(0.95, theme.palette.custom.deprecated_primary3)};
  color: ${({ theme }) => theme.palette.customBackground.accentAction};
  padding: 12px;
  border-radius: 12px;
  margin-top: 8px;
`