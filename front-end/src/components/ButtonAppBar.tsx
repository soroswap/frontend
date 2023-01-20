import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import {WalletData} from '@soroban-react/wallet-data'
import { useSorobanReact } from '@soroban-react/core'

export default function ButtonAppBar() {
  const sorobanContext=useSorobanReact()
  return (

      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Pet Adopt Dapp in Soroban
          </Typography>
          <WalletData sorobanContext={sorobanContext} />
        </Toolbar>
      </AppBar>
  
  );
}
