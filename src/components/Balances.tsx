import React, { FunctionComponent } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { Typography } from "@mui/material";
import { useSorobanReact } from "@soroban-react/core";
import { useTokenBalances } from "../hooks/useBalances";
import { useTokens } from "../hooks/useTokens";
import { TokenType } from "../interfaces";

export function Balances() {
  const sorobanContext = useSorobanReact();
  const tokens = useTokens(sorobanContext);
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Balances
        </Typography>
        {sorobanContext.address && tokens.length > 0 ? (
          <WalletBalances address={sorobanContext.address} tokens={tokens} />
        ) : (
          <div>Connect your Wallet</div>
        )}
      </CardContent>
    </Card>
  );
}

interface WalletBalancesProps {
  address: string;
  tokens: TokenType[];
}

const WalletBalances = ({ address, tokens }: WalletBalancesProps) => {
  let tokenBalancesResponse;
  tokenBalancesResponse = useTokenBalances(address, tokens);
  console.log(
    "🚀 ~ file: Balances.tsx:42 ~ WalletBalances ~ tokenBalancesResponse:",
    tokenBalancesResponse,
  );

  return (
    <>
      {tokenBalancesResponse?.map((useTokenBalance) => (
        <p key={useTokenBalance.address}>
          {useTokenBalance.symbol} : {useTokenBalance.balance}
        </p>
      ))}
    </>
  );
};
