import { styled } from "@mui/material";
import { X } from "react-feather";

export const CloseButton = styled(X)<{ onClick: () => void }>`
  color: ${({ theme }) => theme.palette.primary.main};
  cursor: pointer;
`