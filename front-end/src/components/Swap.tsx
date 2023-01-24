import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import { Typography } from '@mui/material';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';


import {SwapButton} from './buttons/SwapButton'
import {currencies} from '../currencies'



export function Swap ({balancesBigNumber}:{balancesBigNumber: any}){
  const [inputToken, setInputToken] = React.useState(currencies[0]);
  const [outputToken, setOutputToken] = React.useState(currencies[1]);
  
  
  const [inputTokenAmount, setInputTokenAmount] = React.useState(0);
  const [outputTokenAmount, setOutputTokenAmount] = React.useState(0);

    const handleInputTokenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if(event.target.value == currencies[0].value){
        setInputToken(currencies[0]);
        setOutputToken(currencies[1]);
      }
      else{
        setInputToken(currencies[1]);
        setOutputToken(currencies[0]);
      }
    };

    const handleInputTokenAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
     
      setInputTokenAmount(event.target.valueAsNumber)
      setOutputTokenAmount(inputToOutput(event.target.valueAsNumber))   
    };

    const inputToOutput = (n: number) => {
      if(inputToken.value == currencies[0].value){
        if (balancesBigNumber){
          // let a = balancesBigNumber.liquidityPoolBalance_1.multipliedBy(balancesBigNumber.liquidityPoolBalance_2)
          // let b = balancesBigNumber.liquidityPoolBalance_1.plus(BigNumber(n))
          // let fraction = a.dividedBy(b)
          // let result = balancesBigNumber.liquidityPoolBalance_2.minus(fraction)
          // return (parseInt(result.toString()))
          
          let ra = parseInt(balancesBigNumber.liquidityPoolBalance_1.toString())/10000000
          let rb = parseInt(balancesBigNumber.liquidityPoolBalance_2.toString())/10000000
          let fraction = (ra*rb)/(ra+n)
          console.log("fraction: ", fraction)
          console.log("rb: ", rb)
          return rb- fraction

        }
        return n*2
      }
      else{
        let ra = parseInt(balancesBigNumber.liquidityPoolBalance_1.toString())/10000000
        let rb = parseInt(balancesBigNumber.liquidityPoolBalance_2.toString())/10000000
        let fraction = (rb*ra)/(rb+n)
        console.log("fraction: ", fraction)
        console.log("rb: ", rb)
        return ra- fraction
      }

    };


    return (   
    <Card sx={{ maxWidth: 345 }}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
       Swap your favourite tokens
        </Typography>
        <TextField
          id="outlined-select-currency"
          select
          label="Input token"
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
          <InputLabel htmlFor="outlined-adornment-amount">Amount Input Token</InputLabel>
          <OutlinedInput
            type="number"
            id="outlined-adornment-amount"
            startAdornment={<InputAdornment position="start">
              {inputToken.shortlabel}
            </InputAdornment>}
            label="Amount"
            onChange={handleInputTokenAmountChange}
          />
        </FormControl>
        <p>.</p>
        <FormControl>
          <InputLabel htmlFor="outlined-adornment-amount">Amount Output Token</InputLabel>
          <OutlinedInput
            inputProps={{
              readOnly: true,
            }}
            type="number"
            id="outlined-adornment-amount"
            startAdornment={<InputAdornment position="start">
              {outputToken.shortlabel}
            </InputAdornment>}
            value={outputTokenAmount}
            label="Amount"
          />
        </FormControl>

        <p>.</p>
        <p>1 {inputToken.label} = {inputToOutput(1)} {outputToken.label}</p>

      </CardContent>
      <CardActions>
        <SwapButton
          outputToken={outputToken}
          outputTokenAmount={outputTokenAmount}
          inputTokenAmount={inputTokenAmount}
        ></SwapButton>
      </CardActions>
      
    </Card>
  );
}