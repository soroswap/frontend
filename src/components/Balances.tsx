import { Typography } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { useSorobanReact } from "utils/packages/core/src";
import { tokenBalances, useTokenBalances } from "../hooks/useBalances";
import { useTokens } from "../hooks/useTokens";
import { TokenType } from "../interfaces";

export function Balances() {
  const sorobanContext = useSorobanReact();
  const tokens = useTokens(sorobanContext);

  if (sorobanContext.activeChain) {
    tokenBalances(sorobanContext?.address ?? "", tokens, sorobanContext).then((resp) => {
      console.log("tokenBalances",resp)
    })
  }

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

  return (
    <>
      {tokenBalancesResponse.balances?.map((useTokenBalance) => (
        <p key={useTokenBalance.address}>
          {useTokenBalance.symbol} : {useTokenBalance.balance}
        </p>
      ))}
    </>
  );
};
