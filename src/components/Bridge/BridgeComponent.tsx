import { Box, Tab, Tabs, Typography } from '@mui/material';
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
  return (
    <>
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
