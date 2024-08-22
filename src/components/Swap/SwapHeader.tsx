// import { Trans } from '@lingui/macro' //This is for localization and translation on all languages
import { Link, styled, useTheme } from 'soroswap-ui';
import { RowBetween, RowFixed } from '../Row';
import SettingsTab from '../Settings/index';
import { useMediaQuery } from 'soroswap-ui';
import { useEffect, useState } from 'react';
const StyledSwapHeader = styled(RowBetween)(({ theme }) => ({
  marginBottom: 10,
  color: theme.palette.secondary.main,
}));

const HeaderButtonContainer = styled(RowFixed)`
  padding: 0 12px;
  gap: 16px;
`;

const SwapLink = styled(Link, {
  shouldForwardProp: (prop) => prop !== 'active',
}) <{ active?: boolean }>`
  display: flex;
  padding: 4px 4px;
  align-items: center;
  gap: 10px;
  text-align: center;
  color: ${({ theme, active }) => (active ? '#FFFFFF' : '#7780A0')};
  font-family: Inter;
  font-size: 20px;
  font-weight: 600;
  line-height: 140%;
  text-decoration: none;
`;

export default function SwapHeader({
  autoSlippage,
  chainId,
  trade,
  active,
  showConfig,
}: {
  autoSlippage?: number;
  chainId?: number;
  trade?: boolean;
  active?: string;
  showConfig: boolean;
}) {
  const theme = useTheme();
  const fiatOnRampButtonEnabled = true;
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeAction, setActiveAction] = useState<'swap' | 'buy'>('swap');
  const href = window.location.pathname;

  useEffect(() => {
    if (href == '/swap') {
      setActiveAction('swap');
    } else if (href == '/buy') {
      setActiveAction('buy');
    }
  }, [href]);

  return (
    <StyledSwapHeader>
      <HeaderButtonContainer>
        <SwapLink href="/swap" active={activeAction == 'swap'}>
          Swap
        </SwapLink>
        {fiatOnRampButtonEnabled && (
          <SwapLink href="/buy" active={activeAction == 'buy'}>
            Buy
          </SwapLink>
        )}
      </HeaderButtonContainer>
      {showConfig ?
        (<RowFixed style={{ padding: '6px 12px' }}>
          <SettingsTab autoSlippage={0.5} />
        </RowFixed>) :
        (false)}

    </StyledSwapHeader>
  );
}
