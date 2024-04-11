import SEO from 'components/SEO';

import { Box, MenuItem, Paper, Select, SelectChangeEvent, Typography, styled } from '@mui/material';
import {
  allSubstrateChains,
  getSubstrateChain,
  useBalance,
  useInkathon,
} from '@scio-labs/use-inkathon';
import { IssueComponent } from 'components/Bridge/Pendulum/Issue';
import { RedeemComponent } from 'components/Bridge/Pendulum/Redeem';
import { ButtonPrimary } from 'components/Buttons/Button';
import { useState } from 'react';

const PageWrapper = styled(Paper)`
  background: ${({ theme }) => `linear-gradient(${theme.palette.customBackground.bg2}, ${
    theme.palette.customBackground.bg2
  }) padding-box,
              linear-gradient(150deg, rgba(136,102,221,1) 0%, rgba(${
                theme.palette.mode == 'dark' ? '33,29,50,1' : '255,255,255,1'
              }) 35%, rgba(${
                theme.palette.mode == 'dark' ? '33,29,50,1' : '255,255,255,1'
              }) 65%, rgba(136,102,221,1) 100%) border-box`};
  border: 1px solid transparent;
  border-radius: 16px;
  padding: 32px 48px;
  width: 100%;
  max-width: 860px;
`;

export default function BalancesPage() {
  const {
    connect,
    isConnected,
    activeAccount,
    error,
    activeChain,
    disconnect,
    switchActiveChain,
    isConnecting,
    activeSigner,
    api
  } = useInkathon();

  const { balanceFormatted } = useBalance(activeAccount?.address, true);

  const [selectedNetwork, setSelectedNetwork] = useState(allSubstrateChains[0].network);

  const handleConnect = async () => {
    const substrateChain = getSubstrateChain(selectedNetwork);
    
    await connect?.(substrateChain);
  };

  const getStatusMessage = () => {
    if (isConnected) {
      return 'Connected';
    } else if (error?.message) {
      return error.message;
    } else if (isConnecting) {
      return 'Connecting...';
    } else {
      return 'Disconnected';
    }
  };

  const handleNetworkChange = (event: SelectChangeEvent) => {
    const value = event.target.value as string;

    setSelectedNetwork(value);

    if (isConnected) {
      const chain = getSubstrateChain(value);

      if (chain) {
        switchActiveChain?.(chain);
      }
    }
  };

  return (
    <>
      <SEO title="Bridge - Soroswap" description="Soroswap" />
      <PageWrapper>
        <Box mb={2}>
          <Typography variant="h6">Network</Typography>
          <Select value={selectedNetwork} onChange={handleNetworkChange}>
            {allSubstrateChains.map((chain) => (
              <MenuItem key={chain.network} value={chain.network}>
                {chain.name}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <ButtonPrimary disabled={isConnected || isConnecting} onClick={handleConnect}>
          Connect Polkadot Wallet
        </ButtonPrimary>

        <Typography variant="h6" mt={2}>
          {getStatusMessage()}
        </Typography>

        {isConnected && (
          <>
            <Box>
              <Typography variant="h6" mt={2}>
                Network
              </Typography>
              <Typography variant="body1">{activeChain?.name}</Typography>
            </Box>
            <Box>
              <Typography variant="h6" mt={2}>
                Account
              </Typography>
              <Typography variant="body1">{activeAccount?.address}</Typography>
            </Box>

            <Box>
              <Typography variant="h6" mt={2}>
                Balance
              </Typography>
              <Typography variant="body1">{balanceFormatted}</Typography>
            </Box>

            <ButtonPrimary sx={{ mt: 2 }} onClick={disconnect}>
              Disconnect
            </ButtonPrimary>
          </>
        )}
        <IssueComponent />
        <RedeemComponent />
      </PageWrapper>
    </>
  );
}
