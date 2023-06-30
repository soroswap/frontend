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
import {Constants} from '../constants'
import { setTrustline } from '../setTrustline';
import {currencies} from '../currencies'
import {MintButton} from './buttons/MintButton'
import { useTokens } from '../hooks/useTokens';

export function Mint() {
  const sorobanContext = useSorobanReact()
  const [tokens, setTokens] = useState();
  const [inputToken, setInputToken] = useState(currencies[0]);
  const [mintTokenId, setMintTokenId] = useState(Constants.TokenId_1);
  const [tokenSymbol, setTokenSymbol] = useState(currencies[0].symbol);
  const [amount, setAmount] = useState(BigNumber(0));
    


  const handleInputTokenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value == currencies[0].value) {
      setInputToken(currencies[0]);
      setMintTokenId(Constants.TokenId_1)
      setTokenSymbol(currencies[0].symbol)
    }
    else {
      setInputToken(currencies[1]);
      setMintTokenId(Constants.TokenId_2)
      setTokenSymbol(currencies[1].symbol)
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
  console.log(useTokens(sorobanContext))

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
          defaultValue="XLM"
          onChange={handleInputTokenChange}
        >
{currencies.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
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
              {inputToken.shortlabel}
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
          >
          MINT!
        </MintButton>
      </CardActions>
      
    </Card>
  );
}