import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import FormControl from "@mui/material/FormControl";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import * as React from "react";
import { useReservesBigNumber } from "../hooks/useReserves";
import { useTokens } from "../hooks/useTokens";

import BigNumber from "bignumber.js";
import { SorobanContextType, useSorobanReact } from "utils/packages/core/src";
import { CreatePairButton } from "../components/Buttons/CreatePairButton";
import calculatePoolTokenOptimalAmount from "../functions/calculatePoolTokenOptimalAmount";
import fromExactInputGetExpectedOutput from "../functions/fromExactInputGetExpectedOutput";
import fromExactOutputGetExpectedInput from "../functions/fromExactOutputGetExpectedInput";
import { useTokenBalances } from "../hooks";
import { useAllPairsFromTokens } from "../hooks/usePairExist";
import { TokenType } from "../interfaces/tokens";
import { ProvideLiquidityPair } from "./ProvideLiquidityPair";
import { ProvideSwapPair } from "./ProvideSwapPair";
import TokensDropdown from "./TokensDropwndown";


export function ChooseTokens({ isLiquidity }: { isLiquidity: boolean }) {
  // If isLiquidity == false => Means we are in Swap
  const sorobanContext = useSorobanReact();
  const tokens = useTokens(sorobanContext);

  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {isLiquidity ? "Provide Liquidity" : "Swap"} 
        </Typography>
        {sorobanContext.address && tokens?.length > 0 ? (
          <ChooseTokensWallet
            sorobanContext={sorobanContext}
            tokens={tokens}
            isLiquidity={isLiquidity}
          />
        ) : (
          <div>Connect your Wallet</div>
        )}
      </CardContent>
    </Card>
  );
}

function ChooseTokensWallet({
  sorobanContext,
  tokens,
  isLiquidity,
}: {
  sorobanContext: SorobanContextType;
  tokens: TokenType[];
  isLiquidity: boolean;
}) {
  const allPairs = useAllPairsFromTokens(tokens, sorobanContext);

  const [inputToken, setInputToken] = React.useState<TokenType|null>(null);
  const [outputToken, setOutputToken] = React.useState<TokenType | null>(null);
  const [token0, setToken0] = React.useState<TokenType | null>(null);
  const [token1, setToken1] = React.useState<TokenType | null>(null);
  const [inputTokenAmount, setInputTokenAmount] = React.useState(0);
  const [outputTokenAmount, setOutputTokenAmount] = React.useState(0);
  const [pairExist, setPairExist] = React.useState<boolean | undefined>(
    undefined,
  );
  const [pairAddress, setPairAddress] = React.useState<string | undefined>(
    undefined,
  );
  const tokenBalancesResponse = useTokenBalances(sorobanContext.address??"", tokens);

  function getPairExists(token0: any, token1: any, allPairs: any) {

    return allPairs.some((pair: any) => {
      return (
        (pair.token_0 === token0 && pair.token_1 === token1) 
        ||(pair.token_0 === token1 && pair.token_1 === token0)
      );
    });
  }

  React.useEffect(() => {
    // Code to run when the component mounts or specific dependencies change
    setPairExist(getPairExists(inputToken, outputToken, allPairs));

    let selectedPair = allPairs.find((pair: any) => {
      return (
        (pair.token_0.address === inputToken?.address &&
        pair.token_1.address === outputToken?.address) 
        || (pair.token_1.address === inputToken?.address &&
          pair.token_0.address === outputToken?.address)
      );
    });
    if (selectedPair) setPairAddress(selectedPair.pair_address);

    
  }, [inputToken, outputToken, allPairs]); // Dependencies array

  const handleInputTokenChange = (
    event: React.ChangeEvent<{ value: string }>,
  ) => {
    const token = tokens.find(
      (token) => token.symbol === event.target.value,
    );
    setInputToken(token!);
    setInputTokenAmount(0);
    setOutputTokenAmount(0);
  };
  const handleOutputTokenChange = (
    event: React.ChangeEvent<{ value: string }>,
  ) => {
    const token =
      tokens.find((token) => token.symbol === event.target.value) ?? null;
    setOutputToken(token);
    setInputTokenAmount(0);
    setOutputTokenAmount(0);
  };

  const reserves = useReservesBigNumber(pairAddress??"", sorobanContext);

  const handleInputTokenAmountChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setInputTokenAmount(event.target.valueAsNumber);
    if (isLiquidity && reserves.reserve0.isGreaterThan(0) && reserves.reserve1.isGreaterThan(0)) {
      let optimalLiquidityToken1Amount = calculatePoolTokenOptimalAmount(
        BigNumber(event.target.valueAsNumber).shiftedBy(7),
        token0?.address === inputToken?.address?reserves.reserve0:reserves.reserve1,
        token1?.address === outputToken?.address?reserves.reserve1:reserves.reserve0,
      );

      setOutputTokenAmount(optimalLiquidityToken1Amount.decimalPlaces(0).shiftedBy(-7).toNumber());
    }
    if (!isLiquidity) {
      let output = fromExactInputGetExpectedOutput(
        BigNumber(event.target.valueAsNumber).shiftedBy(7), 
        token0?.address === inputToken?.address?reserves.reserve0:reserves.reserve1,
        token1?.address === outputToken?.address?reserves.reserve1:reserves.reserve0,
        )
      // The "stroops" calculated amount (from fromExactInputGetExpectedOutput) needs to be transformed to a human readeble number
      // this is why it is shiftwd by -7
      setOutputTokenAmount(BigNumber(output).decimalPlaces(0).shiftedBy(-7).toNumber())
    }
  };

  const handleOutputTokenAmountChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setOutputTokenAmount(event.target.valueAsNumber);
    if (isLiquidity && reserves.reserve0.isGreaterThan(0) && reserves.reserve1.isGreaterThan(0)) {
      let optimalLiquidityToken0Amount = calculatePoolTokenOptimalAmount(
        BigNumber(event.target.valueAsNumber).shiftedBy(7),
        token0?.address === inputToken?.address?reserves.reserve1:reserves.reserve0,
        token1?.address === outputToken?.address?reserves.reserve0:reserves.reserve1,
      );
      setInputTokenAmount(optimalLiquidityToken0Amount.decimalPlaces(0).shiftedBy(-7).toNumber());
    }
    if (!isLiquidity) {
      let output = fromExactOutputGetExpectedInput(
        BigNumber(event.target.valueAsNumber).shiftedBy(7), 
        token0?.address === inputToken?.address?reserves.reserve0:reserves.reserve1,
        token1?.address === outputToken?.address?reserves.reserve1:reserves.reserve0,
        )
      setInputTokenAmount(BigNumber(output).decimalPlaces(0).shiftedBy(-7).toNumber())
    }
  };
  let inputTokenBalance = tokenBalancesResponse.balances.find((token) => token.address === inputToken?.address)?.balance 
  return (
    <div>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Box sx={{display: "flex", flexDirection: "column", margin:"10px" }}>
          <TokensDropdown
            tokens={tokens.filter((token) => token.symbol !== outputToken?.symbol)}
            onChange={handleInputTokenChange}
            title={"Input token"}
          />
          {pairExist ? (
            <FormControl>
              <InputLabel htmlFor="outlined-adornment-amount">
                Amount Input
              </InputLabel>

              <OutlinedInput
                type="number"
                id="outlined-adornment-amount"
                startAdornment={
                  <InputAdornment position="start">
                    {inputToken?.name}
                  </InputAdornment>
                }
                value={inputTokenAmount}
                label={"Amount"}
                onChange={handleInputTokenAmountChange}
              />
            </FormControl>
          ) : null}
          <p>balance: {inputToken !== null ? inputTokenBalance : 0}</p>
        </Box>
        {(parseFloat(inputTokenBalance??"0"))!==0?<div>
        <Box sx={{display: "flex", flexDirection: "column", margin:"10px" }}>
          <TokensDropdown
            tokens={!isLiquidity?tokens.filter((token) => getPairExists(inputToken, token, allPairs)):tokens.filter((token) => token.symbol !== inputToken?.symbol)}
            onChange={handleOutputTokenChange}
            title={"Output token"}
            inputToken={inputToken??undefined}
          />
          {pairExist ?(
            <FormControl>
              <InputLabel htmlFor="outlined-adornment-amount">
                Amount Output
              </InputLabel>
              <OutlinedInput
                type="number"
                id="outlined-adornment-amount"
                startAdornment={
                  <InputAdornment position="start">
                    {outputToken?.name}
                  </InputAdornment>
                }
                value={outputTokenAmount}
                label="Amount"
                onChange={handleOutputTokenAmountChange}
              />
            </FormControl>
          ) : null}
           <p>balance: {outputToken !== null ? tokenBalancesResponse.balances.find((token) => token.address === outputToken.address)?.balance : 0}</p>
        </Box>
        {isLiquidity && pairExist && outputToken && inputToken && pairAddress && (
            <ProvideLiquidityPair
              sorobanContext={sorobanContext}
              pairAddress={pairAddress}
              inputTokenAmount={inputTokenAmount}
              outputTokenAmount={outputTokenAmount}
              setToken0={setToken0}
              setToken1={setToken1}
              token0={token0}
              token1={token1}
              inputToken={inputToken}
              outputToken={outputToken}
            />
          )}
        {!isLiquidity && pairExist && outputToken && inputToken && pairAddress &&
          <ProvideSwapPair
            sorobanContext={sorobanContext}
            pairAddress={pairAddress}
            inputTokenAmount={inputTokenAmount}
            outputTokenAmount={outputTokenAmount}
            setToken0={setToken0}
            setToken1={setToken1}
            token0={token0}
            token1={token1}
            inputToken={inputToken}
            outputToken={outputToken}

          />
        }
        {outputToken && inputToken && !pairExist && isLiquidity && <div>
            <p>Pair does not exist</p>
            <CreatePairButton
              token0={inputToken}
              token1={outputToken}
              sorobanContext={sorobanContext}
            /></div> 
        }
    </div>:<p> You do not have enough balance to trade this token</p>}
      </Box>
    </div>
  );
}
