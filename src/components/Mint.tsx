import React, {useEffect, useState} from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import { Typography } from '@mui/material';
import { SorobanContextType, useSorobanReact } from '@soroban-react/core';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';

import BigNumber from 'bignumber.js'
import {MintButton} from './buttons/MintButton'
import { useTokens } from '../hooks/useTokens';
import { TokenType } from '../interfaces';

export function Mint() {
  const sorobanContext: SorobanContextType = useSorobanReact()
  const tokensList = useTokens(sorobanContext)

  const [inputToken, setInputToken] = useState<TokenType>();
  const [mintTokenId, setMintTokenId] = useState<string>("");
  const [amount, setAmount] = useState(BigNumber(0));
    
  const handleInputTokenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedToken = tokensList.find((token) => token.token_symbol == event.target.value)

    if (selectedToken) {
      setInputToken(selectedToken);
      setMintTokenId(selectedToken.token_id)
    }
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(BigNumber(event.target.value))
  };

  useEffect(() => {
    setInputToken(tokensList[0]);
    setMintTokenId(tokensList[0]?.token_id)
  }, [tokensList])
  
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
       Mint 
        </Typography>
        <TextField
          id="outlined-select-currency"
          select
          label="Token to Mint"
          defaultValue="AAAA"
          onChange={handleInputTokenChange}
        >
          {tokensList.map((option) => (
            <MenuItem key={option.token_id} value={option.token_symbol}>
              {`${option.token_name} (${option.token_symbol})`}
            </MenuItem>
          ))}
        </TextField>
        <p>.</p>
        <FormControl>
          <InputLabel htmlFor="outlined-adornment-amount">Amount to Mint</InputLabel>
          <OutlinedInput
            type="number"
            id="outlined-adornment-amount"
            onChange={handleAmountChange}
            startAdornment={<InputAdornment position="start">
              {inputToken?.token_symbol}
            </InputAdornment>}
            label="Amount"
          />
        </FormControl>
      </CardContent>
      <CardActions>
        <MintButton
          sorobanContext={sorobanContext}
          tokenId={mintTokenId}
          amountToMint={amount}
        />
      </CardActions>
    </Card>
  );
}