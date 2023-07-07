import * as React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import Box from '@mui/material/Box';
import CardContent from "@mui/material/CardContent";
import { Typography } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import { useTokens } from "../hooks/useTokens";
import { usePairs } from "../hooks/usePairs";
import { useReservesBigNumber } from "../hooks/useReserves";

import { useSorobanReact } from "@soroban-react/core";
import TokensDropdown from "./TokensDropwndown";
import { SorobanContextType } from "@soroban-react/core";
import { TokenType } from "../interfaces/tokens";
import { DepositButton } from "./buttons/DepositButton";
import BigNumber from "bignumber.js";
import { PairBalance } from "./PairBalance";
import { useAllPairsFromTokens } from "../hooks/usePairExist";
import calculatePoolTokenOptimalAmount from "../functions/calculatePoolTokenOptimalAmount";

export function ProvideLiquidity() {
  const sorobanContext = useSorobanReact();
  const tokens = useTokens(sorobanContext);
  const jsonPairs = usePairs(sorobanContext);
  

  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Provide Liquidity
        </Typography>
      </CardContent>
      {sorobanContext.address && tokens?.length > 0 && jsonPairs?.length > 0 ? (
        <ProvideLiquidityWallet
          sorobanContext={sorobanContext}
          tokens={tokens}
          jsonPairs={jsonPairs}
        />
      ) : (
        <div>Connect your Wallet</div>
      )}
    </Card>
  );
}

function ProvideLiquidityWallet({
  sorobanContext,
  tokens,
  jsonPairs,
}: {
  sorobanContext: SorobanContextType;
  tokens: TokenType[];
  jsonPairs: any;
}) {

  const allPairs = useAllPairsFromTokens(tokens)
  
  const [inputToken, setInputToken] = React.useState<TokenType>(tokens[0]);
  const [outputToken, setOutputToken] = React.useState<TokenType | null>(null);
  const [inputTokenAmount, setInputTokenAmount] = React.useState(0);
  const [outputTokenAmount, setOutputTokenAmount] = React.useState(0);
  const [pairExist, setPairExist] = React.useState<boolean| undefined>(undefined);
  const [pairAddress, setPairAddress] = React.useState<string|undefined>(undefined);

  function getPairExists(token0: any, token1: any,  allPairs: any) {
    return allPairs.some((pair: any) => {
      return (
        (pair.token_0 === token0 && pair.token_1 === token1) ||
        (pair.token_1 === token1 && pair.token_0 === token0)
      );
    });
  }

  React.useEffect(() => {
    // Code to run when the component mounts or specific dependencies change
    setPairExist(getPairExists(inputToken, outputToken, allPairs))

    let selectedPair = allPairs.find((pair: any) => {
        return pair.token_0.token_address === inputToken.token_address && pair.token_1.token_address  === outputToken?.token_address
    })
    if (selectedPair)
    setPairAddress(selectedPair.pair_address)

    console.log("🚀 ~ file: ProvideLiquidity.tsx:90 ~ React.useEffect ~ getPairExists(inputToken, outputToken, allPairs):", getPairExists(inputToken, outputToken, allPairs))

  }, [inputToken, outputToken]); // Dependencies array

  const handleInputTokenChange = (
    event: React.ChangeEvent<{ value: string }>,
  ) => {
    const token =
      tokens.find((token) => token.token_symbol === event.target.value);
    setInputToken(token!);
  };
  const handleOutputTokenChange = (
    event: React.ChangeEvent<{ value: string }>,
  ) => {
    const token =
      tokens.find((token) => token.token_symbol === event.target.value) ?? null;
    setOutputToken(token);
  };

  const handleInputTokenAmountChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setInputTokenAmount(event.target.valueAsNumber);
    setOutputTokenAmount(inputToOutput(event.target.valueAsNumber));
  };

  const inputToOutput = (n: number) => {
    return n;
  };

  return (
    <div>
    <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
            <div>
        <TokensDropdown tokens={tokens} onChange={handleInputTokenChange} title={"Input token"}/>
        {pairExist ? 
        <FormControl sx={{ m: 1, width: '25ch' }}>
          <InputLabel htmlFor="outlined-adornment-amount">
            Amount Input
          </InputLabel>
          
          <OutlinedInput
            type="number"
            id="outlined-adornment-amount"
            startAdornment={
              <InputAdornment position="start">
                {inputToken?.token_name}
              </InputAdornment>
            }
            value={inputTokenAmount}
            label={"Amount"}
            onChange={handleInputTokenAmountChange}
          />
        </FormControl>: null}
        
      </div>
      <div>
        <TokensDropdown
          tokens={tokens}
          onChange={handleOutputTokenChange}
          title={"Output token"}
          inputToken={inputToken}
        />
        {pairExist ? 
        <FormControl>
          <InputLabel htmlFor="outlined-adornment-amount">
            Amount Output
          </InputLabel>
          <OutlinedInput
            type="number"
            id="outlined-adornment-amount"
            startAdornment={
              <InputAdornment position="start">
                {outputToken?.token_name}
              </InputAdornment>
            }
            value={outputTokenAmount}
            label="Amount"
            disabled ={true}
          />
        </FormControl>: null}
        </div>
        {(pairExist && outputToken) ? 
        <ProvideLiquidityPair
          sorobanContext={sorobanContext}
          inputToken={inputToken}
          outputToken={outputToken}
          pairAddress={pairAddress}
          inputTokenAmount={inputTokenAmount}
          outputTokenAmount={outputTokenAmount}
          changeOutput={setOutputTokenAmount}
          />
        : <p>This pair does not exist!</p>}
      </Box>
      
    </div>
  );
}


function ProvideLiquidityPair({
  sorobanContext,
  inputToken,
  outputToken,
  pairAddress,
  inputTokenAmount,
  outputTokenAmount,
  changeOutput
}: {
  sorobanContext: SorobanContextType;
  inputToken: TokenType;
  outputToken: TokenType;
  pairAddress: any;
  inputTokenAmount: any;
  outputTokenAmount: any
  changeOutput: any
}) {

  const reserves = useReservesBigNumber(pairAddress, sorobanContext);
  console.log("🚀 ~ file: ProvideLiquidity.tsx:223 ~ reserves:", reserves)
  let optimalToken1Amount = calculatePoolTokenOptimalAmount(BigNumber(inputTokenAmount).shiftedBy(7), reserves.reserve0, reserves.reserve1)
  changeOutput(optimalToken1Amount.shiftedBy(-7).toNumber())

  return(
    
    <div>
        <p>Current pair address {pairAddress}</p>
        <p>Current pair balance</p>
        {sorobanContext.address ? (
          <PairBalance
          pairAddress={pairAddress}
          sorobanContext={sorobanContext}
          />
          ) : (
            0
            )}
        <p>Current token0 reserves {reserves.reserve0.shiftedBy(-7).toString()}</p>
        <p>Current token1 reserves {reserves.reserve1.shiftedBy(-7).toString()}</p>
        <p>Liquidity Pool tokens to receive: TODO</p>
        <CardActions>
        
          <DepositButton
            pairAddress={pairAddress}
            amount0={BigNumber(inputTokenAmount)}
            amount1={BigNumber(outputTokenAmount)}
            sorobanContext={sorobanContext}
          />
      </CardActions>
  </div>
  )

}
