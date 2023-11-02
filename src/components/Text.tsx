import { Typography, styled } from '@mui/material';

export const SubHeaderLarge = styled(Typography)<{ color?: string; fontWeight?: number }>(
  ({ theme, color, fontWeight }) => ({
    fontWeight: fontWeight ?? 500,
    fontSize: 20,
    color: color ?? theme.typography.subtitle1.color,
    lineHeight: '24px',
  }),
);

export const BodySecondary = styled(Typography)<{ color?: string; fontWeight?: number }>(
  ({ theme, color, fontWeight }) => ({
    fontWeight: fontWeight ?? 400,
    fontSize: 16,
    color: color ?? theme.typography.subtitle1.color,
    lineHeight: '24px',
  }),
);

export const SubHeader = styled(Typography)<{
  color?: string;
  fontWeight?: number;
  fontSize?: number;
  component?: string;
}>(({ theme, color, fontWeight, fontSize, component }) => ({
  fontWeight: fontWeight ?? 500,
  fontSize: fontSize ?? 24,
  color: color ?? theme.typography.subtitle1.color,
  lineHeight: '24px',
  [theme.breakpoints.down('sm')]: {
    fontSize: 14,
  },
}));

export const SubHeaderSmall = styled(Typography)<{ color?: string; fontWeight?: number }>(
  ({ theme, color, fontWeight }) => ({
    fontWeight: fontWeight ?? 500,
    fontSize: 14,
    color: color ?? theme.typography.subtitle1.color,
    lineHeight: '24px',
  }),
);

export const ButtonTextSecondary = styled(Typography)<{ color?: string; fontWeight?: number }>(
  ({ theme, color, fontWeight }) => ({
    fontWeight: fontWeight ?? 500,
    fontSize: 16,
    color: color ?? theme.palette.secondary.main,
    lineHeight: '24px',
  }),
);

export const ButtonText = styled(Typography)<{ color?: string; fontWeight?: number }>(
  ({ theme, color, fontWeight }) => ({
    fontWeight: fontWeight ?? 500,
    fontSize: 20,
    color: color ?? theme.palette.custom.accentTextLightPrimary,
  }),
);

export const BodySmall = styled(Typography)<{
  color?: string;
  fontWeight?: number;
  fontSize?: number;
  component?: string;
}>(({ theme, color, fontWeight, fontSize, component }) => ({
  fontWeight: fontWeight ?? 400,
  fontSize: fontSize ?? 14,
  color: color ?? theme.typography.subtitle1.color,
  lineHeight: '24px',
  [theme.breakpoints.down('md')]: {
    fontSize: 12,
  },
  '& > span': {
    display: 'block',
  },
}));

export const BodyPrimary = styled(Typography)<{ color?: string; fontWeight?: number }>(
  ({ theme, color, fontWeight }) => ({
    fontWeight: fontWeight ?? 400,
    fontSize: 16,
    color: color ?? theme.typography.subtitle1.color,
    lineHeight: '24px',
  }),
);

export const HeadlineMedium = styled(Typography)<{ color?: string; fontWeight?: number }>(
  ({ theme, color, fontWeight }) => ({
    fontWeight: fontWeight ?? 500,
    fontSize: 28,
    color: color ?? theme.typography.subtitle1.color,
    lineHeight: '24px',
  }),
);

export const HeadlineLarge = styled(Typography)<{ color?: string; fontWeight?: number }>(
  ({ theme, color, fontWeight }) => ({
    fontWeight: fontWeight ?? 600,
    fontSize: 36,
    color: color ?? theme.typography.subtitle1.color,
    lineHeight: '24px',
  }),
);

export const HeadlineSmall = styled(Typography)<{ color?: string; fontWeight?: number }>(
  ({ theme, color, fontWeight }) => ({
    fontWeight: fontWeight ?? 600,
    fontSize: 20,
    color: color ?? theme.typography.subtitle1.color,
    lineHeight: '24px',
  }),
);

export const Caption = styled(Typography)<{ color?: string; fontWeight?: number }>(
  ({ theme, color, fontWeight }) => ({
    fontWeight: fontWeight ?? 400,
    fontSize: 12,
    color: color ?? theme.typography.subtitle1.color,
    lineHeight: '24px',
  }),
);

export const LabelSmall = styled(Typography)<{ color?: string; fontWeight?: number }>(
  ({ theme, color, fontWeight }) => ({
    fontWeight: fontWeight ?? 600,
    fontSize: 14,
    color: color ?? theme.typography.subtitle1.color,
    lineHeight: '24px',
  }),
);

export const ResponsiveMediumText = styled(Typography)<{ color?: string; fontWeight?: number }>(
  ({ theme, color, fontWeight }) => ({
    fontWeight: fontWeight ?? 500,
    fontSize: '1.9vh',
    color: color ?? theme.typography.subtitle1.color,
    lineHeight: '24px',
  }),
);

export const HideSmall = styled('span')`
  display: none;
`;
