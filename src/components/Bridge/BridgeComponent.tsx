import { Box, Button, Tab, Tabs, Typography } from '@mui/material';
// import useBridgeSettings from 'hooks/bridge/pendulum/useBridgeSettings';
import { useSorobanReact } from '@soroban-react/core';
import useSpacewalkBridge from 'hooks/bridge/pendulum/useSpacewalkBridge';
import { useSpacewalkVaults } from 'hooks/bridge/pendulum/useSpacewalkVaults';
import React, { useState } from 'react';
import { IssueComponent } from './Issue';
import { RedeemComponent } from './Redeem';

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

const BridgeComponent = () => {
  const [value, setValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  // Spacewalk bridge testings
  const { serverHorizon } = useSorobanReact(); 
  const vaultRegistry = useSpacewalkVaults();
  const vaults = vaultRegistry.getVaults();

  // This are the available vaults to bridge, is an [] of vaults and
  // vault.id would be the one used to bridge assets
  // console.log('🚀 « vaults:', vaults);
    
  const handleTestButton = async () => {
    // getVaultStellarPublicKey and Balance test
    if (vaults[0]?.id?.accountId) {
      //This will return the stellar address account that holds the asset to bridge
      //For example index=0 is AUDD and if we ask the balance of this account of AUDD it will be the max
      //amount to be bridge back to Stellar
      const stellarAccount = await vaultRegistry.getVaultStellarPublicKey(vaults[0].id.accountId);
      console.log('🚀 « stellarAccount:', stellarAccount?.publicKey());
      // we could do something like this to get the redeemable balance for this vault on the Stellar side
      if (stellarAccount) {
        const accountloaded = await serverHorizon?.loadAccount(stellarAccount.publicKey())
        console.log('🚀 « account balances:', accountloaded?.balances);
      }
    }
  }

  const spacewalkBridge = useSpacewalkBridge();
  console.log('🚀 « spacewalkBridge:', spacewalkBridge);

  return (
    <>
      <Button onClick={handleTestButton}>TEST</Button>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleTabChange} aria-label="basic tabs example">
          <Tab label="to Pendulum" />
          <Tab label="back to stellar" />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <IssueComponent />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <RedeemComponent />
      </CustomTabPanel>
    </>
  );
};

export default BridgeComponent;
