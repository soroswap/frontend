import { Tooltip, TooltipProps, styled, tooltipClasses } from "@mui/material";

export enum TooltipSize {
  ExtraSmall = '200px',
  Small = '256px',
  Large = '400px',
}

export const MouseoverTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.black,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.black,
    width: "calc(100vw - 16px)",
    cursor: "default",
    padding: "12px",
    pointerEvents: "auto",
    color: "#FFFFFF",
    fontWeight: 400,
    fontSize: "12px",
    lineHeight: "16px",
    wordBreak: "break-word",
    borderRadius: "12px",
    border: "1px solid #293249",
    boxShadow: "0 4px 8px 0 rgba(0,0,0,0.1)",
    maxWidth: 256,
  },
}));