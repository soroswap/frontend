import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import { Typography } from '@mui/material';
import {AdoptPetButton} from '../soroban/AdoptPetButton';
import { useIsPetAdopted } from '../soroban/useIsPetAdopted';
import { useSorobanReact } from '@soroban-react/core';

//export interface SwapComponentProps {}


export function SwapComponent (){
    const sorobanContext = useSorobanReact()

    return (
    
    <Card sx={{ maxWidth: 345 }}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
        NAME
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <Typography>Age: </Typography>
          <Typography>Breed: </Typography>
          <Typography>Location: </Typography>
          <Typography> Hello</Typography>
        </Typography>
      </CardContent>
      <CardActions>
        <AdoptPetButton id={1}></AdoptPetButton>
      </CardActions>
      
    </Card>
  );
}