// import { Trans } from '@lingui/macro' //This is for localization and translation on all languages
import { styled, useTheme } from '@mui/material/styles';
import { RowBetween, RowFixed } from '../Row';
import { SubHeader } from '../Text';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import SettingsTab from '../Settings/index';
import { useMediaQuery } from '@mui/material';
const StyledBridgeHeader = styled(RowBetween)(({ theme }) => ({
  marginBottom: 10,
  color: theme.palette.secondary.main,
}));

const HeaderButtonContainer = styled(RowFixed)`
  padding: 12px 12px;
  gap: 16px;
`;

export default function BridgeHeader({
  autoSlippage,
  chainId,
  trade,
}: {
  autoSlippage?: number;
  chainId?: number;
  trade?: boolean;
}) {
  const theme = useTheme();
  const fiatOnRampButtonEnabled = true;
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <StyledBridgeHeader>
      <HeaderButtonContainer>
        <SubHeader fontSize={isMobile ? 14 : undefined}>Bridge</SubHeader>
      </HeaderButtonContainer>
    </StyledBridgeHeader>
  );
}
