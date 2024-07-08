import { styled } from 'soroswap-ui';
import { X } from 'react-feather';

export const CloseButton = styled(X)<{ onClick: () => void }>`
  color: ${({ theme }) => theme.palette.primary.main};
  width: 32px;
  height: 32px;
  cursor: pointer;
  @media (max-width: ${({ theme }) => theme.breakpoints.values.sm}px) {
    width: 24px;
    height: 24px;
  }
`;
