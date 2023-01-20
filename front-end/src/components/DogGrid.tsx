import React from 'react';
import Grid from '@mui/material/Grid';
import {DogComponent, DogComponentProps} from './DogComponent'

let pets = require('../pets.json');

export default function DogGrid() {

  return (

  <Grid
    container
    columns={{ xs: 4, sm: 8, md: 10 }}
    direction='row'
    alignItems="center"
    justifyContent="center">
      
    {pets &&
      pets.map(
        ({id, ...dogProps}: DogComponentProps) =>
        <DogComponent id={id} key={id} {...dogProps}/>
        )
      }
  </Grid>   
  )
}