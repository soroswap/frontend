import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import { Typography } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';


import {currencies} from '../currencies'
import {Constants} from '../constants'

import {ProvideLiquidityButton} from './buttons/ProvideLiquidityButton';

export function ProvideLiquidity (){
  console.log("Constants: ", Constants)

    /* Here we still use "input" and "output" terms, but it's token1 and token2*/
    
    const [inputToken, setInputToken] = React.useState(currencies[0]);
    const [outputToken, setOutputToken] = React.useState(currencies[1]);

    const [inputTokenAmount, setInputTokenAmount] = React.useState(0);
    const [outputTokenAmount, setOutputTokenAmount] = React.useState(0);


    const handleInputTokenAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {     
      setInputTokenAmount(event.target.valueAsNumber)
      setOutputTokenAmount(inputToOutput(event.target.valueAsNumber))
    };

    const handleOutputTokenAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setInputTokenAmount(outputToInput(event.target.valueAsNumber))
      setOutputTokenAmount(event.target.valueAsNumber)
    };

    const inputToOutput = (n: number) => {
     return n
    };

    const outputToInput = (n: number) => {
      return n
    };


    return (   
    <Card sx={{ maxWidth: 345 }}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
       Provide Liquidity
        </Typography>
       
        <p>.</p>
        <FormControl>
          <InputLabel htmlFor="outlined-adornment-amount">Amount Input {inputToken.shortlabel}</InputLabel>
          <OutlinedInput
            type="number"
            id="outlined-adornment-amount"
            startAdornment={<InputAdornment position="start">
              {inputToken.shortlabel}
            </InputAdornment>}
            value={inputTokenAmount}
            label="Amount"
            onChange={handleInputTokenAmountChange}
          />
        </FormControl>
        <p>.</p>
        <FormControl>
          <InputLabel htmlFor="outlined-adornment-amount">Amount Output {outputToken.shortlabel}</InputLabel>
          <OutlinedInput
            type="number"
            id="outlined-adornment-amount"
            startAdornment={<InputAdornment position="start">
              {outputToken.shortlabel}
            </InputAdornment>}
            value={outputTokenAmount}
            label="Amount"
            onChange={handleOutputTokenAmountChange}
          />
        </FormControl>

        <p>.</p>
        <p>Liquidity Pool tokens to receive: TODO</p>

      </CardContent>
      <CardActions>
        <ProvideLiquidityButton
            inputTokenAmount_1 = {inputToken == currencies[0] ? inputTokenAmount : outputTokenAmount}
            inputTokenAmount_2 = {inputToken == currencies[0] ? outputTokenAmount : inputTokenAmount}
        />
      </CardActions>
      
    </Card>
  );
}