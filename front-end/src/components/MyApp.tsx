import React from 'react';
import DogGrid from './DogGrid';
import ButtonAppBar from './ButtonAppBar';
import MySorobanReactProvider from '../soroban/MySorobanReactProvider';


export default function MyApp() {
  return (
      <MySorobanReactProvider>
        <ButtonAppBar/>
        <DogGrid/>
      </MySorobanReactProvider>
  )
}
