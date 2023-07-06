import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import { Typography } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import { useTokens } from '../hooks/useTokens';
import { SorobanContext, useSorobanReact } from '@soroban-react/core'
import TokensDropdown from './TokensDropwndown';

import {ProvideLiquidityButton} from './buttons/ProvideLiquidityButton';
import { TokenType } from '../interfaces/tokens';
import { usePairExist } from '../hooks/usePairExist';
import { useTokenBalance, useFactory } from '../hooks';
// import { usePairContractAddress } from '../hooks/usePairContractAddress';

export function ProvideLiquidity (){
    const sorobanContext=useSorobanReact()
    const tokens = useTokens(sorobanContext)

    const [inputToken, setInputToken] = React.useState<TokenType|null>(null);
    const [outputToken, setOutputToken] = React.useState<TokenType|null>(null);
    const [inputTokenAmount, setInputTokenAmount] = React.useState(0);
    const [outputTokenAmount, setOutputTokenAmount] = React.useState(0);

    //const pairAddress = usePairContractAddress(inputToken?.token_address ?? "", outputToken?.token_address ?? "", sorobanContext)
    //const pairBalance = useTokenBalance(pairAddress ?? "", sorobanContext.address)

    const handleInputTokenChange = (event: React.ChangeEvent<{ value: string}>) => {
      const token = tokens.find((token) => 
          token.token_symbol === event.target.value
      ) ?? null
      setInputToken(token);
    }
    const handleOutputTokenChange = (event: React.ChangeEvent<{ value: string }>) => {
      const token = tokens.find((token) => 
          token.token_symbol === event.target.value
      ) ?? null
      setOutputToken(token);
    }

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
        </CardContent>
        {(sorobanContext.address && tokens.length>0) ?
      (<div>

        <CardContent>
        <p>.</p>
        <TokensDropdown tokens={tokens} onChange={handleInputTokenChange} title={"Input token"}/>
        <FormControl>
          
          <InputLabel htmlFor="outlined-adornment-amount">Amount Input</InputLabel>
          <OutlinedInput
            type="number"
            id="outlined-adornment-amount"
            startAdornment={<InputAdornment position="start">
              {inputToken?.token_name}
            </InputAdornment>}
            value={inputTokenAmount}
            label={"Amount"}
            onChange={handleInputTokenAmountChange}
          />
        </FormControl>
        <p>.</p>
        <TokensDropdown
          tokens={tokens}
          onChange={handleOutputTokenChange} 
          title={"Output token"}
          inputToken={inputToken}
        />
        <FormControl>
          
        
          <InputLabel htmlFor="outlined-adornment-amount">Amount Output</InputLabel>
          <OutlinedInput
            type="number"
            id="outlined-adornment-amount"
            startAdornment={<InputAdornment position="start">
              {outputToken?.token_name}
            </InputAdornment>}
            value={outputTokenAmount}
            label="Amount"
            onChange={handleOutputTokenAmountChange}
          />
        </FormControl>

        {/* <p>Current pair address {pairAddress}</p> */}
        <p>Current pair balance {}</p>
        <p>Liquidity Pool tokens to receive: TODO</p>

      


        </CardContent>
        <CardActions>
          <ProvideLiquidityButton
              inputTokenAmount_1 = {inputTokenAmount}
              inputTokenAmount_2 = {outputTokenAmount}
          />
        </CardActions>

      </div>
      
      ):(<div>Connect your Wallet</div>)}
       
    </Card>
  );
}
