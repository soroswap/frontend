import { css, keyframes } from "@emotion/react"
import { styled } from "@mui/material"

export const loadingAnimation = keyframes`
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`

export const LoadingRows = styled('div')`
  display: grid;

  & > div {
    animation: ${loadingAnimation} 1.5s infinite;
    animation-fill-mode: both;
    background: linear-gradient(
      to left,
      ${({ theme }) => theme.palette.customBackground.bg1} 25%,
      ${({ theme }) => theme.palette.customBackground.interactive} 50%,
      ${({ theme }) => theme.palette.customBackground.bg1} 75%
    );
    background-size: 400%;
    border-radius: 12px;
    height: 2.4em;
    will-change: background-position;
  }
`

export const loadingOpacityMixin = css`
  filter: grayscale(1);
  opacity: 0.4;
  transition: opacity 0.2s ease-in-out;
`

export const LoadingOpacityContainer = styled('div')<{ $loading: boolean }>`
  ${loadingOpacityMixin}
`
