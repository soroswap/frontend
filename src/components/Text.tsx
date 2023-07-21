import { Typography, styled } from "@mui/material";

export const SubHeader = styled(Typography)<{color?: string}>(({ theme, color }) => ({
  fontWeight: 500,
  fontSize: 16,
  color: color ?? theme.typography.subtitle1.color,
  lineHeight: "24px",
}));

export const BodySmall = styled(Typography)<{color?: string}>(({ theme, color }) => ({
  fontWeight: 400,
  fontSize: 14,
  color: color ?? theme.typography.subtitle1.color,
  lineHeight: "24px",
}));

export const BodyPrimary = styled(Typography)<{color?: string}>(({ theme, color }) => ({
  fontWeight: 400,
  fontSize: 16,
  color: color ?? theme.typography.subtitle1.color,
  lineHeight: "24px",
}));