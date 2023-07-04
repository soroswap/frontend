import {React, useState} from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import { Typography } from '@mui/material';
import {SwapButton} from '../soroban/SwapButton';
import { useIsPetAdopted } from '../soroban/useIsPetAdopted';
import { SorobanContextType, useSorobanReact } from '@soroban-react/core';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import { type } from 'os';
import Button from '@mui/material/Button';



import * as SorobanClient from 'soroban-client'
import BigNumber from 'bignumber.js'
import {useContractValue, useSendTransaction} from '@soroban-react/contracts'
//import {useSendTransaction} from '../useSendTransaction'
import {scvalToString} from '@soroban-react/utils'
import { setTrustline } from '../setTrustline';
import {MintButton} from './buttons/MintButton'
import { useTokens } from '../hooks/useTokens';

export function Mint() {
  const sorobanContext = useSorobanReact()
  const tokensList = useTokens(sorobanContext)

  const [inputToken, setInputToken] = useState(tokensList[0]);
  const [mintTokenId, setMintTokenId] = useState(tokensList[0]?.token_address);
  const [tokenSymbol, setTokenSymbol] = useState(tokensList[0]?.token_symbol);
  const [amount, setAmount] = useState(BigNumber(0));
    
  console.log("🚀 « tokensList:", tokensList)

  const handleInputTokenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedToken = tokensList.find((token) => token.token_symbol == event.target.value)

    if (selectedToken) {
      setInputToken(selectedToken);
      setMintTokenId(selectedToken.token_address)
      setTokenSymbol(selectedToken.token_symbol)
    }
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(BigNumber(event.target.value))
  };

  // TODO: REMOVE HARDOCDED SYMBOL
  /*
  let symbol = useContractValue({ 
    contractId: tokenId,
    method: 'symbol',
    sorobanContext
  })
  const tokenSymbol = symbol.result && scvalToString(symbol.result)?.replace("\u0000", "")

*/
  
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
          tokenSymbol={tokenSymbol}
          amountToMint={amount}
        />
      </CardActions>
    </Card>
  );
}