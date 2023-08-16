import { styled } from '@mui/material'
import React, { PropsWithChildren } from 'react'

interface BodyWrapperProps {
  $margin?: string
  $maxWidth?: string
}

export const BodyWrapper = styled('main')<BodyWrapperProps>`
  position: relative;
  margin-top: ${({ $margin }) => $margin ?? '0px'};
  max-width: ${({ $maxWidth }) => $maxWidth ?? '420px'};
  width: 100%;
  background: ${({ theme }) => theme.palette.customBackground.surface };
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.palette.customBackground.outline};
  margin-top: 1rem;
  margin-left: auto;
  margin-right: auto;
  z-index: 1;
  font-feature-settings: 'ss01' on, 'ss02' on, 'cv01' on, 'cv03' on;
`

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export default function AppBody(props: PropsWithChildren<BodyWrapperProps>) {
  return <BodyWrapper {...props} />
}
