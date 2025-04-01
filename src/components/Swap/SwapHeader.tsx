// import { Trans } from '@lingui/macro' //This is for localization and translation on all languages
import { styled, useTheme } from 'soroswap-ui';
import { RowBetween, RowFixed } from '../Row';
import { SubHeader } from '../Text';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import SettingsTab from '../Settings/index';
import { useMediaQuery } from 'soroswap-ui';
import { DEFAULT_SLIPPAGE_INPUT_VALUE } from 'components/Settings/MaxSlippageSettings';
const StyledSwapHeader = styled(RowBetween)(({ theme }) => ({
  marginBottom: 10,
  color: theme.palette.secondary.main,
}));

const HeaderButtonContainer = styled(RowFixed)`
  padding: 0 12px;
  gap: 16px;
`;

export default function SwapHeader({
  autoSlippage,
  chainId,
  trade,
}: {
  autoSlippage?: number;
  chainId?: number;
  trade?: boolean;
}) {
  const theme = useTheme();
  const fiatOnRampButtonEnabled = false;
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <StyledSwapHeader>
      <HeaderButtonContainer>
        <SubHeader fontSize={isMobile ? 14 : undefined}>
          Swap
          {/* <Trans>Swap</Trans> */}
        </SubHeader>
        {fiatOnRampButtonEnabled && (
          <SubHeader fontSize={isMobile ? 14 : undefined} color={'#7780A0'}>
            Buy
          </SubHeader>
        )}
      </HeaderButtonContainer>
      <RowFixed style={{ padding: '6px 12px' }}>
        <SettingsTab autoSlippage={DEFAULT_SLIPPAGE_INPUT_VALUE} />
      </RowFixed>
    </StyledSwapHeader>
  );
}
