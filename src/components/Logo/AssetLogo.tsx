import { css, styled } from '@mui/material';
import React from 'react';

export const MissingImageLogo = styled('div')<{ size?: string }>`
  --size: ${({ size }) => size};
  border-radius: 100px;
  color: ${({ theme }) => theme.palette.primary.main};
  background-color: ${({ theme }) => theme.palette.customBackground.interactive};
  font-size: calc(var(--size) / 3);
  font-weight: 500;
  height: ${({ size }) => size ?? '24px'};
  line-height: ${({ size }) => size ?? '24px'};
  text-align: center;
  width: ${({ size }) => size ?? '24px'};
`

export const LogoImage = styled('img')<{ size: string; useBG?: boolean }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: 50%;

  ${({ useBG }) =>
    useBG &&
    css`
      background: radial-gradient(white 60%, #ffffff00 calc(70% + 1px));
      box-shadow: 0 0 1px white;
    `}
`

export type AssetLogoBaseProps = {
  symbol?: string | null
  backupImg?: string | null
  size?: string
  style?: React.CSSProperties
  hideL2Icon?: boolean
  icon?: string | null
}
type AssetLogoProps = AssetLogoBaseProps & { isNative?: boolean; address?: string | null; chainId?: number }

const LogoContainer = styled('div')`
  position: relative;
  display: flex;
`

/**
 * Renders an image by prioritizing a list of sources, and then eventually a fallback triangle alert
 */
export default function AssetLogo({
  address,
  symbol,
  size = '24px',
  style,
  icon,
}: AssetLogoProps) {
  const imageProps = {
    alt: `${symbol ?? 'token'} logo`,
    size,
  }

  const src = icon

  return (
    <LogoContainer style={style}>
      {src ? (
        <LogoImage {...imageProps} src={src} useBG={true} />
      ) : (
        <MissingImageLogo size={size}>
          {/* use only first 3 characters of Symbol for design reasons */}
          {symbol?.toUpperCase().replace('$', '').replace(/\s+/g, '').slice(0, 3)}
        </MissingImageLogo>
      )}
    </LogoContainer>
  )
}
