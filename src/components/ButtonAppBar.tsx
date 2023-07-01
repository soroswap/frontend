import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import {WalletData} from '@soroban-react/wallet-data'
import { useSorobanReact } from '@soroban-react/core'
import { getPairContractAddress } from '../functions/getPairContractAddress';

export default function ButtonAppBar() {
  const sorobanContext=useSorobanReact()
  console.log(`Pair response: ${getPairContractAddress(
    "d6b39f070885256ca96b91e4d46328ce48a9991014dc560a9838a4cd9c738028", 
    "da32d4750615893e0956ab15e714afd14059fc79b203e2b9059e8101640b3078", 
    sorobanContext,
  )}` )

  return (

      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Soroswap! AMM in Soroban
          </Typography>
          <WalletData sorobanContext={sorobanContext} />
        </Toolbar>
      </AppBar>
  
  );
}
