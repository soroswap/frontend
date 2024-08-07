import { css, keyframes } from '@emotion/react';
import { styled } from 'soroswap-ui';

export const flexColumnNoWrap = css`
  display: flex;
  flex-flow: column nowrap;
`;

export const flexRowNoWrap = css`
  display: flex;
  flex-flow: row nowrap;
`;

export enum TRANSITION_DURATIONS {
  slow = 500,
  medium = 250,
  fast = 125,
}

const transitions = {
  duration: {
    slow: `${TRANSITION_DURATIONS.slow}ms`,
    medium: `${TRANSITION_DURATIONS.medium}ms`,
    fast: `${TRANSITION_DURATIONS.fast}ms`,
  },
  timing: {
    ease: 'ease',
    in: 'ease-in',
    out: 'ease-out',
    inOut: 'ease-in-out',
  },
};

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const textFadeIn = css`
  animation: ${fadeIn} ${transitions.duration.fast} ${transitions.timing.in};
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const SpinnerCss = css`
  animation: 2s ${rotate} linear infinite;
`;

export const SpinnerSVG = styled('svg')`
  ${SpinnerCss}
`;
