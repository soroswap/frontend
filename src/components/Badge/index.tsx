import { Theme, styled } from '@mui/material'
import { readableColor } from 'polished'
import { PropsWithChildren } from 'react'

export enum BadgeVariant {
  DEFAULT = 'DEFAULT',
  NEGATIVE = 'NEGATIVE',
  POSITIVE = 'POSITIVE',
  PRIMARY = 'PRIMARY',
  WARNING = 'WARNING',
  PROMOTIONAL = 'PROMOTIONAL',
  BRANDED = 'BRANDED',
  SOFT = 'SOFT',

  WARNING_OUTLINE = 'WARNING_OUTLINE',
}

interface BadgeProps {
  variant?: BadgeVariant
}

function pickBackgroundColor(variant: BadgeVariant | undefined, theme: Theme): string {
  switch (variant) {
    case BadgeVariant.BRANDED:
      return "linear-gradient(139.57deg, #FF79C9 4.35%, #FFB8E2 96.44%);"
    case BadgeVariant.PROMOTIONAL:
      return "radial-gradient(101.8% 4091.31% at 0% 0%, #4673FA 0%, #9646FA 100%);"
    case BadgeVariant.NEGATIVE:
      return theme.palette.customBackground.accentCritical
    case BadgeVariant.POSITIVE:
      return theme.palette.customBackground.accentSuccess
    case BadgeVariant.SOFT:
      return theme.palette.customBackground.accentActionSoft
    case BadgeVariant.PRIMARY:
      return theme.palette.customBackground.accentAction
    case BadgeVariant.WARNING:
      return theme.palette.customBackground.accentWarning
    case BadgeVariant.WARNING_OUTLINE:
      return 'transparent'
    default:
      return theme.palette.customBackground.interactive
  }
}

function pickBorder(variant: BadgeVariant | undefined, theme: Theme): string {
  switch (variant) {
    case BadgeVariant.WARNING_OUTLINE:
      return `1px solid ${theme.palette.customBackground.accentWarning}`
    default:
      return 'unset'
  }
}

function pickFontColor(variant: BadgeVariant | undefined, theme: Theme): string {
  switch (variant) {
    case BadgeVariant.BRANDED:
      return theme.palette.custom.accentTextDarkPrimary
    case BadgeVariant.NEGATIVE:
      return readableColor(theme.palette.error.main)
    case BadgeVariant.POSITIVE:
      return readableColor(theme.palette.customBackground.accentSuccess)
    case BadgeVariant.SOFT:
      return theme.palette.customBackground.accentAction
    case BadgeVariant.WARNING:
      return readableColor(theme.palette.customBackground.accentWarning)
    case BadgeVariant.WARNING_OUTLINE:
      return theme.palette.customBackground.accentWarning
    default:
      return readableColor(theme.palette.customBackground.interactive)
  }
}

const Badge = styled('div')<PropsWithChildren<BadgeProps>>`
  align-items: center;
  background: ${({ theme, variant }) => pickBackgroundColor(variant, theme)};
  border: ${({ theme, variant }) => pickBorder(variant, theme)};
  border-radius: 0.5rem;
  color: ${({ theme, variant }) => pickFontColor(variant, theme)};
  display: inline-flex;
  padding: 4px 6px;
  justify-content: center;
  font-weight: 500;
`

export default Badge
