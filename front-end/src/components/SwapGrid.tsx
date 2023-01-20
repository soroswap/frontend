import React from 'react';
import Grid from '@mui/material/Grid';
import {SwapComponent} from './SwapComponent'


export default function DogGrid() {

  return (

  <Grid
    container
    columns={{ xs: 4, sm: 8, md: 10 }}
    direction='row'
    alignItems="center"
    justifyContent="center">
      
    <SwapComponent/>
  </Grid>   
  )
}