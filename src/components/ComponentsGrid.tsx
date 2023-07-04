import React from 'react';
import Grid from '@mui/material/Grid';
import { Swap } from './Swap';
import { Mint } from './Mint';
import { Balances } from './Balances';
import { ProvideLiquidity } from './ProvideLiquidity';

export default function ComponentsGrid() {
  return (
    <Grid
      container
      columns={{ xs: 4, sm: 8, md: 10 }}
      direction='row'
      alignItems='center'
      justifyContent='center'
    >
      <Balances />
      <Mint />
      <ProvideLiquidity />
      <Swap balancesBigNumber={undefined} />
    </Grid>
  );
}
