import { Typography } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { useSorobanReact } from "@soroban-react/core";
import { tokenBalances } from "hooks";
import { useEffect, useState } from "react";
import { useTokens } from "../hooks/useTokens";

export function Balances() {
  const sorobanContext = useSorobanReact();
  const tokens = useTokens(sorobanContext);

  // State to hold token balances
  const [tokenBalancesResponse, setTokenBalancesResponse] = useState<any[]>([]);

  // Effect to fetch token balances
  useEffect(() => {
    if (sorobanContext.activeChain && sorobanContext.address && tokens.length > 0) {
      tokenBalances(sorobanContext.address, tokens, sorobanContext).then((resp) => {
        setTokenBalancesResponse(resp);
      });
    }
  }, [sorobanContext, tokens]);

  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Balances
        </Typography>
        {sorobanContext.address && tokens.length > 0 ? (
          <>
            {tokenBalancesResponse.balances?.map((useTokenBalance) => (
              <p key={useTokenBalance.address}>
                {useTokenBalance.symbol} : {useTokenBalance.balance}
              </p>
            ))}
          </>
        ) : (
          <div>Connect your Wallet</div>
        )}
      </CardContent>
    </Card>
  );
}
