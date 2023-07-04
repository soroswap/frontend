import React from 'react';
import Grid from '@mui/material/Grid';
import {Swap} from './Swap'
import {Mint} from './Mint'
import {Balances} from './Balances'
import {ProvideLiquidity} from './ProvideLiquidity'
//import { useBalances } from '../hooks/useBalances';


export default function ComponentsGrid() {

  //let balancesBigNumber = useBalances()

  return (

  <Grid
    container
    columns={{ xs: 4, sm: 8, md: 10 }}
    direction='row'
    alignItems="center"
    justifyContent="center">
    <Balances /> 
    <Mint/>  
    <ProvideLiquidity/>  
    <Swap />
  </Grid>   
  )
}
