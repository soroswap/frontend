import { Box, Button, Paper, Tab, Tabs, Typography, styled } from '@mui/material';
import {
  useBalance,
  useInkathon
} from '@scio-labs/use-inkathon';
import { useSorobanReact } from '@soroban-react/core';
import { IssueComponent } from 'components/Bridge/Issue';
import { RedeemComponent } from 'components/Bridge/Redeem';
import SEO from 'components/SEO';
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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

export default function BalancesPage() {
  const sorobanContext = useSorobanReact();
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

  const [value, setValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
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

  return (
    <>
      <SEO title="Bridge - Soroswap" description="Soroswap" />
      <PageWrapper>
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleTabChange} aria-label="basic tabs example">
              <Tab label="to Pendulum" />
              <Tab label="back to stellar"/>
            </Tabs>
          </Box>
          <CustomTabPanel value={value} index={0}>
            <IssueComponent />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <RedeemComponent />
          </CustomTabPanel>
        </Box>

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
          </>
        )}
        <Button onClick={() => console.log(sorobanContext)}>TEST</Button>
      </PageWrapper>
    </>
  );
}
