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
    "CDMRVUYIP7MZJTKZSKZMNQUA5YTWBXJHXQR2WAAH4TLPVG4GYXVY7GQG", 
    "CBQOMCVBVOEH72Q3LSLPVIDZZVE4OWBLYG2DRBP3U3SCGKRBCZIT43BB", 
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
