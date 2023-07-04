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
    //"d91ad3087fd994cd5992b2c6c280ee2760dd27bc23ab0007e4d6fa9b86c5eb8f",
    //"c8ce7616473322577a8d5d159d746b6f347fa1b159b0276dc2f0d0ddd7722240",
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
