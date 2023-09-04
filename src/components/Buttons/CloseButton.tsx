import { styled } from "@mui/material";
import { X } from "react-feather";

export const CloseButton = styled(X)<{ onClick: () => void }>`
  color: ${({ theme }) => theme.palette.primary.main};
  width: 32px;
  height: 32px;
  cursor: pointer;
`