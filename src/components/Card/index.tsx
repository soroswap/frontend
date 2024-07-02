import { Box, styled } from 'soroswap-ui';

const Card = styled(Box, {
  shouldForwardProp: (prop) => prop !== '$borderRadius',
})<{ width?: string; padding?: string; border?: string; $borderRadius?: string }>`
  width: ${({ width }) => width ?? '100%'};
  padding: ${({ padding }) => padding ?? '1rem'};
  border-radius: ${({ $borderRadius }) => $borderRadius ?? '16px'};
  border: ${({ border }) => border};
`;
export default Card;

export const LightCard = styled(Card)`
  border: 1px solid ${({ theme }) => theme.palette.customBackground.interactive};
  background-color: ${({ theme }) => theme.palette.customBackground.bg1};
`;

export const GrayCard = styled(Card)`
  background-color: ${({ theme }) => theme.palette.customBackground.bg3};
`;

export const DarkGrayCard = styled(Card)`
  background-color: ${({ theme }) => theme.palette.background.paper};
`;

export const DarkCard = styled(Card)`
  background-color: ${({ theme }) => theme.palette.customBackground.surface};
`;

export const OutlineCard = styled(Card)`
  border: 1px solid ${({ theme }) => theme.palette.customBackground.bg3};
`;

export const YellowCard = styled(Card)`
  background-color: rgba(243, 132, 30, 0.05);
  color: ${({ theme }) => theme.palette.custom.deprecated_yellow3};
  font-weight: 500;
`;

export const BlueCard = styled(Card)`
  background-color: ${({ theme }) => theme.palette.custom.deprecated_primary5};
  color: ${({ theme }) => theme.palette.customBackground.accentAction};
  border-radius: 12px;
`;
