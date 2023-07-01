import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import {WalletData} from '@soroban-react/wallet-data'
import { useSorobanReact } from '@soroban-react/core'
import { getPairContractAddress } from '../functions/getPairContractAddress';
import { getPairContractAddress2 } from '../functions/getPairContractAddress2';

export default function ButtonAppBar() {
  const sorobanContext=useSorobanReact()
    let pairAddress = getPairContractAddress(
      "b4be3b48b230f37dde8e64cc2b4bba5f566bdf05d974d83eb5c331123380a830", 
      //"GBCGW5F2KQ46Z3IXM4ZJJFJ7GMLIOZIV6TZ3AWUMEWANEAOH7JVBZAL7",
      //"GBCGW5F2KQ46Z3IXM4ZJJFJ7GMLIOZIV6TZ3AWUMEWANEAOH7JVBZAL7",
      "85a7011dbbed238bd6d42f649e9c9be6fa093bfc62eba1560b95384c3c1ccfcb", 
      sorobanContext,
    )
    console.log(`pair address ${pairAddress}`)
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
