// import { Trans } from '@lingui/macro' //This is for localization and translation on all languages
import { useBalance, useInkathon } from '@scio-labs/use-inkathon';
import { shortenAddress } from 'helpers/address';
import { styled, useTheme } from '@mui/material/styles';
import { Grid, useMediaQuery } from '@mui/material';
import { HeaderChip } from 'components/Layout/ProfileSection';
import { RowBetween, RowFixed } from '../Row';
import { SubHeader } from '../Text';
import { useSorobanReact } from '@soroban-react/core';
import { ArrowDropDownSharp } from '@mui/icons-material';
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
  const { isConnected, activeAccount, error, activeChain, isConnecting, disconnect } = useInkathon();
  const { address } = useSorobanReact();
  const { balanceFormatted,   } = useBalance(activeAccount?.address, true);
  const theme = useTheme();
  const fiatOnRampButtonEnabled = true;
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const paddingX = {padding: '0px 12px'}
  const showBalances = () => {
    console.log(balanceFormatted);
  }

  return (
    <StyledBridgeHeader>
      {/* <Button onClick={()=>showBalances()}>Show balances</Button> */}
      <Grid container>
        <Grid item xs={4}>
          <HeaderButtonContainer>
            <SubHeader fontSize={isMobile ? 14 : undefined}>Bridge</SubHeader>
          </HeaderButtonContainer>
        </Grid>
        {activeAccount && activeChain && address && (
          <>
            <Grid item xs={8} alignContent={'center'}>
              <Grid container columnSpacing={2}>
                <Grid item xs={5}>
                  <HeaderChip label={activeChain?.name} isSmall/>
                </Grid>
                <Grid item xs={7} style={paddingX}>
                  <HeaderChip label={
                      <>
                        {shortenAddress(activeAccount?.address!)}
                        <ArrowDropDownSharp key={'action-icon'} className='MuiChip-action-icon'/>
                      </>
                    } canDisconnect isSmall disconnect={()=>disconnect!()}/>
                </Grid>
              </Grid>
            </Grid>
            <Grid container>
              <Grid item xs={6} style={paddingX}>
                Native asset balance:
              </Grid>
              <Grid item xs={6} textAlign={'end'} style={paddingX}>
                {balanceFormatted}
              </Grid>
            </Grid>
          </>
        )}
      </Grid>
    </StyledBridgeHeader>
  );
}
