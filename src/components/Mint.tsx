import React, { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import { Typography } from "@mui/material";
import { SorobanContextType, useSorobanReact } from "@soroban-react/core";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";

import BigNumber from "bignumber.js";
import { MintButton } from "../components/Buttons/MintButton";
import { useTokens } from "../hooks/useTokens";
import { TokenType } from "../interfaces";
import { useFormattedTokenBalance } from "../hooks";

export function Mint() {
  const sorobanContext: SorobanContextType = useSorobanReact();
  const tokensList = useTokens(sorobanContext);

  const [inputToken, setInputToken] = useState<TokenType>();
  const [mintTokenId, setMintTokenId] = useState<string>("");
  const [amount, setAmount] = useState(BigNumber(0));

  const handleInputTokenChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedToken = tokensList.find(
      (token) => token.symbol == event.target.value,
    );

    if (selectedToken) {
      setInputToken(selectedToken);
      setMintTokenId(selectedToken.address);
    }
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(BigNumber(event.target.value));
  };

  useEffect(() => {
    setInputToken(tokensList[0]);
    setMintTokenId(tokensList[0]?.address);
  }, [tokensList]);

  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Mint
        </Typography>
        {sorobanContext.address ? (
          <div>
            <TextField
              id="outlined-select-currency"
              select
              label="Token to Mint"
              defaultValue="AAAA"
              onChange={handleInputTokenChange}
            >
              {tokensList.map((option) => (
                <MenuItem key={option.address} value={option.symbol}>
                  {`${option.name} (${option.symbol})`}
                </MenuItem>
              ))}
            </TextField>
            <FormControl>
              <InputLabel htmlFor="outlined-adornment-amount">
                Amount to Mint
              </InputLabel>
              <OutlinedInput
                type="number"
                id="outlined-adornment-amount"
                onChange={handleAmountChange}
                startAdornment={
                  <InputAdornment position="start">
                    {inputToken?.symbol}
                  </InputAdornment>
                }
                label="Amount"
              />
            </FormControl>
            {inputToken && (
              <MintTokens
                sorobanContext={sorobanContext}
                address={sorobanContext.address}
                inputToken={inputToken}
                amountToMint={amount}
              />
            )}
          </div>
        ) : (
          <div>Connect your Wallet</div>
        )}
      </CardContent>
    </Card>
  );
}

export function MintTokens({
  sorobanContext,
  address,
  inputToken,
  amountToMint,
}: {
  sorobanContext: SorobanContextType;
  address: string;
  inputToken: TokenType;
  amountToMint: BigNumber;
}) {
  let formattedTokenBalance;
  formattedTokenBalance = useFormattedTokenBalance(
    inputToken.address,
    address,
  );
  

  return (
    <div>
      <p>
        Your current balance: {formattedTokenBalance} {inputToken.symbol}
      </p>
      <CardActions>
        <MintButton
          sorobanContext={sorobanContext}
          tokenId={inputToken.address}
          amountToMint={amountToMint}
        />
      </CardActions>
    </div>
  );
}
