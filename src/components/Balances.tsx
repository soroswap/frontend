import React, { FunctionComponent } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { Typography } from '@mui/material';
import { useSorobanReact } from '@soroban-react/core';
import { tokenBalances } from '../hooks/useBalances';

export function Balances() {
  const sorobanContext = useSorobanReact();
  let tokenBalancesResponse;

  if (sorobanContext.address) {
    tokenBalancesResponse = tokenBalances(sorobanContext.address);
  }

  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardContent>
        <Typography gutterBottom variant='h5' component='div'>
          Balances
        </Typography>
        {false ? (
          <p>Loading...</p>
        ) : (
          <div>
            <p>Your wallet balances:</p>
            {tokenBalancesResponse ? (
              tokenBalancesResponse?.map((tokenBalance) => (
                <p key={tokenBalance.address}>
                  {tokenBalance.symbol} : {tokenBalance.balance}
                </p>
              ))
            ) : (
              <p>Connect your wallet to see your tokens</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  1845559424;
}
